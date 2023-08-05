namespace TimeTracker.Models
{
    public class ApproverNode
    {
        public int Id { get; set; }
        public int UserIdApprover { get; set; }
        public User Approver { get; set; }
        public int UserIdRequester { get; set; }
        public User Requester { get; set; }
        public int RequestId { get; set; }
        public bool? IsRequestApproved { get; set; }
        public string? ReactionMessage { get; set; }
    }
}
