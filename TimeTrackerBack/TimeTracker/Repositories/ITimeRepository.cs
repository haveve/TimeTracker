using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public interface ITimeRepository
    {
        public Time GetTime(int userId);
        public void UpdateTime(Time time,int userId, UpdateTimeE updateTime);
        public void SetStartOrEndTrackDate(StartOrEnd startOrEnd,DateTime date, int userId);
    }
    public enum StartOrEnd
    {
        Start,
        End
    }
    public enum UpdateTimeE
    {
        FullTime,
        OnlySeconds
    }
}
