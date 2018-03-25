using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mable.Classes
{
    public class Building
    {

        public class Buildinginfo
        {
            public string accessibility_rating { get; set; }
            public string accessibility_type { get; set; }
            public string accessibility_type_description { get; set; }
            public string base_property_id { get; set; }
            public string block_id { get; set; }
            public string building_height_highest_floor { get; set; }
            public string building_name { get; set; }
            public string census_year { get; set; }
            public string construction_year { get; set; }
            public Location location { get; set; }
            public string predominant_space_use { get; set; }
            public string property_id { get; set; }
            public string refurbished_year { get; set; }
            public string street_address { get; set; }
            public string suburb { get; set; }
            public string x_coordinate { get; set; }
            public string y_coordinate { get; set; }
        }

        public class Location
        {
            public string type { get; set; }
            public float[] coordinates { get; set; }
        }

    }
}