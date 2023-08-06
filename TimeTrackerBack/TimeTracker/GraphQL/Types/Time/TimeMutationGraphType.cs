using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types.Time.ManageTime;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Types.Time
{
    public class TimeMutationGraphType : ObjectGraphType
    {
        private readonly ITimeRepository _timeRepository;
        public TimeMutationGraphType(ITimeRepository timeRepository)
        {
            _timeRepository = timeRepository;

            Field<DateTimeGraphType>("setStartDate")
                .Resolve(context =>
                {
                    var startDay = DateTime.UtcNow;
                    _timeRepository.CreateTime(
                        startDay,
                        TimeQueryGraphqlType.GetUserIdFromClaims(context.User!));
                    return startDay;
                });
            Field<DateTimeGraphType>("setEndDate")
                .Resolve(context =>
                 {
                     var endDay = DateTime.UtcNow;
                     _timeRepository.SetEndTrackDate(
                        endDay,
                        TimeQueryGraphqlType.GetUserIdFromClaims(context.User!));
                     return endDay;
                 });
            Field<ManageTimeMutationGraphType>("manageTime")
                .Resolve(context => new { }).AuthorizeWithPolicy("ControlPresence"); ;
        }
    }
}
