using TimeTracker.GraphQL.Types.Calendar;
using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public interface ICalendarRepository
    {
        public void AddEvent(int userId, CalendarEventViewModel addEvent);
        public void AddEventRange(int userId, List<CalendarEventViewModel> addEventRange);
        public List<CalendarEvent> GetAllEvents(int userId, MonthOrWeek weekOrMonth, DateTime date);
        public void RemoveEvent(int userId,DateTime startDate);
        public void UpdateEvent(int userId, DateTime oldStartDate, CalendarEventViewModel updatedData);
        public List<GlobalEventsViewModel> GetAllGlobalEvents(MonthOrWeek? weekOrMonth = null, DateTime? date = null);
        public GlobalEventsViewModel GetDateGlobalEvent(DateTime date);
        public void RemoveGlobalEvent(DateTime date);
        public void AddGlobalEvent(GlobalEventsViewModel addEvent);
        public void UpdateGlobalEvent(DateTime date, GlobalEventsViewModel updatedData);
        public void AddEvenGlobaltRange(List<GlobalEventsViewModel> addEventRange);
        public List<CalendarEvent> GetAllUsersVacations(int userId, MonthOrWeek weekOrMonth, DateTime date);
        public List<CalendarEvent> GetAllUsersAbsences(int userId, MonthOrWeek weekOrMonth, DateTime date);
        public SpecialEventType GetSpecialEventType(string eventStringType);
    }
}
