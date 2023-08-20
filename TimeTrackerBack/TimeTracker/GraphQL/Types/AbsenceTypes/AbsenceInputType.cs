using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.AbsenceTypes
{
    public class AbsenceInputType : InputObjectGraphType<Absence>
    {
        public AbsenceInputType()
        {
            Field(i => i.UserId, type: typeof(IdGraphType));
            Field(i => i.Type, type: typeof(StringGraphType));
            Field(i => i.Date, type: typeof(DateGraphType));
        }
    }
}
