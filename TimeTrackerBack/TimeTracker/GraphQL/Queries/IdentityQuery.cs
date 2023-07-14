using GraphQL;
using GraphQL.Types;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TimeTracker.GraphQL.Types.IdentityTipes;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class IdentityQuery : ObjectGraphType
    {
        public IdentityQuery()
        {
            Field<IdentityOutPutGraphType>("login")
                .Argument<NonNullGraphType<LoginInputType>>("login")
            .Resolve(context =>
            {
                Login UserLogData = context.GetArgument<Login>("login");

                var configuration = context.RequestServices.GetService<IConfiguration>();
                var userRepository = context.RequestServices.GetService<IUserRepository>();

                var user = userRepository.GetUserByCredentials(UserLogData.LoginOrEmail, UserLogData.Password);

                Console.WriteLine(user);
                if (user == null)
                {
                    throw new Exception("User does not exist");
                }

                var jwt = new JwtSecurityToken(
                issuer: configuration["JWT:Author"],
                audience: configuration["JWT:Audience"],
                claims: new[] {

            new Claim("LoginOrEmail", UserLogData.LoginOrEmail),
            new Claim("UserId", user.Id.ToString()),
            new Claim("CRUDUsers",user.CRUDUsers.ToString()),
            new Claim("ViewUsers",user.ViewUsers.ToString()),
            new Claim("EditPermiters",user.EditPermiters.ToString()),
            new Claim("ImportExcel",user.ImportExcel.ToString()),
            new Claim("ControlPresence",user.ControlPresence.ToString()),
            new Claim("ControlDayOffs",user.ControlDayOffs.ToString())
                },
                expires: DateTime.UtcNow.Add(TimeSpan.FromDays(365)),
                signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(configuration["JWT:Key"]), SecurityAlgorithms.HmacSha256));

                var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

                var response = new LoginOutput()
                {
                    access_token = encodedJwt,
                    current_user = user
                };

                //HttpContext.Response.Cookies.Append("gdfg", "gdfdgdf", new()
                //{
                //    SameSite = SameSiteMode.None,
                //    Secure = true,
                //});

                return response;
            });
            Field<StringGraphType>("getToken")
                .Resolve(context =>
            {
                var httpContext = context.RequestServices!.GetService<IHttpContextAccessor>()!.HttpContext!;
                var forgeryService = context.RequestServices!.GetService<IAntiforgery>()!;

                var tokens = forgeryService.GetAndStoreTokens(httpContext);
                httpContext.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!,
                        new CookieOptions { HttpOnly = false });
                return "Successfully";
            }).AuthorizeWithPolicy("Authorized");
        }
    }
}
