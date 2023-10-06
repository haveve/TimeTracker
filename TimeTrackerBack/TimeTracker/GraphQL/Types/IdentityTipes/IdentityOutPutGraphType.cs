using GraphQL.Types;
using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;
using TimeTracker.GraphQL.Types.UserTypes;

namespace TimeTracker.GraphQL.Types.IdentityTipes
{
    public class IdentityOutPutGraphType:ObjectGraphType<LoginOutput>
    {
        public IdentityOutPutGraphType() 
        {
            Field(l => l.access_token, nullable: true, type: typeof(TokenResultGraphType));
            Field(l => l.user_id, nullable: false);
            Field(l => l.refresh_token, nullable: true, type: typeof(TokenResultGraphType));
            Field(l => l.is_fulltimer, nullable: false, type: typeof(BooleanGraphType));
            Field(l => l.redirect_url, nullable: true);
        }
    }
}
