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

            Field<StringGraphType>("setStartDate")
                .Resolve(context =>
                {
                    _timeRepository.SetStartOrEndTrackDate(
                        StartOrEnd.Start,
                        TimeQueryGraphqlType.ToUkraineDateTime(DateTime.Now),
                        TimeQueryGraphqlType.GetUserIdFromClaims(context.User!));
                    return "Successfully";
                });
            Field<StringGraphType>("setEndDate")
                .Resolve(context =>
                 {
                     _timeRepository.SetStartOrEndTrackDate(
                        StartOrEnd.End,
                        TimeQueryGraphqlType.ToUkraineDateTime(DateTime.Now),
                        TimeQueryGraphqlType.GetUserIdFromClaims(context.User!));
                     return "Successfully";
                 });
            Field<ManageTimeMutationGraphType>("manageTime")
                .Resolve(context => new { });
        }
    }
}
