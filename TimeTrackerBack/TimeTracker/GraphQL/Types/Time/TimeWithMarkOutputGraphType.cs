using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time
{
    public class TimeWithMarkOutputGraphType : ObjectGraphType<TimeWithMark>
    {
        public TimeWithMarkOutputGraphType()
        {
            Field(t => t.StartTimeTrackDate, nullable: false);
            Field(t => t.EndTimeTrackDate, nullable: true);
            Field(t => t.TimeMark, nullable: false, type: typeof(EnumerationGraphType<TimeMark>));
        }
    }
}
