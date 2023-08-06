using GraphQL.Types;
using System.Text.Json.Serialization.Metadata;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Calendar.GlobalCalendar
{
    public class CalendarGlobalInputGraphType : InputObjectGraphType<GlobalEventsViewModel>
    {
        public CalendarGlobalInputGraphType()
        {
            Field(cg => cg.TypeOfGlobalEvent);
            Field(cg => cg.Name);
            Field(cg => cg.Date);
        }
    }
}
