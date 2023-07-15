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
            string query = $"SELECT ToDayDate, DaySeconds, WeekSeconds, MonthSeconds, StartTimeTrackDate, EndTimeTrackDate  FROM Users WHERE Id = {userId}";
            using var connection = _dapperContext.CreateConnection();

            var time = connection.QuerySingle<Time>(query);
            return time;
        }
        public void AddTimeInSeconds(int seconds, int userId)
        {
            string query = $"UPDATE Users SET DaySeconds = DaySeconds+{seconds}, WeekSeconds = WeekSeconds+{seconds}, MonthSeconds = MonthSeconds+{seconds} WHERE Id = {userId}";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query);
        }

        public void UpdateTime(Time time, int userId, UpdateTimeE updateTime)
        {
            string query = "";

            switch (updateTime)
            {
                case UpdateTimeE.FullTime:
                    query =
                       @$"UPDATE Users SET TodayDate = @TodayDate, DaySeconds = @DaySeconds, WeekSeconds = @WeekSeconds, MonthSeconds = @MonthSeconds, StartTimeTrackDate = @StartTimeTrackDate, EndTimeTrackDate = @EndTimeTrackDate WHERE Id = {userId}";
                    break;
                case UpdateTimeE.OnlySeconds:
                    query =
                        @$"UPDATE Users SET DaySeconds = @DaySeconds, WeekSeconds = @WeekSeconds, MonthSeconds = @MonthSeconds WHERE Id = {userId}";
                    break;
            }
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, time);
        }

        public void SetStartOrEndTrackDate(StartOrEnd startOrEnd, DateTime date, int userId)
        {
            string query = "";
            switch (startOrEnd)
            {
                case StartOrEnd.Start: query = $"UPDATE Users SET StartTimeTrackDate = @date WHERE Id = {userId}"; break;
                case StartOrEnd.End: query = $"UPDATE Users SET EndTimeTrackDate = @date WHERE Id = {userId}"; break;
            }

            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { date });
        }
    }
}
