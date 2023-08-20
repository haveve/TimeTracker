using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public interface IAbsenceRepository
    {
        public List<Absence> GetUserAbsence(int userId);
        public void AddAbsence(Absence absence);
        public void RemoveAbsence(Absence absence);
    }
}
