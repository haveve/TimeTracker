using Dapper;
using Microsoft.AspNetCore.Identity;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public class CalendarRepository : ICalendarRepository
    {
        private readonly DapperContext _dapperContext;

        public CalendarRepository(DapperContext context) 
        {
            _dapperContext = context;
        }

        public void AddEvent(int userId, CalendarEventViewModel addEvent)
        {
            string query = $"INSERT INTO CalendarEvents (UserId, Title, StartDate, EndDate) VALUES({userId}, @Title, @StartDate, @EndDate)";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, addEvent);
        }

        public void AddEventRange(int userId, List<CalendarEventViewModel> addEventRange)
        {
            string query = $"INSERT INTO CalendarEvents (UserId, Title, StartDate, EndDate) VALUES({userId}, @Title, @StartDate, @EndDate)";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, addEventRange);
        }

        public List<CalendarEvent> GetAllEvents(int userId)
        {
            string query = $"SELECT * FROM CalendarEvents WHERE UserId = {userId}";
            using var dapperConnection = _dapperContext.CreateConnection();
            var events =  dapperConnection.Query<CalendarEvent>(query).ToList();
            return events?? new();
        }

        public void RemoveEvent(int userId, DateTime startDate)
        {
            string query = "DELETE FROM CalendarEvents WHERE UserId = @userId AND StartDate = @startDate";
            startDate = TimeQueryGraphqlType.ToUtcDateTime(startDate);
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, new {userId,startDate});
        }

        public void UpdateEvent(int userId, DateTime oldStartDate, CalendarEventViewModel updatedData)
        {
            string query = $"UPDATE CalendarEvents SET Title = @Title, StartDate = @StartDate, EndDate = @EndDate WHERE UserId = {userId} AND StartDate = @oldStartDate";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, new { oldStartDate, updatedData.StartDate, updatedData.EndDate,updatedData.Title });
        }
    }
}
