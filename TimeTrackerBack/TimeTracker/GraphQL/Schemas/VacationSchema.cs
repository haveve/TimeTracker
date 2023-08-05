using GraphQL.Types;
using TimeTracker.GraphQL.Queries;

namespace TimeTracker.GraphQL.Schemas
{
    public class VacationSchema : Schema
    {
        public VacationSchema(IServiceProvider provider) : base(provider)
        {
            Query = provider.GetRequiredService<VacationQuery>();
            Mutation = provider.GetRequiredService<VacationMutation>();
        }
    }
}
