using System.Reflection;

namespace TimeTracker.Services.ForeignServiceAuth
{
    public class OauthFactory
    {
        private Dictionary<string,IOauthService> _oauthServices = new();

        public OauthFactory()
        {

        }

        public OauthFactory(Dictionary<string, IOauthService> initialServices)
        {
            _oauthServices = initialServices;
        }

        public IOauthService? GetService(string name)
        {
            _oauthServices.TryGetValue(name, out IOauthService value);
            return value;
        }
    }
}
