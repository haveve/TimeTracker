namespace TimeTracker.Models
{
    public class ApproverNode
    {
        public int Id { get; set; }
        public int UserIdApprover { get; set; }
        public int UserIdRequester { get; set; }
        public int? RequestId { get; set; }
        public bool? IsRequestApproved { get; set; }
    }
}
