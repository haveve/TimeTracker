using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time.ManageTime
{
    public class UpdateTimeOutputGraphqlType : ObjectGraphType<UpdateTimeResultViewModel>
    {
        public UpdateTimeOutputGraphqlType()
        {
            Field(ut => ut.newSeconds, nullable: false);
            Field(ut => ut.oldSeconds, nullable: false);
        }
    }
}
