using GraphQL.Types;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Types.Time
{
    public class TimeMutationGraphType:ObjectGraphType
    {
        private readonly ITimeRepository _timeRepository;
        public TimeMutationGraphType(ITimeRepository timeRepository)
        {
            _timeRepository = timeRepository;

            Field<StringGraphType>("addOneSecond")
                .Resolve(context =>
                {
                    _timeRepository.AddOneSecond(TimeQueryGraphqlType.GetUserIdFromClaims(context.User!));
                    return "Successfully";
                });
        }
    }
}
