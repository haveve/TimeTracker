using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public interface ITimeRepository
    {
        public Time GetTime(int userId);
        public void AddOneSecond(int userId);
        public void UpdateTime(Time time,int userId);
    }
}
