using GraphQL;
using GraphQL.MicrosoftDI;
using GraphQL.Types;
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
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
                    return GetTimeFromSession(time, new List<TimeMark>(), 1,startOfWeek.Monday);
                });
            Field<TimeWithFlagOutPutGraphql>("getTime")
                .Argument<NonNullGraphType<ListGraphType<NonNullGraphType<EnumerationGraphType<TimeMark>>>>>("timeMark")
                .Argument<NonNullGraphType<IntGraphType>>("pageNumber")
                .Argument<IntGraphType>("offSet")
                .Argument<NonNullGraphType<EnumerationGraphType<startOfWeek>>>("startOfWeek")
                .Argument<NonNullGraphType<IntGraphType>>("itemsInPage")
                .Resolve(context =>
                {
                    int pageNumber = context.GetArgument<int>("pageNumber");
                    int itemsInPage = context.GetArgument<int>("itemsInPage");
                    var timeMark = context.GetArgument<List<TimeMark>>("timeMark");
                    var startOfWeek = context.GetArgument<startOfWeek>("startOfWeek");
                    var offSet = context.GetArgument<int?>("offSet") ?? 0;
                    var userId = GetUserIdFromClaims(context.User!);
                    var time = _timeRepository.GetTime(userId);
                    return GetTimeFromSession(time, timeMark, offSet, startOfWeek, itemsInPage, pageNumber);
                });
            Field<IntGraphType>("getTotalWorkTime")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .Resolve(context =>
                {
                    int id = context.GetArgument<int>("id");
                    return GetMonthWorkTime(id, userRepository, _calendarRepository);
                });
        }

        public static TimeWithFlagViewModel GetTimeFromSession(List<Models.Time>? sessions, List<TimeMark> timeMarks, int offSet, startOfWeek startOfWeek, int itemsInPage = int.MaxValue, int pageNumber = 0)
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

                int seconds = getSecondsOfSession(timeSession, session, offSet, startOfWeek);

                switch (timeSession.TimeMark)
                {
                    case TimeMark.Day:
                        {
                            time.Time.DaySeconds += seconds;
                            time.Time.WeekSeconds += seconds;
                            time.Time.MonthSeconds += seconds;
                            break;
                        }
                    case TimeMark.Week:
                        {
                            time.Time.WeekSeconds += seconds;
                            time.Time.MonthSeconds += seconds;
                            break;
                        }
                    case TimeMark.Month:
                        {
                            time.Time.MonthSeconds += seconds;
                            break;
                        }

                    case TimeMark.Year:
                        {
                            break;
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
            time.Time.Sessions = time.Time.Sessions.OrderByDescending(t => t.StartTimeTrackDate).Skip(pageNumber * itemsInPage).Take(itemsInPage).ToList();
            return time;
        }

        public static int GetUserIdFromClaims(ClaimsPrincipal user)
        {
            var id = int.Parse(user.Claims.First(c => c.Type == "UserId").Value);
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
            for (int i = 0; i < days.Length - 1; i++)
            {
                MonthWorkTime += days[i];
                //Console.WriteLine(d.AddDays(i) + "-" + days[i]);
            }
            return MonthWorkTime * 36 * user.WorkHours;
        }
        public static DayOfWeek getNetStartOfWeek(startOfWeek startOfWeek)
        {
            switch (startOfWeek)
            {
                case startOfWeek.Sunday: return DayOfWeek.Sunday;
                case startOfWeek.Saturday: return DayOfWeek.Saturday;
                case startOfWeek.Monday: return DayOfWeek.Monday;
            }
            throw new InvalidCastException("Invalid start of week");
        }

        public static int getSecondsOfSession(TimeWithMark timeSession, Models.Time session, int offSet, startOfWeek startOfWeek)
        {
            var startNetOfWeek = getNetStartOfWeek(startOfWeek);

            if (session.EndTimeTrackDate is not null)
            {

                var seconds = (session.EndTimeTrackDate - session.StartTimeTrackDate).Value.TotalSeconds;
                var dateStartOfWeek = DateTime.UtcNow.AddHours(offSet).StartOfWeek(startNetOfWeek);
                var dateEndOfWeek = DateTime.UtcNow.AddHours(offSet).StartOfWeek(startNetOfWeek).AddDays(6);

                if (session.StartTimeTrackDate.AddHours(offSet).DayOfYear <= DateTime.UtcNow.AddHours(offSet).DayOfYear && DateTime.UtcNow.AddHours(offSet).DayOfYear <= ((DateTime)session.EndTimeTrackDate).AddHours(offSet).DayOfYear)
                {
                    var dateNowUtc = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(offSet));
                    int daySeconds = 24 * 60 * 60;

                    if (session.EndTimeTrackDate!.Value.AddHours(offSet).DayOfYear != session.StartTimeTrackDate.AddHours(offSet).DayOfYear && new DateTime(dateNowUtc.Year, dateNowUtc.Month, dateNowUtc.Day).AddHours(offSet).DayOfYear == session.EndTimeTrackDate!.Value.AddHours(offSet).DayOfYear)
                        seconds = (session.EndTimeTrackDate!.Value - DateTime.UtcNow.Date).Add(TimeSpan.FromHours(offSet)).TotalSeconds;
                    else if (session.EndTimeTrackDate!.Value.AddHours(offSet).DayOfYear != session.StartTimeTrackDate.AddHours(offSet).DayOfYear && new DateTime(dateNowUtc.Year, dateNowUtc.Month, dateNowUtc.Day).AddHours(offSet).DayOfYear == session.StartTimeTrackDate.AddHours(offSet).DayOfYear)
                        seconds = daySeconds - (session.StartTimeTrackDate.AddDays(DateTime.UtcNow.DayOfYear - session.StartTimeTrackDate.DayOfYear) - DateTime.UtcNow.Date).Add(TimeSpan.FromHours(offSet)).TotalSeconds;
                    else if (session.EndTimeTrackDate!.Value.AddHours(offSet).DayOfYear != session.StartTimeTrackDate.AddHours(offSet).DayOfYear)
                        seconds = daySeconds;

                    timeSession.TimeMark = TimeMark.Day;

                }
                else if ((dateStartOfWeek <= session.StartTimeTrackDate.AddHours(offSet) && session.StartTimeTrackDate.AddHours(offSet) <= dateEndOfWeek) || (dateStartOfWeek <= session.EndTimeTrackDate.Value.AddHours(offSet) && session.EndTimeTrackDate.Value.AddHours(offSet) <= dateEndOfWeek))
                {
                    if (!((dateStartOfWeek <= session.StartTimeTrackDate.AddHours(offSet) && session.StartTimeTrackDate.AddHours(offSet) <= dateEndOfWeek) && (dateStartOfWeek <= session.EndTimeTrackDate.Value.AddHours(offSet) && session.EndTimeTrackDate.Value.AddHours(offSet) <= dateEndOfWeek)))
                    {
                        if ((dateStartOfWeek <= session.EndTimeTrackDate.Value.AddHours(offSet) && session.EndTimeTrackDate.Value.AddHours(offSet) <= dateEndOfWeek))
                            seconds = (session.EndTimeTrackDate!.Value - DateTime.UtcNow.Date.StartOfWeek(DayOfWeek.Monday)).Add(TimeSpan.FromHours(offSet)).TotalSeconds;
                        if ((dateStartOfWeek <= session.StartTimeTrackDate.AddHours(offSet) && session.StartTimeTrackDate.AddHours(offSet) <= dateEndOfWeek))
                            seconds = (session.StartTimeTrackDate.AddDays(DateTime.UtcNow.StartOfWeek(DayOfWeek.Monday).AddDays(6).DayOfYear) - session.StartTimeTrackDate).Add(TimeSpan.FromHours(offSet)).TotalSeconds;
                    }
                    timeSession.TimeMark = TimeMark.Week;

                }
                else if (session.StartTimeTrackDate.Month == DateTime.UtcNow.AddHours(offSet).Month)
                {
                    var dateNowUtc = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(offSet));

                    var firstDayOfMonth = new DateTime(dateNowUtc.Year, dateNowUtc.Month, 1);
                    var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddSeconds(-1);

                    if (Math.Ceiling((decimal)session.EndTimeTrackDate!.Value.AddHours(offSet).Month) != Math.Ceiling((decimal)session.StartTimeTrackDate.AddHours(offSet).Month) && new DateTime(dateNowUtc.Year, dateNowUtc.Month, dateNowUtc.Day).AddHours(offSet).Month == session.EndTimeTrackDate!.Value.AddHours(offSet).Month)
                        seconds = (session.EndTimeTrackDate!.Value - firstDayOfMonth).Add(TimeSpan.FromHours(offSet)).TotalSeconds;
                    else if (session.EndTimeTrackDate!.Value.AddHours(offSet).Month != session.StartTimeTrackDate.AddHours(offSet).Month && new DateTime(dateNowUtc.Year, dateNowUtc.Month, dateNowUtc.Day).AddHours(offSet).Month == session.StartTimeTrackDate.AddHours(offSet).Month)
                        seconds = (lastDayOfMonth - session.StartTimeTrackDate).Add(TimeSpan.FromHours(offSet)).TotalSeconds;


                    timeSession.TimeMark = TimeMark.Month;
                }
                else
                {
                    timeSession.TimeMark = TimeMark.Year;
                }
                return (int)seconds;
            }
            return 0;
        }

    }
    public static class DateTimeExtensions
    {
        public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek)
        {
            int diff = (7 + (dt.DayOfWeek - startOfWeek)) % 7;
            return dt.AddDays(-1 * diff).Date;
        }
    }

    public enum startOfWeek
    {
        Sunday,
        Saturday,
        Monday
    }
}