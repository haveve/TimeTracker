using Microsoft.AspNetCore.WebUtilities;
using OAuthTutorial.Helpers;
using OAuthTutorial.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TimeTracker.Services.ForeignServiceAuth
{
    public class GoogleOAuthService:IOauthService
    {
        private const string OAuthServerEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
        private const string TokenServerEndpoint = "https://oauth2.googleapis.com/token";
        private const string EmailEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

        public string GenerateOAuthRequestUrl( string redirectUrl, string ClientId)
        {
            var queryParams = new Dictionary<string, string>
            {
                {"client_id", ClientId},
                { "redirect_uri", redirectUrl },
                { "response_type", "code" },
                { "scope", "email" },
                //{ "access_type", "offline" } for obtaining refresh token
            };

            var url = QueryHelpers.AddQueryString(OAuthServerEndpoint, queryParams!);
            return url;
        }

        public async Task<TokenResult> ExchangeCodeOnTokenAsync(string code, string redirectUrl, string ClientId, string ClientSecret)
        {
            var authParams = new Dictionary<string, string>
            {
                { "client_id", ClientId },
                { "client_secret", ClientSecret },
                { "code", code },
                { "grant_type", "authorization_code" },
                { "redirect_uri", redirectUrl }
            };

            var tokenResult = await HttpClientHelper.SendPostRequest<TokenResult>(TokenServerEndpoint, authParams);
            return tokenResult;
        }

        public async Task<string> GetEmail(string accessToken)
        {

            var response = await HttpClientHelper.SendGetRequest<IOauthService.GetEmailObject>(EmailEndpoint, new Dictionary<string, string>(), accessToken);
            var email = response.email;
            return email;
        }
    }
}
