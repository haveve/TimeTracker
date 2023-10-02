using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;
using Microsoft.CodeAnalysis;
using Microsoft.AspNetCore.Http.Extensions;
using Google.Apis.Util.Store;
using System.IO;
using TimeTracker.Repositories;
using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.WebUtilities;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;
using TimeTracker.Services.ForeignServiceAuth;
using TimeTracker.Helpers;
using TimeTracker.Models;
using static QRCoder.PayloadGenerator;

namespace TimeTracker.Controllers
{
    public class OAuth2Controller : Controller
    {

        [Route("foreign-service-auth")]
        public IActionResult ForeignServiceAuth([FromServices] IConfiguration config, [FromServices] OauthFactory oauthService, string serviceName)
        {

            IOauthService? service = oauthService.GetService(serviceName);

            if (service == null)
            {
                return Redirect("error?error=there is no specified service");
            }

            HttpContext.Response.Cookies.Append("serviceName", serviceName);

            string DomainName = "https://" + HttpContext.Request.Host.Value;
            string redirectUrl = DomainName + "/foreign-service-response";
            string googleRedirect = service.GenerateOAuthRequestUrl(redirectUrl, config[$"Secrets:{serviceName}:ClientId"]!);
            return Redirect(googleRedirect);
        }

        [Route("foreign-service-response")]
        public async Task<IActionResult> ForeignServiceResponse([FromServices] IConfiguration config, [FromServices] OauthFactory oauthService, [FromServices] IUserRepository userRepository, [FromServices] IAuthorizationManager authorizationManager, [FromServices] IAuthorizationRepository _authorizationRepository, string code)
        {
            string? value;

            if (!HttpContext.Request.Cookies.TryGetValue("serviceName", out value))
            {
                return Redirect("error?error=there is no specified service");
            }

            IOauthService? service = oauthService.GetService(value);

            if (service == null)
            {
                return Redirect("error?error=uncorrect login service");
            }

            string DomainName = "https://" + HttpContext.Request.Host.Value;
            string redirectUrl = DomainName + "/foreign-service-response";

            var googleTokens = await service.ExchangeCodeOnTokenAsync(code, redirectUrl, config[$"Secrets:{value}:ClientId"]!, config[$"Secrets:{value}:ClientSecret"]!);

            var email = await service.GetEmail(googleTokens.AccessToken);

            if (email == null)
            {
                return Redirect("error?error=you didn't grant permission on login provider settings for receiving your data");
            }

            var user = userRepository.GetUserByEmailOrLogin(email);

            if (user == null)
            {
                return Redirect("error?error=user does not exist");
            }


            if(user.Key2Auth != null)
            {
                var refresh_2f_tokens = authorizationManager.GetRefreshToken(user.Id);

                var tempToken = _2fAuthHelper.GetTemporaty2fAuthToken(user, refresh_2f_tokens, config["JWT:Author"], config["JWT:Audience"], config["JWT:Key"]);

                Dictionary<string, string?> tempQueryParams = new Dictionary<string, string?>
            {
                { "tempToken", tempToken }
            };

                return Redirect(QueryHelpers.AddQueryString("http://" + config["FrontDomain"]! + "/2f-auth", tempQueryParams));
            }

            var refresh_tokens = authorizationManager.GetRefreshToken(user.Id);
            _authorizationRepository.CreateRefreshToken(refresh_tokens, user.Id);

            Dictionary<string, string?> queryParams = new Dictionary<string, string?>
            {
                { "expiredAt", JsonSerializer.Serialize(refresh_tokens.expiredAt)},
                { "issuedAt", JsonSerializer.Serialize(refresh_tokens.issuedAt) },
                { "token", refresh_tokens.token }
            };

            var url = QueryHelpers.AddQueryString("http://" + config["FrontDomain"]! + "/Login", queryParams);

            return Redirect(url);
        }

        [Route("error")]
        public IActionResult Error(string error)
        {
            return BadRequest(error);
        }
    }
}
