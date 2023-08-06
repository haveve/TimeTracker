using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Time.ManageTime
{
    public class ManageTimeMutationGraphType:ObjectGraphType
    {
        private readonly ITimeRepository _timeRepository;
        public ManageTimeMutationGraphType(ITimeRepository timeRepository)
        {
            _timeRepository = timeRepository;

            Field<StringGraphType>("updateTime")
                .Argument<NonNullGraphType<DateTimeGraphType>>("oldStartTime")
                .Argument<NonNullGraphType<ManageTimeInputGrpahqType>>("userTime")
                .Resolve(context =>
                {
                    var userTime = context.GetArgument<Models.Time>("userTime");
                    var oldStartTime = context.GetArgument<DateTime>("oldStartTime");


                    var userId = TimeQueryGraphqlType.GetUserIdFromClaims(context.User!);

                    _timeRepository.UpdateTime(oldStartTime, userTime, userId);

                    return "successfully";
                }).AuthorizeWithPolicy("EditWorkHours");
        }
    }
}
