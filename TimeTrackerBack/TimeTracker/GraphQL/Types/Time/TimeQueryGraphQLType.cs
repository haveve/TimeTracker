using GraphQL;
using GraphQL.MicrosoftDI;
using GraphQL.Types;
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
using System;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using TimeTracker.GraphQL.Types.Calendar;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.Services;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.TimeQuery
{
    public class TimeQueryGraphQLType : ObjectGraphType
    {
        private readonly ITimeRepository _timeRepository;
        private readonly ICalendarRepository _calendarRepository;
        public TimeQueryGraphQLType(ITimeRepository timeRepository, IUserRepository userRepository, ICalendarRepository calendarRepository)
        {
            _timeRepository = timeRepository;
            _calendarRepository = calendarRepository;

            Field<TimeWithFlagOutPutGraphType>("getUserTime")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .Argument<NonNullGraphType<ListGraphType<NonNullGraphType<EnumerationGraphType<TimeMark>>>>>("timeMark")
                .Argument<NonNullGraphType<IntGraphType>>("pageNumber")
                .Argument<IntGraphType>("offSet")
                .Argument<NonNullGraphType<EnumerationGraphType<startOfWeek>>>("startOfWeek")
                .Argument<NonNullGraphType<IntGraphType>>("itemsInPage")
                .Resolve(context =>
                {
                    var userId = context.GetArgument<int>("id");
                    int pageNumber = context.GetArgument<int>("pageNumber");
                    int itemsInPage = context.GetArgument<int>("itemsInPage");
                    var timeMark = context.GetArgument<List<TimeMark>>("timeMark");
                    var startOfWeek = context.GetArgument<startOfWeek>("startOfWeek");
                    var offSet = context.GetArgument<int?>("offSet") ?? 0;
                    var time = _timeRepository.GetTime(userId);
                    return GetTimeFromSession(time, timeMark, offSet, startOfWeek, itemsInPage, pageNumber);
                });
            Field<TimeWithFlagOutPutGraphType>("getTime")
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
                    return GetMonthWorkTime(id, DateTime.Now, userRepository, _calendarRepository);
                });
            Field<BooleanGraphType>("isStarted")
                .Resolve(context =>
                {
                    var userId = GetUserIdFromClaims(context.User!);
                    return _timeRepository.IsStarted(userId);
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

        public int GetMonthWorkTime(int id, DateTime d, IUserRepository userRepository, ICalendarRepository calendarRepository)
        {
            User user = userRepository.GetUser(id);
            d = d.AddDays(1 - d.Day);
            DateTime nd = new DateTime(d.AddMonths(1).Year, d.AddMonths(1).Month, 1);
            int[] days = new int[DateTime.DaysInMonth(d.Year, d.Month) + 1];
            var globalCalendar = _calendarRepository.GetAllGlobalEvents();
            globalCalendar = globalCalendar.FindAll(e => e.Date.Month == d.Month || (e.Date.Month == d.AddMonths(1).Month && e.Date.Day == 1));
            Array.Fill(days, 8);
            int MonthWorkTime = 0;
            for (int i = 0; i < days.Length; i++)
            {
                if (d.AddDays(i).DayOfWeek == DayOfWeek.Sunday || d.AddDays(i).DayOfWeek == DayOfWeek.Saturday)
                {
                    days[i] = 0;
                }
            }
            globalCalendar.ForEach(e =>
            {
                //Console.WriteLine(e.Date + " - " + e.TypeOfGlobalEvent);
                int day = e.Date.Month == d.Month ? e.Date.Day - 1 : days.Length - 1;
                if (e.TypeOfGlobalEvent == Calendar.TypeOfGlobalEvent.Holiday) days[day] = 0;
                if (e.TypeOfGlobalEvent == Calendar.TypeOfGlobalEvent.ShortDay) days[day] = 7;
                if (e.TypeOfGlobalEvent == Calendar.TypeOfGlobalEvent.Celebrate)
                {
                    days[day] = 0;
                    if (e.Date.Day != 1 || e.Date.Month == d.AddMonths(1).Month)
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
                var today = DateTime.UtcNow.AddHours(offSet);

                var seconds = (session.EndTimeTrackDate - session.StartTimeTrackDate).Value.TotalSeconds;
                var dateStartOfWeek = DateTime.UtcNow.AddHours(offSet).StartOfWeek(startNetOfWeek);
                var dateEndOfWeek = DateTime.UtcNow.AddHours(offSet).StartOfWeek(startNetOfWeek).AddDays(6);

                int dayInMonth = DateTime.DaysInMonth(today.Year, today.Month);

                var dateStartOfMonth = today.StartOfMonth();
                var dateEndOfMonth = dateStartOfMonth.AddDays(dayInMonth - 1);


                Comparer dayEqualsComparer = new Comparer();

                if (session.IsBelogedThisDay(dayEqualsComparer,today,offSet))
                {
                    int getSeconds;

                    if(session.TryGetSecondsIfOutOfDay(offSet, dayEqualsComparer,out getSeconds))
                    {
                        seconds = getSeconds;
                    }

                    timeSession.TimeMark = TimeMark.Day;

                }
                else if (session.IsBelogedThisWeek(dateStartOfWeek,dateEndOfWeek, offSet))
                {
                    int getSeconds;

                    if (session.TryGetSecondsIfOutOfWeek(offSet, startNetOfWeek, out getSeconds))
                    {
                        seconds = getSeconds;
                    }

                    timeSession.TimeMark = TimeMark.Week;

                }
                else if (session.IsBelogedThisMonth(dateStartOfMonth, dateEndOfMonth, offSet))
                {
                    int getSeconds;

                    if (session.TryGetSecondsIfOutOfMonth(offSet, out getSeconds))
                    {
                        seconds = getSeconds;
                    }

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

        public static DateTime StartOfMonth(this DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, 1);
        }

        public static DateTime EndOfDay(this DateTime date)
        {
            return new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, 999);
        }

        public static DateTime StartOfDay(this DateTime date)
        {
            return new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, 0);
        }

        public static bool IsBetwee(this DateTime date, DateTime startInterval, DateTime endInterval)
        {
            long startTicks = startInterval.Ticks;
            long endTicks = endInterval.Ticks;

            long operandTicks = date.Ticks;

            return startTicks <= operandTicks && operandTicks <= endTicks;
        }
        public static bool DatesAreInTheSameWeek(this DateTime date1, DateTime date2)
        {
            var cal = System.Globalization.DateTimeFormatInfo.CurrentInfo.Calendar;
            var d1 = date1.Date.AddDays(-1 * (int)cal.GetDayOfWeek(date1));
            var d2 = date2.Date.AddDays(-1 * (int)cal.GetDayOfWeek(date2));

            return d1 == d2;
        }
        public static int GetIso8601WeekOfYear(this DateTime time)
        {
            // Return the week of our adjusted day
            return CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(time, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        }

    }

    public static class TimeSessionExtension
    {

        public static bool IsBelogedThisDay(this Models.Time operand, Comparer dayEqualsComparer, DateTime today, int offSet = 0)
        {
            if (operand.EndTimeTrackDate is null)
                return false;

            return dayEqualsComparer.DateEquals(operand.StartTimeTrackDate.AddHours(offSet), today)
                || dayEqualsComparer.DateEquals(operand.EndTimeTrackDate.Value.AddHours(offSet), today);
        }

        public static bool IsBelogedThisWeek(this Models.Time operand, DateTime dateStartOfWeek, DateTime dateEndOfWeek, int offSet = 0)
        {
            if (operand.EndTimeTrackDate is null)
                return false;

            return (dateStartOfWeek.Ticks <= operand.StartTimeTrackDate.AddHours(offSet).Ticks && operand.StartTimeTrackDate.AddHours(offSet).Ticks <= dateEndOfWeek.Ticks)
                    || (dateStartOfWeek.Ticks <= operand.EndTimeTrackDate.Value.AddHours(offSet).Ticks && operand.EndTimeTrackDate.Value.AddHours(offSet).Ticks <= dateEndOfWeek.Ticks);
        }

        public static bool IsBelogedThisMonth(this Models.Time operand, DateTime dateStartOfMonth, DateTime dateEndOfMonth,int offSet = 0)
        {
            if (operand.EndTimeTrackDate is null)
                return false;

            return (dateStartOfMonth.Ticks <= operand.StartTimeTrackDate.AddHours(offSet).Ticks && operand.StartTimeTrackDate.AddHours(offSet).Ticks <= dateEndOfMonth.Ticks)
                    || (dateStartOfMonth.Ticks <= operand.EndTimeTrackDate.Value.AddHours(offSet).Ticks && operand.EndTimeTrackDate.Value.AddHours(offSet).Ticks <= dateEndOfMonth.Ticks);
        }

        public static bool TryGetSecondsIfOutOfDay(this Models.Time operand, int offSet, Comparer dayEqualsComparer, out int seconds)
        {
            seconds = 0;

            if (operand.EndTimeTrackDate is null)
                return false;

            DateTime startDateInRequesterTime = operand.StartTimeTrackDate.AddHours(offSet);
            DateTime endDateInRequesterTime = operand.EndTimeTrackDate!.Value.AddHours(offSet);

            DateTime now = DateTime.UtcNow.AddHours(offSet);

            if (!dayEqualsComparer.DateEquals(endDateInRequesterTime, endDateInRequesterTime) && dayEqualsComparer.DateEquals(endDateInRequesterTime, now))
            {
                seconds = (int)(endDateInRequesterTime - now.StartOfDay()).TotalSeconds;
                return true;
            }

            if (!dayEqualsComparer.DateEquals(endDateInRequesterTime, endDateInRequesterTime) && dayEqualsComparer.DateEquals(startDateInRequesterTime, now))
            {
                seconds = (int)(startDateInRequesterTime - now.StartOfDay()).TotalSeconds;
                return true;
            }

            return false;
        }

        public static bool TryGetSecondsIfOutOfWeek(this Models.Time operand, int offSet, DayOfWeek startNetOfWeek, out int seconds)
        {
            seconds = 0;

            if (operand.EndTimeTrackDate is null)
                return false;

            DateTime startDateInRequesterTime = operand.StartTimeTrackDate.AddHours(offSet);
            DateTime endDateInRequesterTime = operand.EndTimeTrackDate!.Value.AddHours(offSet);

            DateTime now = DateTime.UtcNow.AddHours(offSet);

            DateTime dateStartOfWeek = now.StartOfWeek(startNetOfWeek);
            DateTime dateEndOfWeek = dateStartOfWeek.AddDays(6);

            if (endDateInRequesterTime.IsBetwee(dateStartOfWeek, dateEndOfWeek) && !startDateInRequesterTime.IsBetwee(dateStartOfWeek, dateEndOfWeek))
            {
                seconds = (int)(endDateInRequesterTime - dateStartOfWeek).TotalSeconds;
                return true;
            }

            if (startDateInRequesterTime.IsBetwee(dateStartOfWeek, dateEndOfWeek) && !endDateInRequesterTime.IsBetwee(dateStartOfWeek, dateEndOfWeek))
            {
                seconds = (int)(startDateInRequesterTime - dateStartOfWeek).TotalSeconds;
                return true;
            }

            return false;
        }

        public static bool TryGetSecondsIfOutOfMonth(this Models.Time operand, int offSet, out int seconds)
        {
            seconds = 0;

            if (operand.EndTimeTrackDate is null)
                return false;

            DateTime startDateInRequesterTime = operand.StartTimeTrackDate.AddHours(offSet);
            DateTime endDateInRequesterTime = operand.EndTimeTrackDate!.Value.AddHours(offSet);

            DateTime now = DateTime.UtcNow.AddHours(offSet);

            int dayInMonth = DateTime.DaysInMonth(now.Year, now.Month);

            DateTime dateStartOfMonth = now.StartOfMonth();
            DateTime dateEndOfMonth = dateStartOfMonth.AddDays(dayInMonth-1);

            if (endDateInRequesterTime.IsBetwee(dateStartOfMonth, dateEndOfMonth) && !startDateInRequesterTime.IsBetwee(dateStartOfMonth, dateEndOfMonth))
            {
                seconds = (int)(endDateInRequesterTime - dateStartOfMonth).TotalSeconds;
                return true;
            }

            if (startDateInRequesterTime.IsBetwee(dateStartOfMonth, dateEndOfMonth) && !endDateInRequesterTime.IsBetwee(dateStartOfMonth, dateEndOfMonth))
            {
                seconds = (int)(startDateInRequesterTime - dateStartOfMonth).TotalSeconds;
                return true;
            }

            return false;
        }

    }


    public enum startOfWeek
    {
        Sunday,
        Saturday,
        Monday
    }
}