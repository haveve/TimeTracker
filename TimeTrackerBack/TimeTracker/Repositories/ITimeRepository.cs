using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public interface ITimeRepository
    {
        public Time GetTime(int userId);
        public void AddTimeInSeconds(int seconds,int userId);
        public void UpdateTime(Time time,int userId);
        public void SetStartOrEndTrackDate(StartOrEnd startOrEnd,DateTime date, int userId);
    }
    public enum StartOrEnd
    {
        Start,
        End
    }
}
