using GraphQL;
using GraphQL.Types;
using System.Security.Claims;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.Services;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.AbsenceTypes
{
    public class AbsenceQueryGraphQLType : ObjectGraphType
    {
        private readonly IAbsenceRepository repo;

        public AbsenceQueryGraphQLType(IAbsenceRepository Repo)
        {
            repo = Repo;
            Field<ListGraphType<AbsenceType>>("currentUserAbsences")
                .ResolveAsync(async context =>
                {
                    var userId = GetUserIdFromClaims(context.User!);
                    return repo.GetUserAbsence(userId).Where(a => a.Date.Month == DateTime.Now.Month);
                });
            Field<ListGraphType<AbsenceType>>("UserAbsences")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    return repo.GetUserAbsence(id).Where(a => a.Date.Month == DateTime.Now.Month);
                });
        }
        public static int GetUserIdFromClaims(ClaimsPrincipal user)
        {
            var id = int.Parse(user.Claims.FirstOrDefault(c => c.Type == "UserId")!.Value);
            return id;
        }
    }
}
