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
            Field(i => i.Requester, type: typeof(UserTypes.UserGraphType));
            Field(i => i.InfoAboutRequest, type: typeof(StringGraphType));
            Field(i => i.Status, type: typeof(StringGraphType));
            Field(i => i.ApproversNodes, type: typeof(ListGraphType<ApproverNodeType>));
            Field(i => i.StartDate);
            Field(i => i.EndDate);
        }
    }
}
