using GraphQL.Types;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;

namespace TimeTracker.GraphQL.Types.IdentityTipes
{
    public class LoginInputType:InputObjectGraphType<Login>
    {
        public LoginInputType() 
        {
            Field(l => l.LoginOrEmail,nullable:false);
            Field(l => l.Password, nullable: false);
        }
    }
}
