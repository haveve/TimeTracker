using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarInputGraphType : InputObjectGraphType<CalendarEventViewModel>
    {
        public CalendarInputGraphType()
        {
            Field(c => c.Title, nullable: false);
            Field(c => c.EndDate, nullable: false);
            Field(c => c.StartDate, nullable: false);
        }
    }
}
