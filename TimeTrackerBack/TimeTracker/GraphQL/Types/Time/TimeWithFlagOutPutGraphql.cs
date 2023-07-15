using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time
{
    public class TimeWithFlagOutPutGraphql:ObjectGraphType<TimeWithFlagViewModel>
    {
        public TimeWithFlagOutPutGraphql()
        {
            Field(t => t.Time, nullable: false, typeof(TimeOutPutGraphql));
            Field(t => t.IsStarted, nullable: false);
        }
    }
}
