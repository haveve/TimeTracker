using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types.Time.ManageTime;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Types.Time
{
    public class TimeMutationGraphQLType : ObjectGraphType
    {
        private readonly ITimeRepository _timeRepository;
        public TimeMutationGraphQLType(ITimeRepository timeRepository)
        {
            _timeRepository = timeRepository;

            Field<DateTimeGraphType>("setStartDate")
                .Resolve(context =>
                {
                    var startDay = DateTime.UtcNow;
                    _timeRepository.CreateTime(
                        startDay,
                        TimeQueryGraphQLType.GetUserIdFromClaims(context.User!));
                    return startDay;
                });
            Field<DateTimeGraphType>("setEndDate")
                .Resolve(context =>
                 {
                     var endDay = DateTime.UtcNow;
                     _timeRepository.SetEndTrackDate(
                        endDay,
                        TimeQueryGraphQLType.GetUserIdFromClaims(context.User!));
                     return endDay;
                 });
            Field<ManageTimeMutationGraphType>("manageTime")
                .Resolve(context => new { }).AuthorizeWithPolicy("ControlPresence"); ;
        }
    }
}
