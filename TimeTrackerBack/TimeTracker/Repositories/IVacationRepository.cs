using TimeTracker.GraphQL.Types.Vacation;
using TimeTracker.Models;

namespace TimeTracker.Repositories
{
    public interface IVacationRepository
    {
        void AddApprover(int approverId, int requesterId);
        void AddVacationRequest(VacationRequest request);
        void DeleteApprover(int approverId, int requesterId);
        void DeleteVacationRequest(int id);
        List<ApproverNode> GetApproverNodes(int UserApproverId, int UserRequestId);
        List<User> GetApproversByRequesterId(int requestId);
        ApproversReaction GetApproversReaction(int requestId);
        List<User> GetRequestersByApproverId(int approverId);
        VacationRequest GetVacationRequest(int id);
        List<VacationRequest> GetVacationRequestsByApproverId(int approverId);
        List<VacationRequest> GetVacationRequestsByRequesterId(int requesterId);
        void UpdateApproverReaction(int approverUserId, int requestId, bool reaction);
        void UpdateRequestDetailsToApprovers(int userRequesterId, int requestId);
        void UpdateVacationRequestStatus(int requestId, string status);
    }
}
