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
        public Time GetTime(int userId)
        {
            string query = $"SELECT * FROM Time WHERE UserId = {userId}";
            using var connection = _dapperContext.CreateConnection();

            var time = connection.QuerySingle<Time>(query);
            return time;
        }
        public void AddTimeInSeconds(int seconds,int userId)
        {
            string query = $"UPDATE Time SET DaySeconds = DaySeconds+{seconds}, WeekSeconds = WeekSeconds+{seconds}, MonthSeconds = MonthSeconds+{seconds} WHERE UserId = {userId}";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query);
        }

        public void UpdateTime(Time time, int userId)
        {
            string query =
                @$"UPDATE Time SET TodayDate = @TodayDate, DaySeconds = @DaySeconds, WeekSeconds = @WeekSeconds, StartTimeTrackDate = @StartTimeTrackDate, EndTimeTrackDate = @EndTimeTrackDate WHERE Id = {userId}";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, time);
        }

        public void SetStartOrEndTrackDate(StartOrEnd startOrEnd, DateTime date, int userId)
        {
            string query = "";
            switch (startOrEnd)
            {
                case StartOrEnd.Start: query = $"UPDATE Time SET StartTimeTrackDate = @date WHERE UserId = {userId}"; break;
                case StartOrEnd.End: query = $"UPDATE Time SET EndTimeTrackDate = @date WHERE UserId = {userId}"; break;
            }

            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query,new{date});
        }
    }
}
