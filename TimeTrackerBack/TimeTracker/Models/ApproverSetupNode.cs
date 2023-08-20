namespace TimeTracker.Models
{
    public class ApproverSetupNode
    {
        public int Id { get; set; }
        public int UserIdApprover { get; set; }
        public int UserIdRequester { get; set; }

    }
}
