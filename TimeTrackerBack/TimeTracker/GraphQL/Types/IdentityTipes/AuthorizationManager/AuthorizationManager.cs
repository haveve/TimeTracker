using GraphQLParser;
using GraphQLParser.AST;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Security.Cryptography;
using TimeTracker.GraphQL.Queries;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Models;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager
{
    public record class ValidateRefreshAndGetAccess(string? accessToken, bool isValid, string? erroMessage);

    public class AuthorizationManager : IAuthorizationManager
    {
        public const int RefreshTokenExpiration = 604800;
        public const int AccessTokenExpiration = 60;

        public readonly IAuthorizationRepository _authRepo;
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        public AuthorizationManager(IUserRepository userRepository, IAuthorizationRepository authRepo, IConfiguration configuration)
        {
            _authRepo = authRepo;
            _configuration = configuration;
            _userRepository = userRepository;
        }

        public string GetRefreshToken()
        {
            var randomNumber = new byte[200];
            using var rng = RandomNumberGenerator.Create();

            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber) + Guid.NewGuid();
        }

        public bool IsValidAccessToken(string accessToken)
        {
            try
            {

                var tokenValidate = new JwtSecurityTokenHandler();

                tokenValidate.ValidateToken(accessToken, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JWT:Author"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["JWT:Audience"],
                    ValidateLifetime = true,
                    IssuerSigningKey = AuthOptions.GetSymmetricSecurityKey(_configuration["JWT:Key"]!),
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken securityToken);


                JwtSecurityToken objAccessToken = ReadJwtToken(accessToken);
                var date = objAccessToken.IssuedAt;

                int userId = int.Parse(objAccessToken.Claims.First(c => c.Type == "UserId").Value);
                DateTime? lastUserChanging = _authRepo.GetLastDateOfUserChanging(userId);

                if (lastUserChanging != null
                    && date < lastUserChanging)
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
            return true;
        }

        public StateOfRememberMe IsValidRememberMe(RememberMe rememberMe, string refreshToken, int userId)
        {
            var savedToken = _authRepo.GetRefreshToken(refreshToken, userId);

            if (savedToken == null)
            {
                return StateOfRememberMe.RefreshTokensDoesnotMatched;
            }

            var isMatchesRefeshes = savedToken!.Token == refreshToken
                && savedToken.Token == rememberMe.userRefreshToken
                && refreshToken == rememberMe.userRefreshToken;

            if (!isMatchesRefeshes)
            {
                return StateOfRememberMe.RefreshTokensDoesnotMatched;
            }

            var user = _userRepository.GetUserByCredentials(rememberMe.userEmail, rememberMe.userPassword, true);

            if (user == null || rememberMe.Expired < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            {
                return StateOfRememberMe.InvalidRememberMeCookies;
            }

            if (savedToken.ExpiresEnd < DateTime.Now)
            {
                return StateOfRememberMe.RefreshTokenDeprecated;
            }

            return StateOfRememberMe.Success;

        }

        public JwtSecurityToken ReadJwtToken(string accessToken) => new JwtSecurityTokenHandler().ReadJwtToken(accessToken);

        public ValidateRefreshAndGetAccess ValidateRefreshAndGetAccessToken(string accessToken, string refreshToken)
        {

            JwtSecurityToken oldAccessToken = ReadJwtToken(accessToken);

            int userId = int.Parse(oldAccessToken.Claims.First(c => c.Type == "UserId").Value);
            var savedToken = _authRepo.GetRefreshToken(refreshToken, userId);

            if (savedToken == null)
            {
                return new ValidateRefreshAndGetAccess(null, false, "Refresh token is invalid");
            }

            if (savedToken.ExpiresEnd < DateTime.Now)
            {
                return new ValidateRefreshAndGetAccess(null, false, "Refresh token is expired");
            }

            if (!IsValidAccessToken(accessToken))
            {
                return new ValidateRefreshAndGetAccess(null, false, "Access token is invalid");
            }


            return new ValidateRefreshAndGetAccess(GetAccessToken(userId), true, null);

        }

        public string GetAccessToken(int userId)
        {
            var permissions = _userRepository.GetUserPermissions(userId);
            var newAccessToken = new JwtSecurityToken(
    issuer: _configuration["JWT:Author"],
    audience: _configuration["JWT:Audience"],
    claims: new[] {
            new Claim("UserId", userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
            new Claim("CRUDUsers",permissions.CRUDUsers.ToString()),
            new Claim("ViewUsers",permissions.ViewUsers.ToString()),
            new Claim("EditPermiters",permissions.EditPermiters.ToString()),
            new Claim("ImportExcel",permissions.ImportExcel.ToString()),
            new Claim("ControlPresence",permissions.ControlPresence.ToString()),
            new Claim("ControlDayOffs",permissions.ControlDayOffs.ToString()),
            new Claim("EditWorkHours",permissions.EditWorkHours.ToString())
    },
    expires: DateTime.UtcNow.Add(TimeSpan.FromSeconds(IAuthorizationManager.AccessTokenExpiration)),
    signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(_configuration["JWT:Key"]), SecurityAlgorithms.HmacSha256));
           
            return new JwtSecurityTokenHandler().WriteToken(newAccessToken);
        }
    }
}
