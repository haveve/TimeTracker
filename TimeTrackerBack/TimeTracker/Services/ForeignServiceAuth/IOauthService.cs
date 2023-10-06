using OAuthTutorial.Services;

namespace TimeTracker.Services.ForeignServiceAuth
{
    public interface IOauthService
    {
        public record GetEmailObject(string email);
        public string GenerateOAuthRequestUrl(string redirectUrl, string ClientId);
        public Task<TokenResult> ExchangeCodeOnTokenAsync(string code, string redirectUrl, string ClientId, string ClientSecret);
        public Task<string> GetEmail(string accessToken);
    }
}
