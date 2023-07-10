using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class UserQuery : ObjectGraphType
    {
        private readonly IUserRepository repo;

        public UserQuery(IUserRepository Repo)
        {
            repo = Repo;
            Field<ListGraphType<UserType>>("users")
                .ResolveAsync(async context => repo.GetUsers());

            Field<UserType>("user")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    return repo.GetUser(id);
                });
            Field<TimeQueryGraphqlType>("time")
            .Resolve(context => new { });
        }
    }
}
