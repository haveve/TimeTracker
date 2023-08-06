using TimeTracker.ViewModels;

namespace TimeTracker.Models
{
    public class Time
    {
        public Time()
        {

        }

        public DateTime StartTimeTrackDate { get; set; }
        public DateTime? EndTimeTrackDate { get; set; }
    }
}
