using GraphQL;
using GraphQL.Types;
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time.ManageTime
{
    public class ManageTimeMutationGraphType : ObjectGraphType
    {
        private readonly ITimeRepository _timeRepository;
        public ManageTimeMutationGraphType(ITimeRepository timeRepository)
        {
            _timeRepository = timeRepository;

            Field<UpdateTimeOutputGraphqlType>("updateTime")
                .Argument<NonNullGraphType<ManageTimeInputGrpahqType>>("oldTime")
                .Argument<NonNullGraphType<ManageTimeInputGrpahqType>>("userTime")
                .Argument<IntGraphType>("offSet")
                .Argument<NonNullGraphType<EnumerationGraphType<startOfWeek>>>("startOfWeek")
                .Resolve(context =>
                {
                    var userTime = context.GetArgument<Models.Time>("userTime");
                    var oldTime = context.GetArgument<Models.Time>("oldTime");
                    var startOfWeek = context.GetArgument<startOfWeek>("startOfWeek");
                    var offSet = context.GetArgument<int?>("offSet") ?? 0;

                    var userId = TimeQueryGraphqlType.GetUserIdFromClaims(context.User!);

                    var oldSeconds = TimeQueryGraphqlType.getSecondsOfSession(new(), oldTime, offSet, startOfWeek);
                    var newSeconds = TimeQueryGraphqlType.getSecondsOfSession(new(), userTime, offSet, startOfWeek);
                    _timeRepository.UpdateTime(oldTime.StartTimeTrackDate, userTime, userId);

                    return new UpdateTimeResultViewModel() { oldSeconds = oldSeconds,newSeconds = newSeconds};
                }).AuthorizeWithPolicy("EditWorkHours");
        }
    }
}
