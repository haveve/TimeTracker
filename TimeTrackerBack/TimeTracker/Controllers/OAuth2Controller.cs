using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;
using Microsoft.CodeAnalysis;
using Microsoft.AspNetCore.Http.Extensions;
using Google.Apis.Util.Store;
using System.IO;
using OAuthTutorial.Services;
using TimeTracker.Repositories;
using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.WebUtilities;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;

namespace TimeTracker.Controllers
{
    public class OAuth2Controller : Controller
    {

        [Route("google-auth")]
        public IActionResult GoogleAuth([FromServices] IConfiguration config)
        {

            string DomainName = "https://"+HttpContext.Request.Host.Value;
            string redirectUrl =DomainName+"/google-response";
            string googleRedirect =  GoogleOAuthService.GenerateOAuthRequestUrl("https://www.googleapis.com/auth/userinfo.email", redirectUrl, config["Secrets:Google:ClientId"]!);
            return Redirect(googleRedirect);
        }

        [Route("google-response")]
        public async Task<IActionResult> GoogleResponseAsync([FromServices] IConfiguration config,[FromServices] IUserRepository userRepository,[FromServices] IAuthorizationManager authorizationManager,[FromServices]IAuthorizationRepository _authorizationRepository, string code)
        {
            string DomainName = "https://" + HttpContext.Request.Host.Value;
            string redirectUrl = DomainName + "/google-response";

            var googleTokens = await GoogleOAuthService.ExchangeCodeOnTokenAsync(code, redirectUrl, config["Secrets:Google:ClientId"]!, config["Secrets:Google:ClientSecret"]!);

            var email = await UserLogin.GetEmail(googleTokens.AccessToken);

            var user = userRepository.GetUserByEmailOrLogin(email);

            if(user == null)
            {
                return BadRequest("User does not exist");
            }


            var refresh_tokens = authorizationManager.GetRefreshToken(user.Id);
            _authorizationRepository.CreateRefreshToken(refresh_tokens, user.Id);

            Dictionary<string, string> queryParams = new Dictionary<string, string>
            {
                { "expiredAt", JsonSerializer.Serialize(refresh_tokens.expiredAt)},
                { "issuedAt", JsonSerializer.Serialize(refresh_tokens.issuedAt) },
                { "token", refresh_tokens.token }
            };

            var url = QueryHelpers.AddQueryString("http://localhost:3000/Login", queryParams);

            return Redirect(url);
        }
    }
}
