using Azure.Core;
using GraphQL;
using GraphQL.Types;
using Microsoft.AspNetCore.Antiforgery;
using TimeTracker.GraphQL.Types;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.Models;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class UserMutation : ObjectGraphType
    {
        private readonly IUserRepository repo;
        private readonly IAntiforgery antiforgery;

        public UserMutation(IUserRepository Repo, IAntiforgery Antiforgery)
        {
            repo = Repo;
            antiforgery = Antiforgery;

            Field<StringGraphType>("createUser")
                .Argument<NonNullGraphType<UserInputType>>("User")
                .ResolveAsync(async context =>
                {
                    var user = context.GetArgument<User>("User");
                    repo.CreateUser(user);
                    return "User created successfully";
                });

            Field<StringGraphType>("updateUser")
                .Argument<NonNullGraphType<IntGraphType>>("Id")
                .Argument<NonNullGraphType<UserInputType>>("User")
                .ResolveAsync(async context =>
                {
                    var Id = context.GetArgument<int>("Id");
                    var NewUser = context.GetArgument<User>("User");
                    if (NewUser.Password != repo.GetUser(Id).Password) return "Password is incorrect";
                    NewUser.Id = Id;
                    repo.UpdateUser(NewUser);
                    return "User updated successfully";
                });

            Field<StringGraphType>("updateUserPassword")
                .Argument<NonNullGraphType<IntGraphType>>("Id")
                .Argument<NonNullGraphType<StringGraphType>>("Password")
                .Argument<NonNullGraphType<StringGraphType>>("NewPassword")
                .ResolveAsync(async context =>
                {
                    var Id = context.GetArgument<int>("Id");
                    var Password = context.GetArgument<string>("Password");
                    var NewPassword = context.GetArgument<string>("NewPassword");
                    if (Password != repo.GetUser(Id).Password) return "Password is incorrect";
                    repo.UpdateUserPassword(Id, NewPassword);
                    return "Password updated successfully";
                });

            Field<StringGraphType>("updateUserPermissions")
                .Argument<NonNullGraphType<PermissionsType>>("Permissions")
                .ResolveAsync(async context =>
                {
                    var permissions = context.GetArgument<Permissions>("Permissions");
                    repo.UpdateUserPermissions(permissions);
                    return "permissions updated successfully";
                });

            Field<StringGraphType>("deleteUser")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    repo.DeleteUser(id);
                    return "User deleted successfully";
                });
            Field<TimeMutationGraphType>("time")
            .ResolveAsync(async context => {
                var httpContext = context.RequestServices!.GetService<IHttpContextAccessor>()!.HttpContext!;

                var isValid = await antiforgery.IsRequestValidAsync(httpContext);
                if (!isValid)
                {
                    throw new ApplicationException("Invalid AntiForgeryToken");
                }
                return new { };
                });
        }
    }
}
