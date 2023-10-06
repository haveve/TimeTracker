using Microsoft.AspNetCore.WebUtilities;
using OAuthTutorial.Helpers;
using OAuthTutorial.Services;

namespace TimeTracker.Services.ForeignServiceAuth
{
    public class GithubOAuthService:IOauthService
    {
        private const string OAuthServerEndpoint = "https://github.com/login/oauth/authorize";
        private const string TokenServerEndpoint = "https://github.com/login/oauth/access_token";
        private const string EmailEndpoint = "https://api.github.com/user";

        public string GenerateOAuthRequestUrl(string redirectUrl, string ClientId)
        {
            var queryParams = new Dictionary<string, string>
            {
                {"client_id", ClientId},
                { "redirect_uri", redirectUrl },
                { "scope", "user:email" }
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
                { "redirect_uri", redirectUrl }
            };

            var headers = new Dictionary<string, string>
            {
                {"Accept","application/json" },
                {"User-Agent","TimeTracker" }
            };

            var tokenResult = await HttpClientHelper.SendPostRequest<TokenResult>(TokenServerEndpoint, authParams, headers);
            return tokenResult;
        }

        public async Task<string> GetEmail(string accessToken)
        {
            var headers = new Dictionary<string, string>
            {
                {"Accept","application/json" },
                {"User-Agent","TimeTracker" }
            };
            var response = await HttpClientHelper.SendGetRequest<IOauthService.GetEmailObject>(EmailEndpoint, new Dictionary<string, string>(), accessToken, headers);
            var email = response.email;
            return email;
        }
    }
}
