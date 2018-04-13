﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using System.Net;
using Mable.Classes;
using System.IO;
using static Mable.Classes.Building;
using MoreLinq;
using static Mable.Classes.SearchResponse;
using System.Diagnostics;
using System.Device.Location;
using System.Data.Entity;
using Quartz;
using System.Threading.Tasks;
using Quartz.Impl;

namespace Mable.Controllers
{
   //[Authorize]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Search()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult SearchResult(string keyword)
        {
            ViewBag.searchKeyWord = keyword;
            ViewBag.HasResult = true;

            

            //UpdateDBNow();
            

            var db = new BuildingContext();
            var query = from b in db.Buildinginfoes select b;
            List<Buildinginfo> buildings = query.ToList();
            Debug.WriteLine("HELLO" + buildings.Count());
            

            /*
             Get the search result from Google Place API
             Centre: Melbourne CBD
             Distance: 14 km
             */
            var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" +
                keyword + "&location=-37.808163434,144.957829502&radius=14000&region=au&key=AIzaSyDvXKR7iiGAvHykADgGEOxuurUSr4ukJ08";
            var jsonString = Download_JSON(url);
            //Debug.WriteLine(jsonString);
            var searchResponse = JsonConvert.DeserializeObject<SearchResponse.RootObject>(jsonString);
            SearchResponse.Result[] searchResult = searchResponse.results;
            if (searchResult.Length == 0)
            {
                ViewBag.HasResult = false;
            }
            /*
             For each search result, get the detail from Google Detail API
             */
            List<PlaceDetail.Result> place_details = new List<PlaceDetail.Result>();
            foreach (Result r in searchResult)
            {
                var place_id = r.place_id;
                url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" +
                    place_id + "&key=AIzaSyDvXKR7iiGAvHykADgGEOxuurUSr4ukJ08";
                jsonString = Download_JSON(url);
                //Debug.WriteLine(jsonString);
                var detailResponse = JsonConvert.DeserializeObject<PlaceDetail.Rootobject>(jsonString);
                PlaceDetail.Result detailResult = detailResponse.result;
                if (r.photos != null)
                {
                    detailResult.photo_reference = r.photos[0].photo_reference;
                }

                //Debug.WriteLine(detailResult.name);

                foreach (Buildinginfo b in buildings)
                {
                    if (b.x_coordinate != null && b.y_coordinate != null)
                    {
                        if (Has_Accessible_Info(float.Parse(b.y_coordinate), float.Parse(b.x_coordinate),
                    detailResult.geometry.location.lat, detailResult.geometry.location.lng))
                        {
                            detailResult.accessibility_rating = b.accessibility_rating;
                            detailResult.accessibility_description = b.accessibility_type_description;
                            break;
                        }
                        else
                        {
                            detailResult.accessibility_rating = "N/A";
                            detailResult.accessibility_description = "N/A";
                        }
                    }

                }
                place_details.Add(detailResult);

                // sort by accessibility rating first, then sort by rating
                place_details = place_details.OrderBy(p => p.accessibility_rating, new CustomComparer()).
                    ThenByDescending(p => p.rating).ToList();

            }
            TempData["place_details"] = place_details;

            // Uncomment this to enable paged display
            // Also need to modify view

            //int pageNumber = (page ?? 1);
            //int pageSize = 10;
            //return View(place_details.ToPagedList(pageNumber, pageSize));
            return View(place_details);
        }

        public ActionResult Map()
        {
            return View();
        }

        public ActionResult ResultDetail(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            List<PlaceDetail.Result> place_details = (List<PlaceDetail.Result>)TempData["place_details"];
            TempData["place_details"] = place_details;
            PlaceDetail.Result detail = place_details.Where(d => d.id == id).First();
            if (detail == null)
            {
                return HttpNotFound();
            }


            return View(detail);
        }

        public static string Download_JSON(string url)
        {
            WebClient client = new WebClient();
            string JSONstring = client.DownloadString(url);
            return JSONstring;
        }

        public Boolean Has_Accessible_Info(float lat1, float lng1, float lat2, float lng2)
        {
            var point1 = new GeoCoordinate(lat1, lng1);
            var point2 = new GeoCoordinate(lat2, lng2);
            var distance = point1.GetDistanceTo(point2);
            if (distance < 10)
            {
                return true;
            }
            return false;
        }

        // Custom sort method to sort the number first then string
        public class CustomComparer : IComparer<string>
        {
            public int Compare(string x, string y)
            {
                int xVal, yVal;
                var xIsVal = int.TryParse(x, out xVal);
                var yIsVal = int.TryParse(y, out yVal);
                if (xIsVal && yIsVal)
                {
                    // descending order
                    return yVal.CompareTo(xVal);
                }
                if (!xIsVal && !yIsVal)
                {
                    return x.CompareTo(y);
                }
                if (xIsVal)
                {
                    return -1;
                }
                return 1;
            }
        }

        public class BuildingContext : DbContext
        {
            public BuildingContext(): base("DefaultConnection")
            {
                
            }
            public DbSet<Buildinginfo> Buildinginfoes { get; set; }
        }

        public List<Buildinginfo> Get_Buildings()
        {
            var url = "https://data.melbourne.vic.gov.au/resource/q8hp-qgps.json";
            var jsonString = Download_JSON(url);
            List<Buildinginfo> buildings = new List<Buildinginfo>();
            buildings = JsonConvert.DeserializeObject<
                List<Buildinginfo>>(jsonString);

            //Debug.WriteLine("Count: " + buildings.Count);
            //Buildinginfo b = buildings[0];
            //Debug.WriteLine("Building 1: " + b.suburb);

            //remove null rateings & duplicate records
            buildings = buildings.Where(b => b.accessibility_rating != null).ToList();
            buildings = buildings.DistinctBy(b => b.property_id).ToList();

            return buildings;
        }

        public void UpdateDBNow()
        {
            var db = new BuildingContext();
            List<Buildinginfo> buildings = Get_Buildings();

            db.Database.ExecuteSqlCommand("TRUNCATE TABLE Buildinginfoes");
            foreach (Buildinginfo b in buildings)
            {
                db.Buildinginfoes.Add(b);
            }
            db.SaveChanges();
        }
    }
}