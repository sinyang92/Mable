using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Mable.Startup))]
namespace Mable
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
