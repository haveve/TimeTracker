using GraphQL;
using GraphQL.Types;
using Microsoft.AspNetCore.Antiforgery;
using TimeTracker.GraphQL.Types.Calendar;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.GraphQL.Types.UserTypes;
using TimeTracker.Models;
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
            Field<CalendarMutationGraphqlType>("calendar")
                .Resolve(context => new { });
        }
    }
}