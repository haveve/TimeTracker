using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public interface IAbsenceRepository
    {
        public List<Absence> GetUserAbsence(int userId);
        public Absence GetUserDayAbsence(int userId, DateTime date);
        public void AddAbsence(Absence absence);
        public void RemoveAbsence(Absence absence);
    }
}
