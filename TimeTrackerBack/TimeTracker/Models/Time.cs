namespace TimeTracker.Models
{
    public class Time
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime? toDayDate { get; set; }
        public DateTime? startMonthDate { get; set; }
        public DateTime? startWeekDate { get; set; }
        public int DaySeconds { get; set; }
        public int WeekSeconds { get; set; }
        public int MonthSeconds { get; set; }
    }
}
