using GraphQL;
using GraphQL.Types;
using Microsoft.AspNetCore.WebUtilities;
using TimeTracker.GraphQL.Types.IdentityTipes;
using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;
using TimeTracker.Helpers;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.Services;

namespace TimeTracker.GraphQL.Queries
{
    public class IdentityQuery : ObjectGraphType
    {
        private readonly IAuthorizationManager _authorizationManager;
        private readonly IAuthorizationRepository _authorizationRepository;
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        private readonly IEmailSender _emailSender;


        public IdentityQuery(IConfiguration configuration, IAuthorizationManager authorizationManager, IAuthorizationRepository authorizationRepository, IUserRepository userRepository, IEmailSender emailSender)
        {
            _authorizationManager = authorizationManager;
            _authorizationRepository = authorizationRepository;
            _configuration = configuration;
            _userRepository = userRepository;
            _emailSender = emailSender;

            Field<IdentityOutPutGraphType>("login")
                .Argument<NonNullGraphType<LoginInputGraphType>>("login")
            .Resolve(context =>
            {
                Login UserLogData = context.GetArgument<Login>("login");
                var userRepository = context.RequestServices.GetService<IUserRepository>();
                var config = context.RequestServices.GetService<IConfiguration>();

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

                if (user.Key2Auth != null)
                {
                    var refresh_2f_tokens = authorizationManager.GetRefreshToken(user.Id);

                    var tempToken = _2fAuthHelper.GetTemporaty2fAuthToken(user, refresh_2f_tokens, config["JWT:Author"], config["JWT:Audience"], config["JWT:Key"]);

                    Dictionary<string, string?> tempQueryParams = new Dictionary<string, string?>
            {
                { "tempToken", tempToken }
            };
                    return new LoginOutput()
                    {
                        access_token = null,
                        user_id = -1,
                        refresh_token = null,
                        redirect_url = QueryHelpers.AddQueryString("/2f-auth", tempQueryParams)
                    };

                }


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

            Field<StringGraphType>("sentResetPasswordEmail")
                .Argument<StringGraphType>("LoginOrEmail")
                .ResolveAsync(async context =>
                {
                    string LoginOrEmail = context.GetArgument<string>("LoginOrEmail");
                    User? user = _userRepository.GetUserByEmailOrLogin(LoginOrEmail);
                    if (user == null)
                        return "User was not found!";

                    //string code = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
                    string code = Guid.NewGuid().ToString();
                    _userRepository.UpdateUserResetCodeById(user.Id, code);

                    _emailSender.SendResetPassEmail(code, user.Email);

                    return "Email has sent!";
                });
            Field<StringGraphType>("resetUserPasswordByCode")
               .Argument<NonNullGraphType<StringGraphType>>("Code")
               .Argument<NonNullGraphType<StringGraphType>>("Password")
               .Argument<NonNullGraphType<StringGraphType>>("Email")
               .ResolveAsync(async context =>
               {
                   string code = context.GetArgument<string>("Code");
                   string password = context.GetArgument<string>("Password");
                   string email = context.GetArgument<string>("Email");
                   User? user = _userRepository.GetUserByEmailOrLogin(email);
                   if (user == null) return "User not found";
                   if (user.ResetCode == null) return "User was not requesting password change";
                   if (user.ResetCode != code) return "Reset code not match";

                   _userRepository.UpdateUserPasswordAndCode(user.Id, password);

                   return "Password reseted successfully";
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
}
