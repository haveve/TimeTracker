namespace TimeTracker.Models
{
    public class VacationRequest
    {
        public int Id { get; set; }
        public int RequesterId { get; set; }
        public string InfoAboutRequest { get; set; }
        public string Status { get; set; }
        public List<User> ApproversList { get; set; }
    }
}
