using GraphQL.Types;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;
using TimeTracker.GraphQL.Types.UserTypes;

namespace TimeTracker.GraphQL.Types.IdentityTipes
{
    public class IdentityOutPutGraphType:ObjectGraphType<LoginOutput>
    {
        public IdentityOutPutGraphType() 
        {
            Field(l => l.access_token, nullable: false);
            Field(l => l.current_user, nullable: false,type: typeof(UserType));
        }
    }
}
