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

namespace TimeTracker.GraphQL.Queries
{
    public class IdentityQuery : ObjectGraphType
    {
        private readonly IAuthorizationManager _authorizationManager;
        private readonly IAuthorizationRepository _authorizationRepository;

        public IdentityQuery(IAuthorizationManager authorizationManager, IAuthorizationRepository authorizationRepository)
        {
            _authorizationManager = authorizationManager;
            _authorizationRepository = authorizationRepository;

            Field<IdentityOutPutGraphType>("login")
                .Argument<NonNullGraphType<LoginInputType>>("login")
            .Resolve(context =>
            {
                Login UserLogData = context.GetArgument<Login>("login");

                var configuration = context.RequestServices.GetService<IConfiguration>();
                var userRepository = context.RequestServices.GetService<IUserRepository>();

                var user = userRepository.GetUserByCredentials(UserLogData.LoginOrEmail, UserLogData.Password);
                var permissions = userRepository.GetUserPermissions(user.Id);
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
                issuer: configuration["JWT:Author"],
                audience: configuration["JWT:Audience"],
                claims: new[] {
            new Claim("UserId", user.Id.ToString()),
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
                signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(configuration["JWT:Key"]), SecurityAlgorithms.HmacSha256));
         
                

                var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

                var refreshToken = _authorizationManager.GetRefreshToken();
                _authorizationRepository.CreateRefreshToken(refreshToken, user.Id);

                var response = new LoginOutput()
                {
                    access_token = encodedJwt,
                    user_id = user.Id,
                    refresh_token = refreshToken
                    is_fulltimer = (user.WorkHours == 100)

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

                    var whetherValid = _authorizationManager.ValidateRefreshAndGetAccessToken(accessToken, refreshToken);

                    if (!whetherValid.isValid)
                    {
                        context.Errors.Add(new ExecutionError("User does not auth"));
                        return new LoginOutput()
                        {
                            access_token = "",
                            user_id = 0,
                            refresh_token = "Your session was expired. Please, login again",
                        };
                    }


                    int userId = int.Parse(_authorizationManager.ReadJwtToken(accessToken).Claims.First(c => c.Type == "UserId").Value);


                    var newRefreshToken = _authorizationManager.GetRefreshToken();
                    _authorizationRepository.UpdateRefreshToken(refreshToken, newRefreshToken, userId);

                    return new LoginOutput()
                    {
                        access_token = whetherValid.accessToken!,
                        user_id = userId,
                        refresh_token = newRefreshToken
                    };

                });

              Field<StringGraphType>("logout").
                Resolve((context) =>
                {
                    HttpContext httpContext = context.RequestServices!.GetService<IHttpContextAccessor>()!.HttpContext!;

                    var refreshToken = httpContext.Request.Headers.First(at => at.Key == "refresh_token").Value[0]!;

                    _authorizationRepository.DeleteRefreshToken(refreshToken);

                    return "Successfully";
                });
        }
    }
}
