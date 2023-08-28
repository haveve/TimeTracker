using GraphQL;
using GraphQL.Types;
using System.Security.Claims;
using System.Security.Policy;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.Services;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.UserTypes
{
    public class UserQueryGraphQLType : ObjectGraphType
    {
        private readonly IUserRepository repo;

        public UserQueryGraphQLType(
            IUserRepository Repo, 
            IEmailSender emailSender, 
            IConfiguration config, 
            ICalendarRepository calendarRepo, 
            ITimeRepository timeRepo,
            IExcelHandler excelHandler
            )
        {
            repo = Repo;
            Field<ListGraphType<UserGraphType>>("users")
                .ResolveAsync(async context => repo.GetUsers());
            Field<UserPageGraphType>("pagedUsers")
                .Argument<NonNullGraphType<IntGraphType>>("first")
                .Argument<NonNullGraphType<IntGraphType>>("after")
                .Argument<StringGraphType>("search")
                .Argument<StringGraphType>("orderfield")
                .Argument<StringGraphType>("order")
                .Argument<StringGraphType>("enabled")
                .ResolveAsync(async context =>
                {
                    int first = context.GetArgument<int>("first");
                    int after = context.GetArgument<int>("after");
                    string search = context.GetArgument<string>("search");
                    string orderfield = context.GetArgument<string>("orderfield");
                    string order = context.GetArgument<string>("order");
                    string enabled = context.GetArgument<string>("enabled");
                    if (orderfield == "") orderfield = null;
                    List<User> list = repo.GetSearchedSortedfUsers(search, orderfield, order, enabled).ToList();
                    return new UserPageViewModel()
                    {
                        UserList = list.Skip(after).Take(first).ToList(),
                        TotalCount = (list.Count() + first - 1) / first,
                        PageIndex = (after + first - 1) / first
                    };
                });
            Field<StringGraphType>("getExcelFile")
                .Argument<StringGraphType>("search")
                .Argument<StringGraphType>("orderField")
                .Argument<StringGraphType>("order")
                .Argument<StringGraphType>("enabled")
                .Resolve(context =>
                {
                    string search = context.GetArgument<string>("search");
                    string orderField = context.GetArgument<string>("orderField");
                    string order = context.GetArgument<string>("order");
                    string enabled = context.GetArgument<string>("enabled");
                    if (orderField == "") orderField = null;
                    
                    List<User> users = repo.GetSearchedSortedfUsers(search, orderField, order, enabled).ToList();
                    foreach (var user in users)
                    {
                        var timeQuery = new TimeQueryGraphQLType(timeRepo,Repo, calendarRepo);
                        var resp = TimeQueryGraphQLType.GetTimeFromSession(
                            timeRepo.GetTime(user.Id), new List<TimeMark>(), 0, startOfWeek.Monday,0);
                        double hour = (double)(resp.Time.MonthSeconds) / 60/60;
                        user.WorkedHours = hour;
                    }

                    string uuid = Guid.NewGuid().ToString(); 
                    excelHandler.WriteExcelTable(users, uuid);
                    string base_url = config.GetValue<string>("Urls");
                    string url = Path.Combine(base_url, "Test", "Download", uuid);
                    return url;
                });
            Field<UserGraphType>("user")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    return repo.GetUser(id);
                });
            Field<UserGraphType>("currentUser")
                .ResolveAsync(async context =>
                {
                    var a = context.User!;
                    var userId = GetUserIdFromClaims(context.User!);
                    return repo.GetUser(userId);
                });
            Field<PermissionsGraphType>("userPermissions")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    return repo.GetUserPermissions(id);
                });
            Field<PermissionsGraphType>("currentUserPermissions")
                .ResolveAsync(async context =>
                {
                    var userId = GetUserIdFromClaims(context.User!);
                    return repo.GetUserPermissions(userId);
                });
            Field<ListGraphType<UserGraphType>>("usersBySearch")
                .Argument<NonNullGraphType<StringGraphType>>("name")
                .Resolve(context =>
                {
                    string name = context.GetArgument<string>("name");
                    return repo.GetUsersByFullName(name);
                });

            
        }
        public static int GetUserIdFromClaims(ClaimsPrincipal user)
        {
            var id = int.Parse(user.Claims.FirstOrDefault(c => c.Type == "UserId")!.Value);
            return id;
        }
    }
}
