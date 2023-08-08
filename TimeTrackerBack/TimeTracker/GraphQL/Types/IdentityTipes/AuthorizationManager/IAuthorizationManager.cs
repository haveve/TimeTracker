using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;

namespace TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager
{
    public interface IAuthorizationManager
    {
        public const int RefreshTokenExpiration = 604800;
        public const int AccessTokenExpiration = 60;

        public string GetRefreshToken();
        public JwtSecurityToken ReadJwtToken(string accessToken);
        public ValidateRefreshAndGetAccess ValidateRefreshAndGetAccessToken(string accessToken,string refreshToken);
        public bool isValidAccessToken(string accessToken);
    }
}
