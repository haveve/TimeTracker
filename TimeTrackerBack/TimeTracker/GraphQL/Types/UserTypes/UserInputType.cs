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
        }
    }
}
