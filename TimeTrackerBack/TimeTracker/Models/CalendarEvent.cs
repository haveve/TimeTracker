namespace TimeTracker.Models
{
    public class CalendarEvent
    {
        public int UserId { get; set; }
        public string Title { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public SpecialEventType? Type { get; set; }
    }

    public enum SpecialEventType
    {
        Ill,
        Ansent,
        Vacation
    }
}
