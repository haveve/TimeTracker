﻿using Dapper;
using Microsoft.AspNetCore.Identity;
using System.Globalization;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Models;
using TimeTracker.Services;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public class CalendarRepository : ICalendarRepository
    {
        private readonly DapperContext _dapperContext;
        private readonly IAbsenceRepository _absenceRepository;

        public CalendarRepository(DapperContext context, IAbsenceRepository absenceRepository)
        {
            _dapperContext = context;
            _absenceRepository = absenceRepository;
        }

        public void AddEvent(int userId, CalendarEventViewModel addEvent)
        {
            string query = $"INSERT INTO CalendarEvents (UserId, Title, StartDate, EndDate) VALUES({userId}, @Title, @StartDate, @EndDate)";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, addEvent);
        }

        public void AddEventRange(int userId, List<CalendarEventViewModel> addEventRange)
        {
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.BulkInsert<CalendarEventViewModel>(addEventRange,(ce)=>$"({userId}, '{ce.Title}', '{ce.StartDate.ToString("yyyy-MM-dd HH:mm:ss.fff",CultureInfo.InvariantCulture)}', '{ce.EndDate.ToString("yyyy-MM-dd HH:mm:ss.fff")}')", "(UserId, Title, StartDate, EndDate)", "CalendarEvents");
        }

        public List<CalendarEvent> GetAllEvents(int userId)
        {
            string query = $"SELECT * FROM CalendarEvents WHERE UserId = {userId}";
            using var dapperConnection = _dapperContext.CreateConnection();
            var events = dapperConnection.Query<CalendarEvent>(query).ToList();
            return events ?? new();
        }

        public List<GlobalEventsViewModel> GetAllGlobalEvents()
        {
            string query = $"SELECT * FROM GlobalCalendar";
            using var dapperConnection = _dapperContext.CreateConnection();
            var events = dapperConnection.Query<GlobalEventsViewModel>(query).ToList();
            return events ?? new();
        }
        public GlobalEventsViewModel GetDateGlobalEvent(DateTime date)
        {
            string daydate = date.ToString("yyyy-MM-dd");
            string query = $"SELECT * FROM GlobalCalendar WHERE convert(varchar(10), [Date], 120) = @daydate";
            using var dapperConnection = _dapperContext.CreateConnection();
            var globalevent = dapperConnection.Query<GlobalEventsViewModel>(query, new { daydate }).FirstOrDefault();
            return globalevent ?? null;
        }
        public void RemoveGlobalEvent(DateTime date)
        {
            string query = "DELETE FROM GlobalCalendar WHERE Date = @date";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, new { date });
        }

        public void UpdateGlobalEvent(DateTime date1, GlobalEventsViewModel updatedData)
        {
            string query = $"UPDATE GlobalCalendar SET Date = @Date, Name = @Name, TypeOfGlobalEvent = @TypeOfGlobalEvent WHERE Date = @date1";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, new { date1, updatedData.Date, updatedData.Name, updatedData.TypeOfGlobalEvent });
        }
        public void AddGlobalEvent(GlobalEventsViewModel addEvent)
        {
            string query = $"INSERT INTO GlobalCalendar (Name, Date, TypeOfGlobalEvent) VALUES(@Name, @Date, @TypeOfGlobalEvent)";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, addEvent);
        }

        public void RemoveEvent(int userId, DateTime startDate)
        {
            string query = "DELETE FROM CalendarEvents WHERE UserId = @userId AND StartDate = @startDate";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, new { userId, startDate });
        }

        public void UpdateEvent(int userId, DateTime oldStartDate, CalendarEventViewModel updatedData)
        {
            string query = $"UPDATE CalendarEvents SET Title = @Title, StartDate = @StartDate, EndDate = @EndDate WHERE UserId = {userId} AND StartDate = @oldStartDate";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, new { oldStartDate, updatedData.StartDate, updatedData.EndDate, updatedData.Title });
        }
        public void AddEvenGlobaltRange(List<GlobalEventsViewModel> addEventRange)
        {
            string query = $"INSERT INTO GlobalCalendar (Name, Date, TypeOfGlobalEvent) VALUES(@Name, @Date, @TypeOfGlobalEvent)";
            using var dapperConnection = _dapperContext.CreateConnection();
            dapperConnection.Execute(query, addEventRange);
        }
        public List<CalendarEvent> GetAllUsersVacations(int userId)
        {
            string query = $"Select StartDate, EndDate FROM VacationRequests Where RequesterId = {userId} AND Status = 'Approved'";
            using var dapperConnection = _dapperContext.CreateConnection();
            var vacations = dapperConnection.Query<CalendarEvent>(query).ToList();
            vacations.ForEach(v => { v.Type = SpecialEventType.Vacation;v.Title = "Vacation"; });
            return vacations;
        }
        public List<CalendarEvent> GetAllUsersAbsences(int userId)
        {
            List<Absence> userAbsences = _absenceRepository.GetUserAbsence(userId);
            return userAbsences.Select(ab => new CalendarEvent() { StartDate = ab.Date, EndDate = ab.Date, Title = ab.Type, Type = GetSpecialEventType(ab.Type) }).ToList();
        }

        public SpecialEventType GetSpecialEventType(string eventStringType)
        {
            switch (eventStringType)
            {
                case "Illness": return SpecialEventType.Ill;
                case "Absence": return SpecialEventType.Ansent;
                case "Vacation": return SpecialEventType.Vacation;
            }
            throw new ArgumentException("event type is invalid");
        }
    }
}
