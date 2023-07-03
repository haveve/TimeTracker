using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types
{
    public class UserType : ObjectGraphType<User>
    {
        public UserType()
        {
            Field(i => i.Id, type: typeof(IdGraphType));
            Field(i => i.Login);
            Field(i => i.Password);
            Field(i => i.FullName);
        }
    }
}
