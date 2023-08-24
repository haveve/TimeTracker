using TimeTracker.GraphQL.Types.Vacation;
using TimeTracker.Models;

namespace TimeTracker.Repositories
{
    public interface IVacationRepository
    {
        void AddApprover(int approverId, int requesterId);
        void AddVacationRequest(VacationRequest request);
        void CancelVacationRequest(int requestId);
        void CheckRequestStatus(int requestId);
        void DeleteApprover(int approverId, int requesterId);
        void DeleteVacationRequest(int id);
        List<ApproverNode> GetApproverNodes(int UserApproverId, int UserRequestId);
        List<ApproverNode> GetApproverNodesByApproverId(int UserApproverId);
        List<ApproverNode> GetApproverNodesByRequesterId(int UserRequestId);
        List<User> GetApproversByRequesterId(int requestId);
        List<ApproverNode> GetApproversNodes(int requestId);
        ApproversReaction GetApproversReaction(int requestId);
        List<User> GetRequestersByApproverId(int approverId);
        List<ApproverSetupNode> GetSetupNodesByApproverId(int approverId);
        List<ApproverSetupNode> GetSetupNodesByRequesterId(int requesterId);
        VacationRequest GetVacationRequest(int id);
        public VacationRequest GetCurrentVacationRequest(int id, DateTime date);
        List<VacationRequest> GetVacationRequestsByApproverId(int approverId,string requestType);
        List<VacationRequest> GetVacationRequestsByRequesterId(int requesterId, string requestType);
        void UpdateApproverReaction(int approverUserId, int requestId, bool reaction, string reactionMessage);
        void UpdateRequestDetailsToApprovers(int userRequesterId, int requestId);
        void UpdateVacationRequestStatus(int requestId, string status);
    }
}
