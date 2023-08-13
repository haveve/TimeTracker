using GraphQL;
using GraphQL.MicrosoftDI;
using GraphQL.Types;
using GraphQL.Validation;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TimeTracker.GraphQL.Types.IdentityTipes;
using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;
using TimeTracker.Models;
using TimeTracker.Repositories;
using System.Text.Json;
using TimeTracker.GraphQL.Types.IdentityTipes.Encryption;
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using Newtonsoft.Json;

namespace TimeTracker.GraphQL.Queries
{
    public class IdentityQuery : ObjectGraphType
    {
        private readonly IAuthorizationManager _authorizationManager;
        private readonly IAuthorizationRepository _authorizationRepository;
        private readonly IConfiguration _configuration;

        public IdentityQuery(IConfiguration configuration, IAuthorizationManager authorizationManager, IAuthorizationRepository authorizationRepository)
        {
            _authorizationManager = authorizationManager;
            _authorizationRepository = authorizationRepository;
            _configuration = configuration;

            Field<IdentityOutPutGraphType>("login")
                .Argument<NonNullGraphType<LoginInputType>>("login")
                .Argument<NonNullGraphType<BooleanGraphType>>("rememberMe")
            .Resolve(context =>
            {
                Login UserLogData = context.GetArgument<Login>("login");
                var userRepository = context.RequestServices.GetService<IUserRepository>();

                var user = userRepository.GetUserByCredentials(UserLogData.LoginOrEmail, UserLogData.Password);
                if (user == null)
                {
                    throw new Exception("User does not exist");
                }

                if (user.Enabled != true)
                {
                    context.Errors.Add(new ExecutionError("User was disabled"));
                    return null;
                }

                var jwt = new JwtSecurityToken(
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

                var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

                var refreshToken = _authorizationManager.GetRefreshToken();
                _authorizationRepository.CreateRefreshToken(refreshToken, user.Id);

                var rememberMe = context.GetArgument<bool>("rememberMe");

                if (rememberMe)
                {
                    var httpContext = context.RequestServices.GetService<IHttpContextAccessor>()!.HttpContext;

                    RememberMe userRememberMe = new RememberMe();
                    userRememberMe.userPassword = user.Password;
                    userRememberMe.userEmail = user.Email;
                    userRememberMe.userRefreshToken = refreshToken;
                    userRememberMe.Expired = DateTimeOffset.UtcNow.AddDays(20).ToUnixTimeSeconds();

                    CookieOptions cookieOptions = new CookieOptions();
                    cookieOptions.Expires = DateTime.Now.AddDays(20);
                    cookieOptions.Secure = true;
                    cookieOptions.HttpOnly = true;

                    string stringToEncryption = JsonConvert.SerializeObject(userRememberMe);
                    string encryptedString = Encryption.Encrypt(stringToEncryption, _configuration["RememberMe:Key"]!);

                    httpContext!.Response.Cookies.Append("rememberMe", encryptedString, cookieOptions);
                }


                var response = new LoginOutput()
                {
                    access_token = encodedJwt,
                    user_id = user.Id,
                    refresh_token = refreshToken
                };

                //HttpContext.Response.Cookies.Append("gdfg", "gdfdgdf", new()
                //{
                //    SameSite = SameSiteMode.None,
                //    Secure = true,
                //});

                return response;
            });

            Field<IdentityOutPutGraphType>("refreshToken").
                Resolve((context) =>
                {
                    HttpContext httpContext = context.RequestServices!.GetService<IHttpContextAccessor>()!.HttpContext!;

                    var accessToken = httpContext.Request.Headers.First(at => at.Key == "access_token").Value[0]!;
                    var refreshToken = httpContext.Request.Headers.First(at => at.Key == "refresh_token").Value[0]!;

                    if (accessToken == null || refreshToken == null)
                    {
                        if(refreshToken != null)
                        {
                            _authorizationRepository.DeleteRefreshToken(refreshToken);
                        }

                        return ExpiredSessionError(context);
                    }

                    var rememberMeCookie = httpContext.Request.Cookies["rememberMe"];
                    var whetherValid = _authorizationManager.ValidateRefreshAndGetAccessToken(accessToken, refreshToken);
                    var newRefreshToken = _authorizationManager.GetRefreshToken();
                    int userId = int.Parse(_authorizationManager.ReadJwtToken(accessToken).Claims.First(c => c.Type == "UserId").Value);

                    if (!whetherValid.isValid)
                    {
                        if (rememberMeCookie == null)
                        {
                            _authorizationRepository.DeleteRefreshToken(refreshToken);
                            return ExpiredSessionError(context);
                        }

                        string decryptString = Encryption.Decrypt(rememberMeCookie, _configuration["RememberMe:Key"]!);
                        var rememberMe = JsonConvert.DeserializeObject<RememberMe>(decryptString);

                        if (rememberMe == null)
                        {
                            _authorizationRepository.DeleteRefreshToken(refreshToken);
                            return ExpiredSessionError(context);
                        }

                        var rememberMeValidateResult = _authorizationManager.IsValidRememberMe(rememberMe, refreshToken, userId);

                        switch(rememberMeValidateResult)
                        {
                            case StateOfRememberMe.RefreshTokensDoesnotMatched:
                            case StateOfRememberMe.InvalidRememberMeCookies:
                                httpContext.Response.Cookies.Delete("rememberMe");
                                _authorizationRepository.DeleteRefreshToken(refreshToken);
                                return ExpiredSessionError(context);
                            case StateOfRememberMe.RefreshTokenDeprecated:
                                _authorizationRepository.DeleteRefreshToken(refreshToken);
                                _authorizationRepository.CreateRefreshToken(newRefreshToken, userId);
                                break;
                        }
                    }

                    if(rememberMeCookie != null)
                    {
                        string decryptString = Encryption.Decrypt(rememberMeCookie, _configuration["RememberMe:Key"]!);
                        var rememberMe = JsonConvert.DeserializeObject<RememberMe>(decryptString);
                        AppendEncryptedCookie(rememberMe, newRefreshToken, httpContext);
                    }

                    _authorizationRepository.UpdateRefreshToken(refreshToken, newRefreshToken, userId);

                    return new LoginOutput()
                    {
                        access_token = whetherValid.accessToken?? _authorizationManager.GetAccessToken(userId),
                        user_id = userId,
                        refresh_token = newRefreshToken
                    };

                });

            Field<StringGraphType>("logout").
              Resolve((context) =>
              {
                  HttpContext httpContext = context.RequestServices!.GetService<IHttpContextAccessor>()!.HttpContext!;
                  httpContext.Response.Cookies.Delete("rememberMe");
                  var refreshToken = httpContext.Request.Headers.First(at => at.Key == "refresh_token").Value[0]!;

                  _authorizationRepository.DeleteRefreshToken(refreshToken);

                  return "Successfully";
              });

        }

        public LoginOutput ExpiredSessionError(IResolveFieldContext<object?> context)
        {
            context.Errors.Add(new ExecutionError("User does not auth"));
            return new LoginOutput()
            {
                access_token = "",
                user_id = 0,
                refresh_token = "Your session was expired. Please, login again",
            };
        }

        public void AppendEncryptedCookie(RememberMe rememberMe, string newRefreshToken, HttpContext context)
        {
            CookieOptions cookieOptions = new CookieOptions();
            cookieOptions.Expires = DateTime.Now.AddDays(20);
            cookieOptions.Secure = true;
            cookieOptions.HttpOnly = true;
            rememberMe.userRefreshToken = newRefreshToken;

            string stringToEncryption = JsonConvert.SerializeObject(rememberMe);
            string encryptedString = Encryption.Encrypt(stringToEncryption, _configuration["RememberMe:Key"]!);

            context.Response.Cookies.Append("rememberMe", encryptedString, cookieOptions);
        }
    }

    public class RememberMe
    {
        public string userEmail { get; set; }
        public string userPassword { get; set; }
        public string userRefreshToken { get; set; }
        public long Expired {get; set; }
    }
}
