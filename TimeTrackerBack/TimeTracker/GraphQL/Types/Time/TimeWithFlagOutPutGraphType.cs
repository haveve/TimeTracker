using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time
{
    public class TimeWithFlagOutPutGraphType:ObjectGraphType<TimeWithFlagViewModel>
    {
        public TimeWithFlagOutPutGraphType()
        {
            Field(t => t.Time, nullable: false, typeof(TimeOutPutGraphType));
            Field(t => t.IsStarted, nullable: false);
            Field(t=>t.ItemsCount, nullable: false);
        }
    }
}
