using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.UserTypes
{
    public class UserInputGraphType : InputObjectGraphType<User>
    {
        public UserInputGraphType()
        {
            Field(i => i.Login);
            Field(i => i.Password);
            Field(i => i.FullName);
            Field(i => i.Email);
            Field(i => i.WorkHours);
        }
    }
}
