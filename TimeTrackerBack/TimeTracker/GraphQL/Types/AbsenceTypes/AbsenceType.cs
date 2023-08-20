using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.AbsenceTypes
{
    public class AbsenceType : ObjectGraphType<Absence>
    {
        public AbsenceType()
        {
            Field(i => i.UserId, type: typeof(IdGraphType));
            Field(i => i.Type, type: typeof(StringGraphType));
            Field(i => i.Date, type: typeof(DateGraphType));
        }
    }
}