using Dapper;
using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public class TimeRepository : ITimeRepository
    {
        private readonly DapperContext _dapperContext;

        public TimeRepository(DapperContext context)
        {
            _dapperContext = context;
        }
        public List<Models.Time>? GetTime(int userId)
        {
            string query = $"SELECT * FROM UserTime WHERE UserId = {userId}";
            using var connection = _dapperContext.CreateConnection();

            var time = connection.Query<Models.Time>(query).ToList();
            return time;
        }

        public void SetEndTrackDate(DateTime date, int userId)
        {
            string query = $"UPDATE TOP (1) UserTime SET EndTimeTrackDate = @date WHERE UserId = {userId} AND EndTimeTrackDate IS NULL ";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { date});
        }

        public void CreateTime(DateTime startDate, int userId)
        {
            string query = "INSERT INTO UserTime (StartTimeTrackDate, UserId) VALUES (@startDate, @userId)";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new {userId, startDate });
        }
        public void UpdateTime(DateTime oldStartDate, Models.Time time, int userId)
        {
            string query = $"UPDATE UserTime SET EndTimeTrackDate = @EndTimeTrackDate, StartTimeTrackDate = @StartTimeTrackDate WHERE UserId = {userId} AND StartTimeTrackDate = @oldStartDate";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { time.StartTimeTrackDate,time.EndTimeTrackDate,userId, oldStartDate });
        }
    }
    public enum LasUpdatedBy
    {
        None,
        Auto,
        Hand
    }
}
