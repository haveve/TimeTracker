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
                .ResolveAsync(async context =>
                {
                    int first = context.GetArgument<int>("first");
                    int after = context.GetArgument<int>("after");
                    string search = context.GetArgument<string>("search");
                    string orderfield = context.GetArgument<string>("orderfield");
                    string order = context.GetArgument<string>("order");
                    if(orderfield == "") orderfield = null;
                    List<User> list = repo.GetSearchedSortedfUsers(search, orderfield, order);
                    return new UserPageViewModel()
                    {
                        UserList = repo.GetSearchedSortedfUsers(search, orderfield, order).Skip(after).Take(first).ToList(),
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
