using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using TimeTracker.GraphQL.Queries;

namespace TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager
{
    public interface IAuthorizationManager
    {
        public const int RefreshTokenExpiration = 86400;
        public const int AccessTokenExpiration = 60;

        public string GetRefreshToken();
        public JwtSecurityToken ReadJwtToken(string accessToken);
        public ValidateRefreshAndGetAccess ValidateRefreshAndGetAccessToken(string accessToken,string refreshToken);
        public bool IsValidAccessToken(string accessToken);
        public StateOfRememberMe IsValidRememberMe(RememberMe rememberMe,string refreshToken, int userId);
        public string GetAccessToken(int userId);
    }
    public enum StateOfRememberMe
    {
        RefreshTokenDeprecated,
        RefreshTokensDoesnotMatched,
        InvalidRememberMeCookies,
        Success
    }
}
