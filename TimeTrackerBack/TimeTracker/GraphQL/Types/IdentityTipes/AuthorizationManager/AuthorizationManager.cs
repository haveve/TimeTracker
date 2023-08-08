using GraphQLParser;
using GraphQLParser.AST;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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

        public bool isValidAccessToken(string accessToken)
        {
            JwtSecurityToken objAccessToken = ReadJwtToken(accessToken);
            var date = objAccessToken.IssuedAt;

            int userId = int.Parse(objAccessToken.Claims.First(c => c.Type == "UserId").Value);
            DateTime? lastUserChanging = _authRepo.GetLastDateOfUserChanging(userId);

            if ((lastUserChanging != null
                || date > lastUserChanging) &&
                (objAccessToken.Issuer != _configuration["JWT:Author"] ||
                objAccessToken.Audiences.ToList().All(aud => aud != _configuration["JWT:Audience"])))
            {
                return false;
            }

            return true;
        }

        public JwtSecurityToken ReadJwtToken(string accessToken) => new JwtSecurityTokenHandler().ReadJwtToken(accessToken);

        public ValidateRefreshAndGetAccess ValidateRefreshAndGetAccessToken(string accessToken, string refreshToken)
        {

            JwtSecurityToken oldAccessToken = ReadJwtToken(accessToken);

            if (oldAccessToken.Issuer != _configuration["JWT:Author"] ||
                oldAccessToken.Audiences.ToList().All(aud => aud != _configuration["JWT:Audience"]))
            {
                return new ValidateRefreshAndGetAccess(null, false, "Expired access token is invalid");
            }

            int userId = int.Parse(oldAccessToken.Claims.First(c => c.Type == "UserId").Value);
            var savedToken = _authRepo.GetRefreshToken(refreshToken, userId);

            if (savedToken == null)
            {
                return new ValidateRefreshAndGetAccess(null, false, "Refresh token is invalid");
            }

            if (savedToken.ExpiresEnd < DateTime.Now)
            {
                _authRepo.DeleteRefreshToken(refreshToken);
                return new ValidateRefreshAndGetAccess(null, false, "Refresh token is expired");
            }
            var user = _userRepository.GetUser(userId);
            var newAccessToken = new JwtSecurityToken(
                issuer: _configuration["JWT:Author"],
                audience: _configuration["JWT:Audience"],
                claims: new[] {
            new Claim("UserId", user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
            new Claim("CRUDUsers",user.CRUDUsers.ToString()),
            new Claim("ViewUsers",user.ViewUsers.ToString()),
            new Claim("EditPermiters",user.EditPermiters.ToString()),
            new Claim("ImportExcel",user.ImportExcel.ToString()),
            new Claim("ControlPresence",user.ControlPresence.ToString()),
            new Claim("ControlDayOffs",user.ControlDayOffs.ToString()),
            new Claim("EditWorkHours",user.EditWorkHours.ToString())
                },
                expires: DateTime.UtcNow.Add(TimeSpan.FromSeconds(IAuthorizationManager.AccessTokenExpiration)),
                signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(_configuration["JWT:Key"]), SecurityAlgorithms.HmacSha256));




            return new ValidateRefreshAndGetAccess(new JwtSecurityTokenHandler().WriteToken(newAccessToken), true, null);

        }
    }
}
