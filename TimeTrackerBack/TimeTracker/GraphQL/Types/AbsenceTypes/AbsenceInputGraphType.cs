using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.AbsenceTypes
{
    public class AbsenceInputGraphType : InputObjectGraphType<Absence>
    {
        public AbsenceInputGraphType()
        {
            Field(i => i.UserId, type: typeof(IdGraphType));
            Field(i => i.Type, type: typeof(StringGraphType));
            Field(i => i.Date, type: typeof(DateGraphType));
        }
    }
}
