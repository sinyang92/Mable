using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using System.Net;
using Mable.Classes;
using System.IO;
using static Mable.Classes.Building;
using PagedList;
using MoreLinq;

namespace Mable.Controllers
{
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

        public ActionResult SearchResult(string keyword, int? page)
        {
            ViewBag.searchKeyWord = keyword;

            var url = "https://data.melbourne.vic.gov.au/resource/q8hp-qgps.json";
            var jsonString = Download_JSON(url);
            //jsonString = Clean_JSON(jsonString);
            //buildings = new List<Buildinginfo>();
            List<Buildinginfo> buildings = new List<Buildinginfo>();
            buildings = JsonConvert.DeserializeObject<
                List<Buildinginfo>>(jsonString);

            //Debug.WriteLine("Count: " + buildings.Count);
            //Buildinginfo b = buildings[0];
            //Debug.WriteLine("Building 1: " + b.suburb);

            //remove null rateings & duplicate records
            buildings = buildings.Where(b => b.accessibility_rating != null).ToList();
            buildings = buildings.DistinctBy(b => b.property_id).ToList();

            //filter by keyword
            /*
            if (!String.IsNullOrEmpty(keyword))
            {
                buildings = buildings.Where(b => b.building_name != null
                && b.building_name.ToLower().Contains(keyword.ToLower())).ToList();
            }
            */

            TempData["buildings"] = buildings;

            int pageNumber = (page ?? 1);
            int pageSize = 10;
            return View(buildings.ToPagedList(pageNumber, pageSize));
         }

        public string Download_JSON(string url)
        {
            WebClient client = new WebClient();
            string JSONstring = client.DownloadString(url);
            return JSONstring;
        }

        public string Clean_JSON(string JSONstring)
        {
            return JSONstring.Substring(1, JSONstring.Length - 2);
        }
    }
}