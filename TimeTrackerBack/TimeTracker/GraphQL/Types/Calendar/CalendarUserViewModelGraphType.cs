using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarUserViewModelGraphType:ObjectGraphType<CalendarUserViewModel>
    {
        public CalendarUserViewModelGraphType()
        {
            Field(cl=>cl.Id,nullable: false);
            Field(cl => cl.FullName, nullable: false);
            Field(cl => cl.Email, nullable: false);
        }
    }
}
