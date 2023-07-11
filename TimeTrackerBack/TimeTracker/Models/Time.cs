namespace TimeTracker.Models
{
    public class Time
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime? ToDayDate { get; set; }
        public DateTime? StartTimeTrackDate { get; set; }
        public DateTime? EndTimeTrackDate { get; set; }
        public int DaySeconds { get; set; }
        public int WeekSeconds { get; set; }
        public int MonthSeconds { get; set; }
    }
}
