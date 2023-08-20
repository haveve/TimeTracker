using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarOutputGraphType : ObjectGraphType<CalendarEvent>
    {
        public CalendarOutputGraphType()
        {
            Field(c => c.UserId, nullable: false);
            Field(c => c.Title, nullable: false);
            Field(c => c.EndDate, nullable: false);
            Field(c => c.StartDate, nullable: false);
        }
    }
}
