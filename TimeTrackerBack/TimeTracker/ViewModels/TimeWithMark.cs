namespace TimeTracker.ViewModels
{
    public class TimeWithMark : Models.Time
    {
        public TimeMark TimeMark { get; set; }
    }
    public enum TimeMark
    {
        Day,
        Week,
        Month,
    }
}
