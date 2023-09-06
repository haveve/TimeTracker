using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public interface ITimeRepository
    {
        public List<Models.Time>? GetTime(int userId);
        public Models.Time GetTimeByStartDate(int userId, DateTime date);
        public void DeleteTime(int userId, DateTime date);
        public void UpdateTime(DateTime oldStartDate,Models.Time time,int userId);
        public void SetEndTrackDate(DateTime date, int userId);
        public void CreateTime(DateTime startDate, int userId);
        public void CreateTimeWithEnd(Models.Time time, int userId);
        public bool IsStarted(int userId);
    }
}
