using Dapper;
using TimeTracker.Models;
using TimeTracker.Services;
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
        public List<Models.Time>? GetUserMonthTime(int userId, int month)
        {
            string query = $"SELECT * FROM UserTime WHERE UserId = @userId AND MONTH(StartTimeTrackDate) = @month";
            using var connection = _dapperContext.CreateConnection();

            var time = connection.Query<Models.Time>(query, new { userId, month }).ToList();
            return time;
        }
        public Models.Time GetTimeByStartDate(int userId, DateTime date)
        {
            string query = $"SELECT * FROM UserTime WHERE UserId = @userId AND StartTimeTrackDate = @date";
            using var connection = _dapperContext.CreateConnection();
            var time = connection.Query<Models.Time>(query, new { userId, date }).FirstOrDefault();
            return time ?? null;
        }
        public void DeleteTime(int userId, DateTime date)
        {
            string query = $"DELETE FROM UserTime WHERE UserId = @userId AND StartTimeTrackDate = @date";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { userId, date });
        }
        public void SetEndTrackDate(DateTime date, int userId)
        {
            string query = $"UPDATE TOP (1) UserTime SET EndTimeTrackDate = @date WHERE UserId = {userId} AND EndTimeTrackDate IS NULL ";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { date});
        }
        public void CreateTimeWithEnd(Models.Time time, int userId)
        {
            string query = "INSERT INTO UserTime (StartTimeTrackDate, EndTimeTrackDate, UserId) VALUES (@StartTimeTrackDate, @EndTimeTrackDate, @userId)";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { time.StartTimeTrackDate, time.EndTimeTrackDate, userId });
        }
        public string GetQueryCreateTimeWithEnd(Models.Time time, int userId)
        {
            return $"INSERT INTO UserTime (StartTimeTrackDate, EndTimeTrackDate, UserId) VALUES ({DapperBulk.GetDateString(time.StartTimeTrackDate)}, {DapperBulk.GetDateString(time.EndTimeTrackDate.Value)}, {userId})";
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
        public bool IsStarted(int userId)
        {
            string query = $"SELECT Count(*) FROM UserTime WHERE UserId = 5 AND EndTimeTrackDate is null";
            using var connection = _dapperContext.CreateConnection();
            return connection.QuerySingle<int>(query, new { userId }) > 0;
        }
    }
    public enum LasUpdatedBy
    {
        None,
        Auto,
        Hand
    }
}
