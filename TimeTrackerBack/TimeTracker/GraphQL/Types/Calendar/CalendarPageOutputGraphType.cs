using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarPageOutputGraphType:ObjectGraphType<CalendarPage>
    {
        public CalendarPageOutputGraphType()
        {
            Field(cl=>cl.CalendarUsers,nullable: false, type: typeof(ListGraphType<CalendarUserViewModelGraphType>));
            Field(cl=>cl.Count,nullable: false);
        }
    }
}
