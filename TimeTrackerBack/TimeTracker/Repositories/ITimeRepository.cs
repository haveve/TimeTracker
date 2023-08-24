using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public interface ITimeRepository
    {
        public List<Models.Time>? GetTime(int userId);
        public List<Models.Time>? GetDayTime(int userId, DateTime date);
        public void UpdateTime(DateTime oldStartDate,Models.Time time,int userId);
        public void SetEndTrackDate(DateTime date, int userId);
        public void CreateTime(DateTime startDate, int userId);
    }
}
