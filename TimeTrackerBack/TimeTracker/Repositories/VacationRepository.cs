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
        #region Setup part

        public List<ApproverSetupNode> GetSetupNodesByRequesterId(int requesterId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * from ApproversSetup where UserIdRequester = {requesterId}";
                return db.Query<ApproverSetupNode>(query).ToList();
            }
        }
        public List<ApproverSetupNode> GetSetupNodesByApproverId(int approverId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * from ApproversSetup where UserIdApprover = {approverId}";
                return db.Query<ApproverSetupNode>(query).ToList();
            }
        }
        public List<ApproverSetupNode> GetSetupNodes(int requesterId, int approverId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * from ApproversSetup where UserIdApprover = {approverId} and UserIdRequester = {requesterId}";
                return db.Query<ApproverSetupNode>(query).ToList();
            }
        }
        public void AddApprover(int userApproverId, int userRequestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {

                if (GetSetupNodes(userRequestId, userApproverId).Count != 0)
                    return;
                if (userApproverId == userRequestId)
                    return;

                string query = $"INSERT INTO ApproversSetup (UserIdApprover, UserIdRequester) " +
                    $"VALUES ({userApproverId},{userRequestId})";
                db.Execute(query);

            }
        }
        public void DeleteApprover(int userApproverId, int userRequesterId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"DELETE FROM ApproversSetup " +
                    $"WHERE UserIdApprover = {userApproverId} " +
                    $"AND UserIdRequester = {userRequesterId}";
                db.Execute(query);
            }
        }

        #endregion
        public List<User> GetApproversByRequesterId(int UserRequestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"SELECT Users.Id, Users.Login, Users.FullName, Users.Email FROM Users join ApproversSetup " +
                    $"on Users.Id = ApproversSetup.UserIdApprover " +
                    $"where ApproversSetup.UserIdRequester = {UserRequestId}";
                return db.Query<User>(query).ToList();
            }
        }
        public List<User> GetRequestersByApproverId(int userApproverId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"SELECT Users.Id, Users.Login, Users.FullName, Users.Email FROM Users join ApproversSetup " +
                    $"on Users.Id = ApproversSetup.UserIdRequester " +
                    $"where ApproversSetup.UserIdApprover = {userApproverId}";
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
                return request;
            }
        }
        public List<VacationRequest> GetVacationRequestsByRequesterId(int requesterId, string requestType)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query;
                if(requestType=="All"){
                    query = $"Select * FROM VacationRequests " +
                        $"WHERE RequesterId = {requesterId}";
                }
                else { query = $"Select * FROM VacationRequests " +
                    $"WHERE RequesterId = {requesterId} AND Status = '{requestType}'";
                }
                
                var temp = db.Query<VacationRequest>(query).ToList();
                return temp;
            }
        }
        public List<VacationRequest> GetVacationRequestsByApproverId(int UserApproverId, string requestType)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select VacationRequests.Id, RequesterId, " +
                    $"InfoAboutRequest, Status, StartDate, EndDate " +
                    $"From VacationRequests join ApproversReaction " +
                    $"on ApproversReaction.RequestId = VacationRequests.Id " +
                    $"where ApproversReaction.UserIdApprover = {UserApproverId}";
                var temp = db.Query<VacationRequest>(query).ToList();
                if (requestType!="All")
                    temp.RemoveAll((vacationRequest) => vacationRequest.Status != requestType);
                return temp;
            }
        }
        public List<ApproverNode> GetApproversNodes(int requestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * from ApproversReaction " +
                    $"Where RequestId = {requestId}";
                return db.Query<ApproverNode>(query).ToList();
            }
        }
        // ---------------?
        public List<ApproverNode> GetApproverNodes(int UserApproverId, int UserRequestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * from ApproversSetup " +
                    $"Where UserIdApprover = {UserApproverId} " +
                    $"and UserIdRequester = {UserRequestId}";
                return db.Query<ApproverNode>(query).ToList();
            }
        }
        public List<ApproverNode> GetApproverNodesByApproverId(int UserApproverId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * from ApproversReaction " +
                    $"Where UserIdApprover = {UserApproverId}";
                return db.Query<ApproverNode>(query).ToList();
            }
        }
        public List<ApproverNode> GetApproverNodesByRequesterId(int UserRequestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * from ApproversReaction " +
                    $"Where UserIdRequester = {UserRequestId}";
                return db.Query<ApproverNode>(query).ToList();
            }
        }

        public ApproversReaction GetApproversReaction(int requestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                string query = $"Select * From ApproversReaction Where RequestId = {requestId}";
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
                    else
                        return new ApproversReaction(false, false);

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

                string query = $"INSERT INTO VacationRequests (RequesterId, InfoAboutRequest, Status, StartDate, EndDate) " +
                    $"VALUES ({request.RequesterId}, '{request.InfoAboutRequest}', '{request.Status}', '{request.StartDate.ToString("yyyy-MM-dd HH:mm:ss")}', '{request.EndDate.ToString("yyyy-MM-dd HH:mm:ss")}')";

                db.Execute(query);

                // get id of created request
                string getId = $"Select Id From VacationRequests Where RequesterId = {request.RequesterId} " +
                    $"And StartDate = '{request.StartDate.ToString("yyyy-MM-dd HH:mm:ss")}'";
                int requestId = db.Query<int>(getId).FirstOrDefault();

                // create reaction nodes
                var setupNodes = GetSetupNodesByRequesterId(request.RequesterId);
                foreach (var node in setupNodes)
                {
                    string prequery = $"insert into ApproversReaction (UserIdApprover, UserIdRequester, RequestId) Values " +
                        $"({node.UserIdApprover}, {node.UserIdRequester}, {requestId})";
                    db.Execute(prequery);
                }


            }
        }
        public void CancelVacationRequest(int requestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                var nodes = GetApproversNodes(requestId);
                foreach (var node in nodes)
                {
                    string prequery = $"Update ApproversReaction Set IsRequestApproved = NULL, ReactionMessage = 'Request was canceled' Where RequestId = {requestId}";
                    db.Execute(prequery);
                }

                string query = $"Update VacationRequests Set Status = 'Canceled' WHERE Id = {requestId}";
                db.Execute(query);
            }
        }
        public void DeleteVacationRequest(int requestId)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                var nodes = GetApproversNodes(requestId);
                foreach (var node in nodes)
                {
                    string prequery = $"Delete from ApproversReaction Where RequestId = {requestId}";
                    db.Execute(prequery);
                }

                string query = $"DELETE FROM VacationRequests WHERE Id = {requestId}";
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

                db.Execute(query);
                // get vacationRequest
                VacationRequest vacationRequest = GetVacationRequest(requestId);
                vacationRequest.ApproversNodes = GetApproversNodes(requestId);
                foreach (var nodes in vacationRequest.ApproversNodes)
                {
                    nodes.Approver = _userRepository.GetUser(nodes.UserIdApprover);
                }
                User user = _userRepository.GetUser(vacationRequest.RequesterId);
                _emailSender.SendResponseOfVacationRequest(vacationRequest, user.Email);
            }
        }
        public void UpdateApproverReaction(int approverUserId, int requestId, bool reaction, string reactionMessage)
        {
            using (IDbConnection db = new SqlConnection(conectionString))
            {
                int tempReaction = reaction ? 1 : 0;
                string query = $"Update ApproversReaction Set IsRequestApproved = {tempReaction}, ReactionMessage = '{reactionMessage}' " +
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
            if (approversReaction.FinalApproversReaction == false)
            {
                UpdateVacationRequestStatus(requestId, "Declined");
            }
        }

    }
}
