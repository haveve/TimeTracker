using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.Repositories
{
    public interface ICalendarRepository
    {
        public void AddEvent(int userId, CalendarEventViewModel addEvent);
        public void AddEventRange(int userId, List<CalendarEventViewModel> addEventRange);
        public List<CalendarEvent> GetAllEvents(int userId);
        public void RemoveEvent(int userId,DateTime startDate);
        public void UpdateEvent(int userId, DateTime oldStartDate, CalendarEventViewModel updatedData);
    }
}
