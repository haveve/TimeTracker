using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.UserTypes
{
    public class PermissionsInputGraphType : InputObjectGraphType<Permissions>
    {
        public PermissionsInputGraphType()
        {
            Field(i => i.userId, type: typeof(IdGraphType));
            Field(i => i.CRUDUsers, type: typeof(BooleanGraphType));
            Field(i => i.EditApprovers, type: typeof(BooleanGraphType));
            Field(i => i.ViewUsers, type: typeof(BooleanGraphType));
            Field(i => i.EditWorkHours, type: typeof(BooleanGraphType));
            Field(i => i.ExportExcel, type: typeof(BooleanGraphType));
            Field(i => i.ControlPresence, type: typeof(BooleanGraphType));
            Field(i => i.ControlDayOffs, type: typeof(BooleanGraphType));
        }
    }
}
