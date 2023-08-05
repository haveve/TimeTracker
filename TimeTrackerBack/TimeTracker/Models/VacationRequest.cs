namespace TimeTracker.Models
{
    public class VacationRequest
    {
        public int Id { get; set; }
        public int RequesterId { get; set; }
        public User Requester { get; set; }
        public string InfoAboutRequest { get; set; }
        public string Status { get; set; }
        public List<ApproverNode> ApproversNodes { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
