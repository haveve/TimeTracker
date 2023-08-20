using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time.ManageTime
{
    public class ManageTimeInputGrpahqType:InputObjectGraphType<Models.Time>
    {
        public ManageTimeInputGrpahqType()
        {
            Field(t => t.EndTimeTrackDate, nullable: true);
            Field(t => t.StartTimeTrackDate, nullable: false);
        }
    }
}
