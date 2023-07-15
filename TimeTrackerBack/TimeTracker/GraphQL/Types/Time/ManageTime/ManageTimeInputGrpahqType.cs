using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time.ManageTime
{
    public class ManageTimeInputGrpahqType:InputObjectGraphType<TimeViewModel>
    {
        public ManageTimeInputGrpahqType()
        {
            Field(t => t.DaySeconds, nullable: false);
            Field(t => t.WeekSeconds, nullable: false);
            Field(t => t.MonthSeconds, nullable: false);
        }
    }
}
