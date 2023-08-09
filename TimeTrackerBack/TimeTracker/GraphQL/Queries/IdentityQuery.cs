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
                var permissions = userRepository.GetUserPermissions(user.Id);
                if (user == null)
                {
                    throw new Exception("User does not exist");
                }

                if(user.Enabled != true)
                {
                    context.Errors.Add(new ExecutionError("User was disabled"));
                    return null;
                }
                var jwt = new JwtSecurityToken(
                issuer: configuration["JWT:Author"],
                audience: configuration["JWT:Audience"],
                claims: new[] {

            new Claim("LoginOrEmail", UserLogData.LoginOrEmail),
            new Claim("UserId", user.Id.ToString()),
            new Claim("CRUDUsers",permissions.CRUDUsers.ToString()),
            new Claim("ViewUsers",permissions.ViewUsers.ToString()),
            new Claim("EditPermiters",permissions.EditPermiters.ToString()),
            new Claim("ImportExcel",permissions.ImportExcel.ToString()),
            new Claim("ControlPresence",permissions.ControlPresence.ToString()),
            new Claim("ControlDayOffs",permissions.ControlDayOffs.ToString()),
            new Claim("EditWorkHours",permissions.EditWorkHours.ToString())
                },
                expires: DateTime.UtcNow.Add(TimeSpan.FromDays(365)),
                signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(configuration["JWT:Key"]), SecurityAlgorithms.HmacSha256));

                var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

                var response = new LoginOutput()
                {
                    access_token = encodedJwt,
                    user_id = user.Id
                };

                //HttpContext.Response.Cookies.Append("gdfg", "gdfdgdf", new()
                //{
                //    SameSite = SameSiteMode.None,
                //    Secure = true,
                //});

                return response;
            });
        }
    }
}
