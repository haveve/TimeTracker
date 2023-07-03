using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class UserQuery: ObjectGraphType
    {
        private readonly IUserRepository repo;

        public UserQuery(IUserRepository Repo)
        {
            repo = Repo;

            Field<ListGraphType<UserType>>("users")
                .ResolveAsync(async context => await repo.GetUsers());

            Field<UserType>("user")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    return await repo.GetUser(id);
                });
            Field<PermissionsType>("permissions")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    return await repo.GetPermissions(id);
                });
        }
    }
}
