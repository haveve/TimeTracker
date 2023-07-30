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
                    var tempList = vacRepo.GetApproversByRequesterId(requesterUserId);
                    return tempList;
                });
            Field<ListGraphType<UserType>>("requesters")
                .Argument<NonNullGraphType<IntGraphType>>("approverId")
                .Resolve(context =>
                {
                    int approverUserId = context.GetArgument<int>("approverId");
                    return vacRepo.GetRequestersByApproverId(approverUserId);
                });
            Field<ListGraphType<VacationRequestType>>("vacationRequest")
                .Argument<IntGraphType>("requesterId")
                .Argument<IntGraphType>("approverId")
                .Argument<IntGraphType>("requestId")
                .Resolve(context =>
                {
                    int requesterId = context.GetArgument<int>("requesterId");
                    int id = context.GetArgument<int>("requestId");
                    int approverId = context.GetArgument<int>("approverId");

                    if (id != 0)
                    {
                        var request = vacRepo.GetVacationRequest(id);
                        request.ApproversNodes = vacRepo.GetApproverNodes(requesterId, id);
                        for (int i = 0; i < request.ApproversNodes.Count; i++)
                        {
                            request.ApproversNodes[i].Approver = userRepo.GetUser(request.ApproversNodes[i].UserIdApprover);
                        }
                        request.Requester = userRepo.GetUser(requesterId);
                        return new List<VacationRequest>() { request };
                    }
                    else if (requesterId != 0)
                    {
                        var requests = vacRepo.GetVacationRequestsByRequesterId(requesterId);
                        foreach (var request in requests)
                        {
                            request.ApproversNodes = vacRepo.GetApproverNodesByRequesterId(requesterId);
                            for (int i = 0; i < request.ApproversNodes.Count; i++)
                            {
                                request.ApproversNodes[i].Approver = userRepo.GetUser(request.ApproversNodes[i].UserIdApprover);
                            }
                        }
                        return requests;
                    }
                    else if (approverId != 0)
                    {
                        var requests = vacRepo.GetVacationRequestsByApproverId(requesterId);
                        foreach (var request in requests)
                        {
                            request.ApproversNodes = vacRepo.GetApproverNodes(requesterId, id);
                            for (int i = 0; i < request.ApproversNodes.Count; i++)
                            {
                                request.ApproversNodes[i].Requester = userRepo.GetUser(request.ApproversNodes[i].UserIdRequester);
                            }
                        }
                        return requests;
                    }
                    return null;
                });
            Field<ListGraphType<ApproverNodeType>>("approversReaction")
                .Argument<NonNullGraphType<IntGraphType>>("requestId")
                .Resolve(context =>
                {
                    int requestId = context.GetArgument<int>("requestId");

                    var nodes = vacRepo.GetApproversNodes(requestId);
                    if (nodes == null)
                        return null;

                    foreach (var node in nodes)
                    {
                        node.Approver = userRepo.GetUser(node.UserIdApprover);
                    }

                    return nodes;
                });


        }
    }
}
