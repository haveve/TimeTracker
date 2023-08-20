using TimeTracker.Models;

namespace TimeTracker.ViewModels
{
    public class TimeViewModel
    {
        public TimeViewModel()
        { 
        
        }


        public List<TimeWithMark> Sessions { get; set; }
        public int DaySeconds { get; set; }
        public int WeekSeconds { get; set; }
        public int MonthSeconds { get; set; }
    }
}
