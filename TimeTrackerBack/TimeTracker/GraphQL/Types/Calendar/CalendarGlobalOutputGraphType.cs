using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarGlobalOutputGraphType:ObjectGraphType<GlobalEventsViewModel>
    {
        public CalendarGlobalOutputGraphType()
        {
            Field(cg => cg.TypeOfGlobalEvent);
            Field(cg => cg.Name);
            Field(cg => cg.Date);
        }
    }
}
