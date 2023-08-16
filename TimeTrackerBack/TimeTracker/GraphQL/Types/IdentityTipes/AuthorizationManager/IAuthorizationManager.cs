using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using TimeTracker.GraphQL.Queries;

namespace TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager
{
    public interface IAuthorizationManager
    {
        public const int RefreshTokenExpiration = 31536000;
        public const int AccessTokenExpiration = 60;

        public TokenResult GetRefreshToken(int userId);
        public JwtSecurityToken ReadJwtToken(string accessToken);
        public ValidateRefreshAndGetAccess ValidateRefreshAndGetAccessToken(string refreshToken);
        public bool IsValidToken(string token);
        public TokenResult GetAccessToken(int userId);
    }
    public enum StateOfRememberMe
    {
        RefreshTokenDeprecated,
        RefreshTokensDoesnotMatched,
        InvalidRememberMeCookies,
        Success
    }
}
