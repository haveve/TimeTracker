using System.Reflection;

namespace TimeTracker.Services.ForeignServiceAuth
{
    public class OauthFactory
    {
        private List<(string name, IOauthService service)> _oauthServices = new List<(string name, IOauthService service)>();

        public OauthFactory()
        {

        }

        public OauthFactory(List<(string name, IOauthService service)> initialServices)
        {
            _oauthServices = initialServices;
        }

        public void SetService<T>(string name) where T : class, IOauthService
        {
            if (_oauthServices.Any(s => s.name == name))
            {
                return;
            }

            var serviceInstance = Activator.CreateInstance(typeof(T).Assembly.FullName, typeof(T).FullName);

            _oauthServices.Add((name, (IOauthService)serviceInstance!.Unwrap()));
        }

        public IOauthService? GetService(string name)
        {
            return _oauthServices.FirstOrDefault(s => s.name == name).service;
        }
    }
}
