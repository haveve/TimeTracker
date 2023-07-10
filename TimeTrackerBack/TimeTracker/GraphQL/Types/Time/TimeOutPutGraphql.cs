using GraphQL.Types;
using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time
{
    public class TimeOutPutGraphql: ObjectGraphType<TimeView>
    {
        public TimeOutPutGraphql()
        {
            Field(t => t.DaySeconds, nullable: false);
            Field(t => t.WeekSeconds, nullable: false);
            Field(t => t.MonthSeconds, nullable: false);
        }
    }
}
