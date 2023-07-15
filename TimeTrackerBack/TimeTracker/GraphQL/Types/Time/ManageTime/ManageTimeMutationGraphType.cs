using GraphQL;
using GraphQL.Types;
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
                .Argument<NonNullGraphType<IntGraphType>>("userId")
                .Argument<NonNullGraphType<ManageTimeInputGrpahqType>>("userTime")
                .Resolve(context =>
                {
                    var userid = context.GetArgument<int>("userId");
                    var userTime = context.GetArgument<TimeViewModel>("userTime");

                    _timeRepository.UpdateTime(new Models.Time(userTime), userid, UpdateTimeE.OnlySeconds);

                    return "successfully";
                });
        }
    }
}
