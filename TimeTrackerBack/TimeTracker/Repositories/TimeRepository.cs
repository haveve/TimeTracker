using Dapper;
using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public class TimeRepository:ITimeRepository
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
        public void AddOneSecond(int userId)
        {
            string query = $"UPDATE Time SET DaySeconds = DaySeconds+1, WeekSeconds = WeekSeconds+1, MonthSeconds = MonthSeconds+1 WHERE UserId = {userId}";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query);
        }
        public void UpdateTime(Time time,int userId)
        {
            string query = 
                @$"UPDATE Time SET todayDate = @todayDate, startMonthDate = @startMonthDate, startWeekDate = @startWeekDate, DaySeconds = @DaySeconds, WeekSeconds = @WeekSeconds, MonthSeconds = @MonthSeconds WHERE Id = {userId}";
           using var connection = _dapperContext.CreateConnection();
             connection.Execute(query, time);
        }
    }
}
