using GraphQL;
using GraphQL.Types;
using TimeTracker.Models;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class VacationMutation : ObjectGraphType
    {
        private readonly IVacationRepository vacRepo;
        public VacationMutation(IVacationRepository vacationRepository, IUserRepository userRepo)
        {
            vacRepo = vacationRepository;

            Field<StringGraphType>("createVacationRequest")
                .Argument<NonNullGraphType<IntGraphType>>("requesterId")
                .Argument<NonNullGraphType<StringGraphType>>("infoAboutRequest")
                .Argument<NonNullGraphType<DateTimeGraphType>>("startDate")
                .Argument<NonNullGraphType<DateTimeGraphType>>("endDate")
                .Resolve(context =>
                {
                    int requesterId = context.GetArgument<int>("requesterId");
                    string infoAboutRequest = context.GetArgument<string>("infoAboutRequest");
                    DateTime startDate = context.GetArgument<DateTime>("startDate");
                    DateTime endDate = context.GetArgument<DateTime>("endDate");

                    if (requesterId != 0 && infoAboutRequest != null && infoAboutRequest != "")
                    {
                        VacationRequest request = new VacationRequest();
                        request.RequesterId = requesterId;
                        request.InfoAboutRequest = infoAboutRequest;
                        request.Status = "Pending";
                        request.StartDate = startDate;
                        request.EndDate = endDate;
                        vacRepo.AddVacationRequest(request);
                    }

                    return "Request created successfully.";

                });
            Field<StringGraphType>("addApproverForUser")
                .Argument<NonNullGraphType<IntGraphType>>("approverUserId")
                .Argument<NonNullGraphType<IntGraphType>>("requesterUserId")
                .Resolve(context =>
                {
                    int approverUserId = context.GetArgument<int>("approverUserId");
                    int requesterUserId = context.GetArgument<int>("requesterUserId");

                    vacRepo.AddApprover(approverUserId, requesterUserId);

                    return "Person added successfully.";
                });
            Field<StringGraphType>("deleteApprover")
                .Argument<NonNullGraphType<IntGraphType>>("approverUserId")
                .Argument<NonNullGraphType<IntGraphType>>("requesterUserId")
                .Resolve(context =>
                {
                    int approverUserId = context.GetArgument<int>("approverUserId");
                    int requesterUserId = context.GetArgument<int>("requesterUserId");

                    vacRepo.DeleteApprover(approverUserId, requesterUserId);

                    return "Approver deleted successfully.";
                });

            Field<StringGraphType>("addApproverReaction")
                .Argument<NonNullGraphType<IntGraphType>>("approverUserId")
                .Argument<NonNullGraphType<IntGraphType>>("requestId")
                .Argument<NonNullGraphType<BooleanGraphType>>("reaction")
                .Resolve(context =>
                {
                    int approverUserId = context.GetArgument<int>("approverUserId");
                    int requestId = context.GetArgument<int>("requestId");
                    bool reaction = context.GetArgument<bool>("reaction");

                    vacRepo.UpdateApproverReaction(approverUserId, requestId, reaction);

                    return "Reaction added successfully.";
                });

        }
    }
}
