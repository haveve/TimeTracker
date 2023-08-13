using GraphQL;
using GraphQL.MicrosoftDI;
using GraphQL.Types;
using System;
using System.Linq;
using System.Security.Claims;
using TimeTracker.GraphQL.Types.Calendar;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.TimeQuery
{
    public class TimeQueryGraphqlType : ObjectGraphType
    {
        private readonly ITimeRepository _timeRepository;
        private readonly ICalendarRepository _calendarRepository;
        public TimeQueryGraphqlType(ITimeRepository timeRepository, IUserRepository userRepository, ICalendarRepository calendarRepository)
        {
            _timeRepository = timeRepository;
            _calendarRepository = calendarRepository;

            Field<TimeWithFlagOutPutGraphql>("getUserTime")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .Resolve(context =>
                {
                    var id = context.GetArgument<int>("id");
                    var time = _timeRepository.GetTime(id);
                    return GetTimeFromSession(time, new List<TimeMark>(), 1);
                });
            Field<TimeWithFlagOutPutGraphql>("getTime")
                .Argument<NonNullGraphType<ListGraphType<NonNullGraphType<EnumerationGraphType<TimeMark>>>>>("timeMark")
                .Argument<NonNullGraphType<IntGraphType>>("pageNumber")
                .Argument<IntGraphType>("offSet")
                .Argument<NonNullGraphType<IntGraphType>>("itemsInPage")
                .Resolve(context =>
                {
                    int pageNumber = context.GetArgument<int>("pageNumber");
                    int itemsInPage = context.GetArgument<int>("itemsInPage");
                    var timeMark = context.GetArgument<List<TimeMark>>("timeMark");
                    var offSet = context.GetArgument<int?>("offSet")??0;
                    var userId = GetUserIdFromClaims(context.User!);
                    var time = _timeRepository.GetTime(userId);
                    return GetTimeFromSession(time, timeMark, offSet, itemsInPage, pageNumber);
                });
            Field<IntGraphType>("getTotalWorkTime")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .Resolve(context =>
                {
                    int id = context.GetArgument<int>("id");
                    return GetMonthWorkTime(id, userRepository, _calendarRepository);
                });
        }

        public static TimeWithFlagViewModel GetTimeFromSession(List<Models.Time>? sessions, List<TimeMark> timeMarks,int offSet ,int itemsInPage = int.MaxValue, int pageNumber = 0)
        {
            var time = new TimeWithFlagViewModel();
            time.Time = new();
            time.Time.Sessions = new();

            if (sessions == null)
                return time;

            foreach (var session in sessions)
            {

                var timeSession = new TimeWithMark();
                timeSession.StartTimeTrackDate = session.StartTimeTrackDate;
                timeSession.EndTimeTrackDate = session.EndTimeTrackDate;

                if (session.EndTimeTrackDate is not null)
                {

                    var seconds = (session.EndTimeTrackDate - session.StartTimeTrackDate).Value.TotalSeconds;
                    if (session.StartTimeTrackDate.AddHours(offSet).DayOfYear <= DateTime.Now.AddHours(offSet).DayOfYear && DateTime.Now.AddHours(offSet).DayOfYear <= ((DateTime)session.EndTimeTrackDate).AddHours(offSet).DayOfYear)
                    {
                        timeSession.TimeMark = TimeMark.Day;
                        time.Time.DaySeconds += (int)seconds;
                        time.Time.WeekSeconds += (int)seconds;
                        time.Time.MonthSeconds += (int)seconds;

                    }
                    else if (Math.Ceiling((decimal)session.StartTimeTrackDate.AddHours(offSet).DayOfYear/ 7) <= Math.Ceiling((decimal)DateTime.Now.AddHours(offSet).DayOfYear / 7) && Math.Ceiling((decimal)DateTime.Now.AddHours(offSet).DayOfYear / 7) <= Math.Ceiling((decimal)((DateTime)session.EndTimeTrackDate).AddHours(offSet).DayOfYear / 7))
                    {
                        timeSession.TimeMark = TimeMark.Week;
                        time.Time.WeekSeconds += (int)seconds;
                        time.Time.MonthSeconds += (int)seconds;

                    }
                    else
                    {
                        timeSession.TimeMark = TimeMark.Month;
                        time.Time.MonthSeconds += (int)seconds;
                    }
                }
                if (timeMarks.Count == 0)
                {
                    time.Time.Sessions.Add(timeSession);
                }
                else
                {
                    foreach (var timeMark in timeMarks)
                    {
                        if (timeMark == timeSession.TimeMark)
                        {
                            time.Time.Sessions.Add(timeSession);
                            break;
                        }
                    }
                }
            }

            time.IsStarted = time.Time.Sessions.Any(t => t.EndTimeTrackDate == null);
            time.ItemsCount = time.Time.Sessions.Count;
            time.Time.Sessions = time.Time.Sessions.OrderByDescending(t => t.StartTimeTrackDate).Skip(pageNumber* itemsInPage).Take(itemsInPage).ToList();
            return time;
        }

        public static int GetUserIdFromClaims(ClaimsPrincipal user)
        {
            var id = int.Parse(user.Claims.FirstOrDefault(c => c.Type == "UserId")!.Value);
            return id;
        }
        public static DateTime ToUtcDateTime(DateTime date)
        {
            var dateTime = TimeZoneInfo.ConvertTimeToUtc(date);
            return dateTime;
        }

        public int GetMonthWorkTime(int id, IUserRepository userRepository, ICalendarRepository calendarRepository)
        {
            User user = userRepository.GetUser(id);
            DateTime d = DateTime.Now.AddDays(1 - DateTime.Now.Day);
            DateTime nd = new DateTime(d.AddMonths(1).Year, d.AddMonths(1).Month, 1);
            int[] days = new int[DateTime.DaysInMonth(d.Year, d.Month) + 1];
            var globalCalendar = _calendarRepository.GetAllGlobalEvents();
            globalCalendar.AddRange(CalendarQueryGraphqlType.ukraineGovernmentCelebrations);
            globalCalendar = globalCalendar.FindAll(e => e.Date.Month == DateTime.Now.Month || (e.Date.Month == DateTime.Now.AddMonths(1).Month && e.Date.Day == 1));
            Array.Fill(days, 8);
            int MonthWorkTime = 0;
            for (int i = 0; i < days.Length; i++)
            {
                if (d.AddDays(i).DayOfWeek == DayOfWeek.Sunday || d.AddDays(i).DayOfWeek == DayOfWeek.Saturday)
                {
                    days[i] = 0;
                }
            }
            globalCalendar.ForEach(e => {
                //Console.WriteLine(e.Date + " - " + e.TypeOfGlobalEvent);
                int day = e.Date.Month == DateTime.Now.Month ? e.Date.Day - 1 : days.Length - 1;
                if (e.TypeOfGlobalEvent == Calendar.TypeOfGlobalEvent.Holiday) days[day] = 0;
                if (e.TypeOfGlobalEvent == Calendar.TypeOfGlobalEvent.ShortDay) days[day] = 7;
                if (e.TypeOfGlobalEvent == Calendar.TypeOfGlobalEvent.Celebrate)
                {
                    days[day] = 0;
                    if (e.Date.Day != 1 || e.Date.Month == DateTime.Now.AddMonths(1).Month)
                    {
                        if (days[day - 1] != 0)
                        {
                            days[day - 1] = 7;
                        }
                    }
                }
            });
            for (int i = 0; i < days.Length; i++)
            {
                MonthWorkTime += days[i];
                //Console.WriteLine(d.AddDays(i) + "-" + days[i]);
            }
            return MonthWorkTime * 36 * user.WorkHours;
        }
    }
}
