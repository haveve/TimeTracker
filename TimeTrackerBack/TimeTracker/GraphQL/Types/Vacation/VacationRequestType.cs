using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.Vacation
{
    public class VacationRequestType : ObjectGraphType<VacationRequest>
    {
        public VacationRequestType()
        {
            Field(i => i.Id, type: typeof(IdGraphType));
            Field(i => i.RequesterId, type: typeof(IntGraphType));
            Field(i => i.InfoAboutRequest, type: typeof(StringGraphType));
            Field(i => i.Status, type: typeof(StringGraphType));
            Field(i => i.ApproversList, type: typeof(ListGraphType<StringGraphType>));
        }
    }
}
