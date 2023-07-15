using TimeTracker.Models;

namespace TimeTracker.ViewModels
{
    public class TimeViewModel
    {
        public TimeViewModel()
        { 
        
        }

        public TimeViewModel(Time time)
        {
            DaySeconds = time.DaySeconds;
            MonthSeconds = time.MonthSeconds;
            WeekSeconds = time.WeekSeconds;
        }

        public int DaySeconds { get; set; }
        public int WeekSeconds { get; set; }
        public int MonthSeconds { get; set; }
    }
}
