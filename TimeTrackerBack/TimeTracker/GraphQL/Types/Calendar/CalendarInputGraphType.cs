using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarInputGraphType : InputObjectGraphType<GlobalEventsViewModel>
    {
        public CalendarInputGraphType()
        {
            Field(c => c.Name, nullable: false);
            Field(c => c.Date, nullable: false);
            Field(c => c.TypeOfGlobalEvent, nullable: false);
        }
    }
}
