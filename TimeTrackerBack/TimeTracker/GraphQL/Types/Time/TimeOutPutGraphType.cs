using GraphQL.Types;
using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time
{
    public class TimeOutPutGraphType: ObjectGraphType<TimeViewModel>
    {
        public TimeOutPutGraphType()
        {
            Field(t => t.DaySeconds, nullable: false);
            Field(t => t.WeekSeconds, nullable: false);
            Field(t => t.MonthSeconds, nullable: false);
            Field(t => t.Sessions, nullable: false, type: typeof(ListGraphType<TimeWithMarkOutputGraphType>));
        }
    }
}
