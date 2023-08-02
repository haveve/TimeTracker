using GraphQL;
using GraphQL.MicrosoftDI;
using GraphQL.Types;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TimeTracker.GraphQL.Schemas;
using TimeTracker.GraphQL.Types.Vacation;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.Services;

var builder = WebApplication.CreateBuilder(args);

//Dapper
builder.Services.AddSingleton<DapperContext>();

builder.Services.AddSingleton<IEmailSender,EmailSender>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<ITimeRepository, TimeRepository>();
builder.Services.AddSingleton<ICalendarRepository, CalendarRepository>();
builder.Services.AddSingleton<IVacationRepository, VacationRepository>();


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

builder.Services.AddSingleton<ISchema, UserShema>(services =>
{
    var scheme = new UserShema(new SelfActivatingServiceProvider(services));
    scheme.AuthorizeWithPolicy("Authorized");
    scheme.Mutation!.Fields.First(f => f.Name == "user").AuthorizeWithPolicy("CRUDUsers");
    return scheme;
});

builder.Services.AddSingleton<ISchema, IdentitySchema>(services =>
{
    var scheme = new IdentitySchema(new SelfActivatingServiceProvider(services));
    return scheme;
});

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
                                      setting.AddPolicy("EditPermiters", p => p.RequireClaim("EditPermiters", "True"));
                                      setting.AddPolicy("ImportExcel", p => p.RequireClaim("ImportExcel", "True"));
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