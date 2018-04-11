using MoreLinq;
using Newtonsoft.Json;
using Quartz;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using static Mable.Classes.Building;
using static Mable.Controllers.HomeController;

namespace Mable.Classes
{
    public class UpdateDB : IJob
    {
        public void Execute(IJobExecutionContext context)
        {
            Debug.WriteLine("Time to update!");
            var db = new BuildingContext();

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

            db.Database.ExecuteSqlCommand("TRUNCATE TABLE Buildinginfoes");
            foreach (Buildinginfo b in buildings)
            {
                db.Buildinginfoes.Add(b);
            }
            db.SaveChanges();
        }

    }
}