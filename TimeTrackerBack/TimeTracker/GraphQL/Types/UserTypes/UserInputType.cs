using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.UserTypes
{
    public class UserInputType : InputObjectGraphType<User>
    {
        public UserInputType()
        {
            Field(i => i.Login);
            Field(i => i.Password);
            Field(i => i.FullName);
            Field(i => i.Email);
            Field(i => i.CRUDUsers, type: typeof(BooleanGraphType));
            Field(i => i.EditPermiters, type: typeof(BooleanGraphType));
            Field(i => i.ViewUsers, type: typeof(BooleanGraphType));
            Field(i => i.EditWorkHours, type: typeof(BooleanGraphType));
            Field(i => i.ImportExcel, type: typeof(BooleanGraphType));
            Field(i => i.ControlPresence, type: typeof(BooleanGraphType));
            Field(i => i.ControlDayOffs, type: typeof(BooleanGraphType));
            Field(i => i.WorkHours, type: typeof(IntGraphType));
        }
    }
}
