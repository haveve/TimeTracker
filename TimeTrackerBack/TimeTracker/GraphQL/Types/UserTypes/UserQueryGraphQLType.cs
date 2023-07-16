using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.UserTypes
{
    public class UserQueryGraphQLType : ObjectGraphType
    {
        private readonly IUserRepository repo;

        public UserQueryGraphQLType(IUserRepository Repo)
        {
            repo = Repo;
            Field<ListGraphType<UserType>>("users")
                .ResolveAsync(async context => repo.GetUsers());

            Field<UserPageType>("pagedUsers")
                .Argument<NonNullGraphType<IntGraphType>>("first")
                .Argument<NonNullGraphType<IntGraphType>>("after")
                .Argument<StringGraphType>("search")
                .Argument<StringGraphType>("orderfield")
                .Argument<StringGraphType>("order")
                .Argument<StringGraphType>("filderfield")
                .Argument<IntGraphType>("minHours")
                .Argument<IntGraphType>("maxHours")
                .ResolveAsync(async context =>
                {
                    int first = context.GetArgument<int>("first");
                    int after = context.GetArgument<int>("after");
                    string search = context.GetArgument<string>("search");
                    string orderfield = context.GetArgument<string>("orderfield");
                    string order = context.GetArgument<string>("order");
                    string filterfield = context.GetArgument<string>("filderfield");
                    int minHours = context.GetArgument<int>("minHours");
                    int maxHours = context.GetArgument<int>("maxHours");
                    if (orderfield == "") orderfield = null;
                    minHours = minHours == null ?  0 : minHours * 3600;
                    maxHours = ( maxHours == null || maxHours == 0) ?  int.MaxValue : maxHours * 3600;
                    List<User> list = repo.GetSearchedSortedfUsers(search, orderfield, order, filterfield, minHours, maxHours);
                    return new UserPageViewModel()
                    {
                        UserList = list.Skip(after).Take(first).ToList(),
                        TotalCount = (list.Count() + first - 1) / first,
                        PageIndex = (after + first - 1) / first
                    };
                });

            Field<UserType>("user")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    return repo.GetUser(id);
                });
        }
    }
}
