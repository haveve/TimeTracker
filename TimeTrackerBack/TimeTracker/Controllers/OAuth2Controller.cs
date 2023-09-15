using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;
using Microsoft.CodeAnalysis;
using Microsoft.AspNetCore.Http.Extensions;
using OAuthTutorial.Services;

namespace TimeTracker.Controllers
{
    public class OAuth2Controller : Controller
    {

        [Route("google-auth")]
        public async Task<IActionResult> GoogleAuth([FromServices] IConfiguration config)
        {

            string DomainName = HttpContext.Request.Host.Value;
            string redirectUrl ="https://"+DomainName+"/google-response";

            string url = GoogleOAuthService.GenerateOAuthRequestUrl("",redirectUrl,config["Secrets:Google:ClientId"]!);
            
            return Redirect(url);
        }

        [Route("google-response")]
        public async Task<IActionResult> GoogleResponseHandler()
        {
            return Content(HttpContext.Request.QueryString.Value!+ HttpContext.Request.Headers+ HttpContext.Request.BodyReader);
        }
    }
}
