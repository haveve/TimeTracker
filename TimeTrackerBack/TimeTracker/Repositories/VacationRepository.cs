using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using TimeTracker.GraphQL.Types.Vacation;
using TimeTracker.Models;
using TimeTracker.Services;

namespace TimeTracker.Repositories
{
    public class VacationRepository : IVacationRepository
    {
        string conectionString = null;
        IEmailSender _emailSender { get; set; }
        IUserRepository _userRepository { get; set; }
        public VacationRepository(DapperContext context, IEmailSender emailSender, IUserRepository userRepository)
        {
            conectionString = context.CreateConnection().ConnectionString;
            _emailSender = emailSender;
            _userRepository = userRepository;
        }
        public List<User> GetApproversByRequesterId(int UserRequestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"SELECT Users.Id, Users.Login, Users.FullName, Users.Email FROM Users join Approvers " +
                    $"on Users.Id = Approvers.UserIdApprover " +
                    $"where Approvers.UserIdRequester = {UserRequestId}";
                return db.Query<User>(query).ToList();
            }
        }
        public List<User> GetRequestersByApproverId(int userApproverId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"SELECT * FROM Users join Approvers " +
                    $"on Users.Id = Approvers.UserIdRequester " +
                    $"where Approvers.UserIdApprover = {userApproverId}";
                return db.Query<User>(query).ToList();
            }
        }
        public VacationRequest GetVacationRequest(int id)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"SELECT * FROM VacationRequests " +
                    $"WHERE Id = {id}";
                var request = db.Query<VacationRequest>(query).FirstOrDefault();
                if (request == null)
                {
                    return null;
                }
                request.ApproversList = GetApproversByRequesterId(request.RequesterId);
                return request;
            }
        }
        public List<VacationRequest> GetVacationRequestsByRequesterId(int requesterId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * FROM VacationRequests " +
                    $"WHERE RequesterId = {requesterId}";
                var temp = db.Query<VacationRequest>(query).ToList();
                return temp;
            }
        }
        public List<VacationRequest> GetVacationRequestsByApproverId(int UserApproverId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select VacationRequests.Id, RequesterId, " +
                    $"InfoAboutRequest, Status " +
                    $"From VacationRequests join Approvers " +
                    $"on Approvers.RequestId = VacationRequests.Id " +
                    $"where Approvers.UserIdApprover = {UserApproverId}";
                return db.Query<VacationRequest>(query).ToList();
            }
        }
        public List<ApproverNode> GetApproverNodes(int UserApproverId, int UserRequestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * from Approvers " +
                    $"Where UserIdApprover = {UserApproverId} " +
                    $"and UserIdRequester = {UserRequestId}";
                return db.Query<ApproverNode>(query).ToList();
            }
        }
        public ApproversReaction GetApproversReaction(int requestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * From Approvers Where RequestId = {requestId}";
                var approverNodes = db.Query<ApproverNode>(query).ToList();

                int approversCount = approverNodes.Count;
                int positiveReactionCount = 0;
                foreach (var node in approverNodes)
                {
                    if (node.IsRequestApproved == null)
                    {
                        return new ApproversReaction(false);
                    }

                    if (node.IsRequestApproved == true)
                        positiveReactionCount++;


                }
                if (positiveReactionCount == approversCount)
                    return new ApproversReaction(true, true);
                return new ApproversReaction(true, false);

            }
        }




        public void AddVacationRequest(VacationRequest request)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"INSERT INTO VacationRequests (RequesterId, " +
                    $"InfoAboutRequest, Status) " +
                    $"VALUES ({request.RequesterId},{request.InfoAboutRequest}, " +
                    $"{request.Status})";
                db.Execute(query);
            }
        }
        public void DeleteVacationRequest(int id)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"DELETE * FROM VacationRequests WHERE Id = {id}";
                db.Execute(query);
            }
        }


        public void AddApprover(int userApproverId, int userRequestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                if (GetApproverNodes(userApproverId, userRequestId).Count != 0)
                    return;
                if (userApproverId == userRequestId)
                    return;

                string query = $"INSERT INTO Approvers (UserIdApprover, UserIdRequester) " +
                    $"VALUES ({userApproverId},{userRequestId})";
                db.Execute(query);
            }
        }
        public void DeleteApprover(int userApproverId, int userRequesterId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"DELETE FROM Approvers " +
                    $"WHERE UserIdApprover = {userApproverId} " +
                    $"AND UserIdRequester = {userRequesterId}";
                db.Execute(query);
            }
        }
        public void UpdateRequestDetailsToApprovers(int userRequesterId, int requestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Update Approvers Set RequestId = {requestId} " +
                    $"where UserIdRequester = {userRequesterId}";
                db.Execute(query);
            }
        }
        public void ClearRequestDetailsToApprovers(int requestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Update Approvers Set RequestId = NULL, IsRequestApproved = NULL, ReactionMessage = NULL " +
                    $"Where RequestId = {requestId}";
                db.Execute(query);
            }
        }
        public void UpdateVacationRequestStatus(int requestId, string status)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Update VacationRequests Set Status = '{status}' " +
                    $"Where Id = {requestId}";

                /// TODO: Send email with info
                /// 
                db.Execute(query);
                ClearRequestDetailsToApprovers(requestId);
                User user = _userRepository.GetUser(requestId);
                _emailSender.SendResponseOfVacationRequest(status == "Approved" ? true : false,
                    GetVacationRequest(requestId).InfoAboutRequest,
                    user.Email);
            }
        }
        public void UpdateApproverReaction(int approverUserId, int requestId, bool reaction)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                int tempReaction = reaction ? 1 : 0;
                string query = $"Update Approvers Set IsRequestApproved = {tempReaction} " +
                    $"where UserIdApprover = {approverUserId} AND RequestId = {requestId}";
                db.Execute(query);

                // check, is request finished

                CheckRequestStatus(requestId);
            }
        }



        public void CheckRequestStatus(int requestId)
        {
            var approversReaction = GetApproversReaction(requestId);
            if (approversReaction == null) return;

            if (approversReaction.IsAllApproverReacted
                && approversReaction.FinalApproversReaction == true)
            {
                UpdateVacationRequestStatus(requestId, "Approved");
            }
            else if (approversReaction.IsAllApproverReacted
                && approversReaction.FinalApproversReaction == false)
            {
                UpdateVacationRequestStatus(requestId, "Declined");
            }
        }

    }
}
