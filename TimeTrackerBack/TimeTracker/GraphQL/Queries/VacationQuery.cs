using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types.UserTypes;
using TimeTracker.GraphQL.Types.Vacation;
using TimeTracker.Models;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class VacationQuery : ObjectGraphType
    {

        private readonly IVacationRepository vacRepo;
        public VacationQuery(IVacationRepository vacationRepoitory, IUserRepository userRepo)
        {
            vacRepo = vacationRepoitory;


            Field<ListGraphType<UserType>>("approvers")
                .Argument<NonNullGraphType<IntGraphType>>("requesterId")
                .Resolve(context =>
                {
                    int requesterUserId = context.GetArgument<int>("requesterId");
                    return vacRepo.GetApproversByRequesterId(requesterUserId);
                });
            Field<ListGraphType<UserType>>("requesters")
                .Argument<NonNullGraphType<IntGraphType>>("approverId")
                .Resolve(context =>
                {
                    int appruverUserId = context.GetArgument<int>("approverId");
                    return vacRepo.GetRequestersByApproverId(appruverUserId);
                });
            Field<ListGraphType<VacationRequestType>>("vacationRequest")
                .Argument<IntGraphType>("requesterId")
                .Argument<IntGraphType>("requestId")
                .Resolve(context =>
                {
                    int approverUserId = context.GetArgument<int>("requesterId");
                    int id = context.GetArgument<int>("requestId");

                    if (id != 0)
                    {
                        return new List<VacationRequest>() { vacRepo.GetVacationRequest(id) };
                    }
                    if (approverUserId != 0)
                    {
                        return vacRepo.GetVacationRequestsByRequesterId(approverUserId);
                    }
                    return null;
                });


        }
    }
}
