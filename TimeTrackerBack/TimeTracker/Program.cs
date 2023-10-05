using Azure;
using GraphQL;
using GraphQL.MicrosoftDI;
using GraphQL.Types;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using TimeTracker.GraphQL.Schemas;
using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using TimeTracker.GraphQL.Types.Vacation;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.Services;
using TimeTracker.Services.ForeignServiceAuth;
using static TimeTracker.Controllers.TestController;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();


//builder.Services.AddHostedService<BackgroundTasksService>();
//Dapper
builder.Services.AddSingleton<DapperContext>();

builder.Services.AddSingleton<OauthFactory>(new OauthFactory(new Dictionary<string, IOauthService>{
    { "Google",new GoogleOAuthService()},
    { "Github",new GithubOAuthService()}
}));

builder.Services.AddTransient<ITransactionService, TransactionService>();
builder.Services.AddSingleton<IEmailSender, EmailSender>();
builder.Services.AddSingleton<IExcelHandler, ExcelHandler>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<ITimeRepository, TimeRepository>();
builder.Services.AddSingleton<ICalendarRepository, CalendarRepository>();
builder.Services.AddSingleton<IVacationRepository, VacationRepository>();
builder.Services.AddSingleton<IAbsenceRepository, AbsenceRepository>();
builder.Services.AddSingleton<IAuthorizationRepository, AuthorizationRepository>();
builder.Services.AddSingleton<IUpdateRepository, UpdateRepository>();

builder.Services.AddSingleton<IAuthorizationManager, AuthorizationManager>();

//Token
builder.Services.AddAuthentication(opt =>
{
    opt.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddScheme<JwtBearerOptions, CustomJwtBearerHandler>(JwtBearerDefaults.AuthenticationScheme, options => { })
    .AddGoogle(options =>
    {
        IConfiguration config = builder.Configuration;
        options.ClientId = config["Secrets:Google:ClientId"]!;
        options.ClientSecret = config["Secrets:Google:ClientSecret"]!;
    });
//.AddJwtBearer(options =>
//{
//    options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuer = true,
//        ValidateAudience = true,
//        ValidateLifetime = true,
//        ValidateIssuerSigningKey = true,

//        ValidIssuer = builder.Configuration["JWT:Author"],
//        ValidAudience = builder.Configuration["JWT:Audience"],
//        IssuerSigningKey = AuthOptions.GetSymmetricSecurityKey(builder.Configuration["JWT:Key"]),
//        ClockSkew = TimeSpan.Zero
//    };
//});
builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();
//builder.Services.AddControllers();

//CORS
builder.Services.AddCors();

builder.Services.AddHttpContextAccessor();

builder.Services.AddSingleton<ISchema, UserShema>(services =>
{
    var scheme = new UserShema(new SelfActivatingServiceProvider(services));
    return scheme;
});

builder.Services.AddSingleton<ISchema, IdentitySchema>(services =>
{
    var scheme = new IdentitySchema(new SelfActivatingServiceProvider(services));
    return scheme;
});

builder.Services.AddMvc();

/*builder.Services.AddSingleton<ISchema, VacationSchema>(services =>
{
    var scheme = new VacationSchema(new SelfActivatingServiceProvider(services));
    return scheme;
});*/
builder.Services.AddSingleton<ObjectGraphType<VacationRequest>, VacationRequestType>();

builder.Services.AddGraphQL(c => c.AddSystemTextJson()
                                  .AddSchema<UserShema>()
                                  .AddSchema<IdentitySchema>()
                                  //.AddSchema<VacationSchema>()
                                  .AddAuthorization(setting =>
                                  {
                                      setting.AddPolicy("CRUDUsers", p => p.RequireClaim("CRUDUsers", "True"));
                                      setting.AddPolicy("ViewUsers", p => p.RequireClaim("ViewUsers", "True"));
                                      setting.AddPolicy("EditApprovers", p => p.RequireClaim("EditApprovers", "True"));
                                      setting.AddPolicy("ExportExcel", p => p.RequireClaim("ExportExcel", "True"));
                                      setting.AddPolicy("ControlPresence", p => p.RequireClaim("ControlPresence", "True"));
                                      setting.AddPolicy("EditWorkHours", p => p.RequireClaim("EditWorkHours", "True"));
                                      setting.AddPolicy("ControlDayOffs", p => p.RequireClaim("ControlDayOffs", "True"));
                                      setting.AddPolicy("Authorized", p => p.RequireAuthenticatedUser());
                                  })
                                  .AddGraphTypes(typeof(UserShema).Assembly)
                                  .AddGraphTypes(typeof(IdentitySchema).Assembly)
                                  //.AddGraphTypes(typeof(VacationSchema).Assembly)
                                  );


var app = builder.Build();

app.UseCors(builder => builder.WithOrigins("http://localhost:3000")
    //.AllowAnyOrigin()
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


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Download}/{id?}");

app.UseGraphQLAltair();

app.Run();

public class AuthOptions
{
    public static SymmetricSecurityKey GetSymmetricSecurityKey(string KEY) =>
        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(KEY));
}

public class CustomJwtBearerHandler : JwtBearerHandler
{
    private readonly IConfiguration _configuration;
    private readonly IAuthorizationManager _authorizationManager;

    public CustomJwtBearerHandler(IAuthorizationManager authorizationManager, IConfiguration configuration, IOptionsMonitor<JwtBearerOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock)
        : base(options, logger, encoder, clock)
    {
        _configuration = configuration;
        _authorizationManager = authorizationManager;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Get the token from the Authorization header

        if (!Context.Request.Headers.TryGetValue("Authorization", out var authorizationHeaderValues))
        {
            return AuthenticateResult.Fail("Authorization header not found.");
        }

        var authorizationHeader = authorizationHeaderValues.FirstOrDefault();
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            return AuthenticateResult.Fail("Bearer token not found in Authorization header.");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();
        var tokenData = _authorizationManager.ReadJwtToken(token);
        var isAccess = tokenData.Claims.FirstOrDefault(c=>c.Type == "IsAccess")?.Value;

        if (_authorizationManager.IsValidToken(token) && bool.TryParse(isAccess,out bool value) && value)
        {
            var principal = new ClaimsPrincipal(new ClaimsIdentity(tokenData.Claims, "Token"));
            return AuthenticateResult.Success(new AuthenticationTicket(principal, "CustomJwtBearer"));
        }

        return AuthenticateResult.Fail("Token validation failed.");
    }
}