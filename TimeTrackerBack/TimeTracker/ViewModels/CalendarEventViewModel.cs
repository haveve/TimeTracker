using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TimeTracker.ViewModels
{
    public class CalendarEventViewModel
    {
        public string Title { get; set; } = null!;
        public DateTime StartDate { get; set;}
        public DateTime EndDate { get; set; }
    }
}
