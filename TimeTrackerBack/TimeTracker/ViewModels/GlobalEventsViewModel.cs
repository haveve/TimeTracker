using TimeTracker.GraphQL.Types.Calendar;

namespace TimeTracker.ViewModels
{
    public class GlobalEventsViewModel
    {
        public string Name { get; set; }
        public DateTime Date { get; set; }
        public TypeOfGlobalEvent TypeOfGlobalEvent { get; set; }

        public GlobalEventsViewModel()
        { 
        
        }

        public GlobalEventsViewModel(string name, DateTime date, TypeOfGlobalEvent globalEvent)
        {
            Name = name;
            Date = date;
            TypeOfGlobalEvent = globalEvent;
        }
    }
}
