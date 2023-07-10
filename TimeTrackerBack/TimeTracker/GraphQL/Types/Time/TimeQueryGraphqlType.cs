using GraphQL.MicrosoftDI;
using GraphQL.Types;
using System;
using System.Security.Claims;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.Repositories;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.TimeQuery
{
    public class TimeQueryGraphqlType : ObjectGraphType
    {
        private readonly ITimeRepository _timeRepository;
        public TimeQueryGraphqlType(ITimeRepository timeRepository)
        {
            _timeRepository = timeRepository;

            Field<TimeOutPutGraphql>("getTime")
                .Resolve(context =>
                {
                    var userId = GetUserIdFromClaims(context.User!);
                    var time = _timeRepository.GetTime(userId);
                    return new TimeView(CheckExpires(time, userId, _timeRepository));
                });
        }

        public static int GetUserIdFromClaims(ClaimsPrincipal user)
        {
            var id = int.Parse(user.Claims.FirstOrDefault(c => c.Type == "UserId")!.Value);
            return id;
        }

        public static TimeTracker.Models.Time CheckExpires(TimeTracker.Models.Time time, int userId, ITimeRepository repo)
        {
            if (time.toDayDate == null)
                time.toDayDate = DateTime.Now;
            else if (DateOnly.FromDateTime(time.toDayDate ?? new()).AddDays(1) <= DateOnly.FromDateTime(DateTime.Now))
            {
                time.toDayDate = DateTime.Now;
                time.DaySeconds = 0;
            }

            if (time.startWeekDate == null)
                time.startWeekDate = DateTime.Now;
            else if (DateOnly.FromDateTime(time.startWeekDate ?? new()).AddDays(7) <= DateOnly.FromDateTime(DateTime.Now))
            {
                time.toDayDate = DateTime.Now;
                time.DaySeconds = 0;
            }

            if (time.startMonthDate == null)
                time.startMonthDate = DateTime.Now;
            else if (DateOnly.FromDateTime(time.startMonthDate ?? new()).AddDays(DateTime.DaysInMonth(DateTime.Today.Year, DateTime.Today.Month)) <= DateOnly.FromDateTime(DateTime.Now))
            {
                time.toDayDate = DateTime.Now;
                time.MonthSeconds = 0;
            }

            repo.UpdateTime(time, userId);

            return time;
        }
    }
}
