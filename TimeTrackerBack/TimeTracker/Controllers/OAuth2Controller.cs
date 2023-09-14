using Microsoft.AspNetCore.Mvc;

namespace TimeTracker.Controllers
{
    public class OAuth2Controller: Controller
    {
        [Route("google-auth")]
        public IActionResult GoogleAuth()
        {
            Dictionary<string,string> keyValuePairs = new Dictionary<string, string>() { 
            };

            return Redirect("https://accounts.google.com/o/oauth2/auth");
        }
    }
}
