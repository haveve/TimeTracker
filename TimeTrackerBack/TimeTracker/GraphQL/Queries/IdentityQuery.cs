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
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using Newtonsoft.Json;
using Azure.Core;

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
            .Resolve(context =>
            {
                Login UserLogData = context.GetArgument<Login>("login");
                var userRepository = context.RequestServices.GetService<IUserRepository>();

                var user = userRepository.GetUserByCredentials(UserLogData.LoginOrEmail, UserLogData.Password);
                if (user == null)
                {
                    throw new Exception("User does not exist");
                }
                var permissions = userRepository.GetUserPermissions(user.Id);
                if (user.Enabled != true)
                {
                    context.Errors.Add(new ExecutionError("User was disabled"));
                    return null;
                }
                var encodedJwt = _authorizationManager.GetAccessToken(user.Id);

                var refreshToken = _authorizationManager.GetRefreshToken(user.Id);
                _authorizationRepository.CreateRefreshToken(refreshToken, user.Id);

                var response = new LoginOutput()
                {
                    access_token = encodedJwt,
                    user_id = user.Id,
                    refresh_token = refreshToken,
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

                    var refreshToken = httpContext.Request.Headers.First(at => at.Key == "refresh_token").Value[0]!;

                    if (refreshToken == null)
                    {
                        return ExpiredSessionError(context);
                    }

                    var whetherValid = _authorizationManager.ValidateRefreshAndGetAccessToken(refreshToken);

                    if (!whetherValid.isValid)
                    {
                        _authorizationRepository.DeleteRefreshToken(refreshToken);
                        return ExpiredSessionError(context);
                    }

                    int userId = int.Parse(_authorizationManager.ReadJwtToken(refreshToken).Claims.First(c => c.Type == "UserId").Value);
                    var newRefreshToken = _authorizationManager.GetRefreshToken(userId);

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

        public LoginOutput ExpiredSessionError(IResolveFieldContext<object?> context)
        {
            context.Errors.Add(new ExecutionError("User does not auth"));
            return new LoginOutput()
            {
                access_token = new("",new DateTime(),new DateTime()),
                user_id = 0,
                refresh_token = new("Your session was expired. Please, login again", new DateTime(), new DateTime()),
            };
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
