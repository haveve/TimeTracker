using Microsoft.AspNetCore.WebUtilities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OAuthTutorial.Services
{
    public class GoogleOAuthService
    {
        private const string OAuthServerEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";

        public static string GenerateOAuthRequestUrl(string scope, string redirectUrl,string ClientId)
        {
            var queryParams = new Dictionary<string, string>
            {
                {"client_id", ClientId},
                { "redirect_uri", redirectUrl },
                { "response_type", "code" },
                { "scope", scope },
                { "code_challenge_method", "S256" },
                { "access_type", "offline" }
            };

            var url = QueryHelpers.AddQueryString(OAuthServerEndpoint, queryParams);
            return url;
        }
    }
}
