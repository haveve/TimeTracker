using TimeTracker.ViewModels;

namespace TimeTracker.Models
{
    public class Time
    {
        public Time()
        {

        }

        public Time(TimeViewModel timeV)
        {
            DaySeconds = timeV.DaySeconds;
            WeekSeconds = timeV.WeekSeconds;
            MonthSeconds = timeV.MonthSeconds;
        }

        public DateTime? ToDayDate { get; set; }
        public DateTime? StartTimeTrackDate { get; set; }
        public DateTime? EndTimeTrackDate { get; set; }
        public int DaySeconds { get; set; }
        public int WeekSeconds { get; set; }
        public int MonthSeconds { get; set; }
    }
}
