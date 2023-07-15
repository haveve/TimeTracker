using GraphQL.MicrosoftDI;
using GraphQL.Types;
using System;
using System.Security.Claims;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.Models;
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
            if (time.ToDayDate == null)
            {
                time.ToDayDate = DateTime.Now;
            }
            else if (DateOnly.FromDateTime(ToUkraineDateTime(time.ToDayDate.Value)).AddDays(1) <= DateOnly.FromDateTime(ToUkraineDateTime(DateTime.Now)))
            {
                var date = DateOnly.FromDateTime(ToUkraineDateTime(time.ToDayDate.Value));

                if (date.DayNumber / 7 < DateOnly.FromDateTime(ToUkraineDateTime(DateTime.Now)).DayNumber / 7)
                {
                    time.WeekSeconds = 0;
                }

                time.ToDayDate = DateTime.Now;
                time.DaySeconds = 0;

                time.StartTimeTrackDate = null;
                time.EndTimeTrackDate = null;
            }
            else
            {
                TimeTrackManage(time, repo,userId);
            }

            repo.UpdateTime(time, userId);
            return time;
        }

        public static DateTime ToUkraineDateTime(DateTime date)
        {
            var dateTime = TimeZoneInfo.ConvertTime(date,TimeZoneInfo.FindSystemTimeZoneById("FLE Standard Time"));
            return dateTime;
        }

        public static void TimeTrackManage(TimeTracker.Models.Time time,ITimeRepository repo,int userId)
        {
            if (time.StartTimeTrackDate == null)
                return;
            
            if (time.EndTimeTrackDate == null)
                return;

            var addSecond = Convert.ToInt32((time.EndTimeTrackDate - time.StartTimeTrackDate).Value.TotalSeconds);

            time.DaySeconds+= addSecond;
            time.MonthSeconds += addSecond;
            time.WeekSeconds += addSecond;

            time.StartTimeTrackDate = null;
            time.EndTimeTrackDate = null;

        }

    }
}
