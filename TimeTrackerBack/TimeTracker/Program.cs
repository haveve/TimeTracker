using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;
using System.Net;
using GraphQL;
using Microsoft.AspNetCore.Builder;
using GraphQL.Introspection;
using Newtonsoft.Json.Linq;
using GraphQL.Types;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using GraphQL.MicrosoftDI;
using TimeTracker.GraphQL.Schemas;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using TimeTracker.Repositories;
using Microsoft.AspNetCore.Antiforgery;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Azure.Core;

var builder = WebApplication.CreateBuilder(args);

//Dapper
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddTransient<IUserRepository, UserRepository>();
builder.Services.AddTransient<ITimeRepository, TimeRepository>();

//Token
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["JWT:Author"],
                ValidateAudience = true,
                ValidAudience = builder.Configuration["JWT:Audience"],
                ValidateLifetime = false,
                IssuerSigningKey = AuthOptions.GetSymmetricSecurityKey(builder.Configuration["JWT:Key"]),
                ValidateIssuerSigningKey = true,
            };
        });
builder.Services.AddAuthorization();

builder.Services.AddControllers();

//CORS
builder.Services.AddCors();

builder.Services.AddHttpContextAccessor();

builder.Services.AddAntiforgery(opt =>
{
    opt.HeaderName = "X-XSRF-TOKEN";
    opt.Cookie.Name = "X-XSRF-TOKEN-Cookie";
    opt.Cookie.SameSite = SameSiteMode.None;
    opt.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    opt.Cookie.Path = "/";
});

builder.Services.AddSingleton<ISchema, UserShema>(services =>
{
    var scheme = new UserShema(new SelfActivatingServiceProvider(services));
    scheme.AuthorizeWithPolicy("Authorized");
    scheme.Mutation!.Fields.First(f=>f.Name=="user").AuthorizeWithPolicy("CRUDUsers");
    return scheme;
});

builder.Services.AddSingleton<ISchema, IdentitySchema>(services =>
{
    var scheme = new IdentitySchema(new SelfActivatingServiceProvider(services));
    return scheme;
});

builder.Services.AddGraphQL(c => c.AddSystemTextJson()
                                  .AddSchema<UserShema>()
                                  .AddSchema<IdentitySchema>()
                                  .AddAuthorization(setting =>
                                  {
                                      setting.AddPolicy("CRUDUsers", p => p.RequireClaim("CRUDUsers", "True"));
                                      setting.AddPolicy("ViewUsers", p => p.RequireClaim("ViewUsers", "True"));
                                      setting.AddPolicy("EditPermiters", p => p.RequireClaim("EditPermiters", "True"));
                                      setting.AddPolicy("ImportExcel", p => p.RequireClaim("ImportExcel", "True"));
                                      setting.AddPolicy("ControlPresence", p => p.RequireClaim("ControlPresence", "True"));
                                      setting.AddPolicy("EditWorkHours", p => p.RequireClaim("EditWorkHours", "True"));
                                      setting.AddPolicy("ControlDayOffs", p => p.RequireClaim("ControlDayOffs", "True"));
                                      setting.AddPolicy("Authorized", p => p.RequireAuthenticatedUser());
                                  })
                                  .AddGraphTypes(typeof(UserShema).Assembly)
                                  .AddGraphTypes(typeof(IdentitySchema).Assembly)
                                  );


var app = builder.Build();

app.UseCors(builder => builder.WithOrigins("http://localhost:3000")
                 .AllowAnyHeader()
                 .WithMethods("POST")
                 .AllowCredentials());

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseCookiePolicy(new CookiePolicyOptions
{
    MinimumSameSitePolicy = SameSiteMode.None,
    Secure = CookieSecurePolicy.Always,
});

app.UseGraphQL<UserShema>("/graphql", (config) =>
{

});

app.UseGraphQL<IdentitySchema>("/graphql-login", (config) =>
{

});
app.UseGraphQLAltair();

app.Run();

public class AuthOptions
{
    public static SymmetricSecurityKey GetSymmetricSecurityKey(string KEY) =>
        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(KEY));
}