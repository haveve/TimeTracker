using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.GraphQL.Types.UserTypes;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class UserQuery : ObjectGraphType
    {
        private readonly IUserRepository repo;

        public UserQuery(IUserRepository Repo)
        {
            repo = Repo;
            Field<UserQueryGraphQLType>("user")
            .Resolve(context => new { });
            Field<TimeQueryGraphqlType>("time")
            .Resolve(context => new { });
        }
    }
}
