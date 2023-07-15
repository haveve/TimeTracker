using GraphQL;
using GraphQL.Types;
using Microsoft.AspNetCore.Antiforgery;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.GraphQL.Types.UserTypes;
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

            Field<UserMutationGraphQLType>("user")
            .Resolve(context => new { });
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