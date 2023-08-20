namespace TimeTracker.Models
{
    public class Absence
    {
        public int UserId { get; set; }
        public string Type { get; set; } = " ";
        public DateTime Date { get; set; }
    }
}