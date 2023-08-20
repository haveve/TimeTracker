using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Queries;

namespace TimeTracker.GraphQL.Schemas
{
    public class UserShema : Schema
    {
        public UserShema(IServiceProvider provider) : base(provider)
        {
            Query = provider.GetRequiredService<UserQuery>().AuthorizeWithPolicy("Authorized");
            Mutation = provider.GetRequiredService<UserMutation>().AuthorizeWithPolicy("Authorized");
        }
    }
}
