using GraphQL.Types;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.GraphQL.Types.UserTypes;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class UserMutation : ObjectGraphType
    {
        private readonly IUserRepository repo;

        public UserMutation(IUserRepository Repo)
        {
            repo = Repo;

            Field<UserMutationGraphQLType>("user")
            .Resolve(context => new { });
            Field<TimeMutationGraphType>("time")
            .Resolve(context => new { });
            Field<VacationMutation>("vacation")
            .Resolve(context => new { });
        }
    }
}