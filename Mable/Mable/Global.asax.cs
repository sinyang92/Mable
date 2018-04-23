using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Mable.Classes;
using Quartz;
using Quartz.Impl;

namespace Mable
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            /*
             Use Quartz to run background job
             Update building dataset every 7 days
             */
            
            //ISchedulerFactory schedulerFactory = new StdSchedulerFactory();
            //IScheduler scheduler = schedulerFactory.GetScheduler();
            
            //IJobDetail job = JobBuilder.Create<UpdateDB>().WithIdentity("UpdateDB", "group1").Build();
            //ITrigger trigger = TriggerBuilder.Create().WithIdentity("UpdateDBTrigger", "group1").
            //    WithSchedule(CronScheduleBuilder.WeeklyOnDayAndHourAndMinute(DayOfWeek.Monday, 3, 0)).
            //    Build();

            //scheduler.ScheduleJob(job, trigger);
            //scheduler.Start();

        }
    }
}
