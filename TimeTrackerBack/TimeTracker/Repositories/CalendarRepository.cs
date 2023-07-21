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
            addEvent.EndDate = TimeQueryGraphqlType.ToUkraineDateTime(addEvent.EndDate);
            addEvent.StartDate = TimeQueryGraphqlType.ToUkraineDateTime(addEvent.StartDate);
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, addEvent);
        }

        public void AddEventRange(int userId, List<CalendarEventViewModel> addEventRange)
        {
            string query = $"INSERT INTO CalendarEvents (UserId, Title, StartDate, EndDate) VALUES({userId}, @Title, @StartDate, @EndDate)";
            addEventRange.ForEach(ev =>
            {
                ev.EndDate = TimeQueryGraphqlType.ToUkraineDateTime(ev.EndDate);
                ev.StartDate = TimeQueryGraphqlType.ToUkraineDateTime(ev.StartDate);
            });
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
            startDate = TimeQueryGraphqlType.ToUkraineDateTime(startDate);
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, new {userId,startDate});
        }

        public void UpdateEvent(int userId, DateTime oldStartDate, CalendarEventViewModel updatedData)
        {
            string query = $"UPDATE CalendarEvents SET Title = @Title, StartDate = @StartDate, EndDate = @EndDate WHERE UserId = {userId} AND StartDate = @oldStartDate";
            oldStartDate = TimeQueryGraphqlType.ToUkraineDateTime(oldStartDate);
            updatedData.EndDate = TimeQueryGraphqlType.ToUkraineDateTime(updatedData.EndDate);
            updatedData.StartDate = TimeQueryGraphqlType.ToUkraineDateTime(updatedData.StartDate);
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, new { oldStartDate, updatedData.StartDate, updatedData.EndDate,updatedData.Title });
        }
    }
}
