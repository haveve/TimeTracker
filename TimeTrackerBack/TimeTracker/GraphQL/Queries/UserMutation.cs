using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types;
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

            Field<StringGraphType>("createUser")
                .Argument<NonNullGraphType<UserInputType>>("User")
                .Argument<NonNullGraphType<PermissionsInputType>>("Permissions")
                .ResolveAsync(async context =>
                {
                    var user = context.GetArgument<User>("User");
                    var permissions = context.GetArgument<Permissions>("Permissions");
                    await repo.CreateUser(user, permissions);
                    return "User created successfully";
                });

            Field<StringGraphType>("deleteUser")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    await repo.DeleteUser(id);
                    return "User deleted successfully";
                });
        }
    }
}
