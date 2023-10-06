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

                    var userId = TimeQueryGraphQLType.GetUserIdFromClaims(context.User!);

                    var oldSeconds = TimeQueryGraphQLType.getSecondsOfSession(new(), oldTime, offSet, startOfWeek);
                    var newSeconds = TimeQueryGraphQLType.getSecondsOfSession(new(), userTime, offSet, startOfWeek);
                    _timeRepository.UpdateTime(oldTime.StartTimeTrackDate, userTime, userId);

                    return new UpdateTimeResultViewModel() { oldSeconds = oldSeconds,newSeconds = newSeconds};
                }).AuthorizeWithPolicy("EditWorkHours");

            Field<StringGraphType>("updateUserTime")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .Argument<NonNullGraphType<ManageTimeInputGrpahqType>>("oldTime")
                .Argument<NonNullGraphType<ManageTimeInputGrpahqType>>("userTime")
                .Argument<IntGraphType>("offSet")
                .Argument<NonNullGraphType<EnumerationGraphType<startOfWeek>>>("startOfWeek")
                .Resolve(context =>
                {
                    var userId = context.GetArgument<int>("id");
                    var userTime = context.GetArgument<Models.Time>("userTime");
                    var oldTime = context.GetArgument<Models.Time>("oldTime");
                    var startOfWeek = context.GetArgument<startOfWeek>("startOfWeek");
                    var offSet = context.GetArgument<int?>("offSet") ?? 0;

                    _timeRepository.UpdateTime(oldTime.StartTimeTrackDate, userTime, userId);
                    return "Session was updated successfully";
                }).AuthorizeWithPolicy("EditWorkHours");

            Field<StringGraphType>("deleteUserTime")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .Argument<NonNullGraphType<ManageTimeInputGrpahqType>>("userTime")
                .Resolve(context =>
                {
                    var userId = context.GetArgument<int>("id");
                    var userTime = context.GetArgument<Models.Time>("userTime");

                    _timeRepository.DeleteTime(userId, userTime.StartTimeTrackDate);
                    return "Session was deleted successfully";
                }).AuthorizeWithPolicy("EditWorkHours");

            Field<StringGraphType>("createUserTime")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .Argument<NonNullGraphType<ManageTimeInputGrpahqType>>("userTime")
                .Resolve(context =>
                {
                    var userId = context.GetArgument<int>("id");
                    var userTime = context.GetArgument<Models.Time>("userTime");

                    if (_timeRepository.GetTimeByStartDate(userId, userTime.StartTimeTrackDate) != null) return "Session already exists";
                    _timeRepository.CreateTimeWithEnd(userTime, userId);
                    return "Session was created successfully";
                }).AuthorizeWithPolicy("EditWorkHours");
        }
    }
}
