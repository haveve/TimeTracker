using Dapper;
using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public class AbsenceRepository : IAbsenceRepository
    {
        private readonly DapperContext _dapperContext;

        public AbsenceRepository(DapperContext context)
        {
            _dapperContext = context;
        }
        public List<Absence> GetUserAbsence(int userId)
        {
            string query = $"SELECT * FROM Absences WHERE UserId = {userId} ORDER BY Date";
            using var dapperConnection = _dapperContext.CreateConnection();
            var absences = dapperConnection.Query<Absence>(query).ToList();
            return absences ?? new();
        }
        public Absence GetUserDayAbsence(int userId, DateTime date)
        {
            string daydate = date.ToString("yyyy-MM-dd");
            string query = $"SELECT * FROM Absences WHERE UserId = @userId AND convert(varchar(10), [Date], 120) = @daydate";
            using var dapperConnection = _dapperContext.CreateConnection();
            var absence = dapperConnection.Query<Absence>(query, new { userId, daydate }).FirstOrDefault();
            return absence ?? null;
        }
        public void AddAbsence(Absence absence)
        {
            string query = $"INSERT INTO Absences (UserId, Type, Date) VALUES(@UserId, @Type, @Date)";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, absence);
        }
        public void RemoveAbsence(Absence absence)
        {
            string query = "DELETE FROM Absences WHERE UserId = @UserId AND Date = @Date";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, absence );
        }
    }
}
