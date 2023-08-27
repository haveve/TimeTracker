using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.AbsenceTypes
{
    public class AbsenceGraphType : ObjectGraphType<Absence>
    {
        public AbsenceGraphType()
        {
            Field(i => i.UserId, type: typeof(IdGraphType));
            Field(i => i.Type, type: typeof(StringGraphType));
            Field(i => i.Date, type: typeof(DateGraphType));
        }
    }
}