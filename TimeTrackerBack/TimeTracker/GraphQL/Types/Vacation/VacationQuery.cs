using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types;
using TimeTracker.GraphQL.Types.UserTypes;
using TimeTracker.Models;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Types.Vacation
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
                .Argument<StringGraphType>("requestStatus")
                .Resolve(context =>
                {
                    int requesterId = context.GetArgument<int>("requesterId");
                    int id = context.GetArgument<int>("requestId");
                    int approverId = context.GetArgument<int>("approverId");
                    string requestStatus = context.GetArgument<string>("requestStatus");
                    
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
                        if (requestStatus == "") return new List<VacationRequest>(){};
                        var requests = vacRepo.GetVacationRequestsByRequesterId(requesterId, requestStatus);
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
                        if (requestStatus == "") return new List<VacationRequest>(){};

                        var requests = vacRepo.GetVacationRequestsByApproverId(approverId,requestStatus);

                        for (int j = 0; j < requests.Count; j++)
                        {
                            var request = requests[j];

                            request.ApproversNodes = vacRepo.GetApproversNodes(request.Id);
                            /*
                            for (int i = 0; i < request.ApproversNodes.Count; i++)
                            {
                                if (request.ApproversNodes[i].IsRequestApproved != null && request.ApproversNodes[i].UserIdApprover == approverId)
                                {
                                    requests.Remove(request);
                                    j--;
                                    continue;
                                }
                                //request.ApproversNodes[i].Requester = userRepo.GetUser(request.ApproversNodes[i].UserIdRequester);
                            }
                            */
                            request.Requester = userRepo.GetUser(request.RequesterId);
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
