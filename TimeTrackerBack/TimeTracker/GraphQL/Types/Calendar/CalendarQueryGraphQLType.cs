using GraphQL;
using GraphQL.Types;
using Newtonsoft.Json.Linq;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarQueryGraphQLType : ObjectGraphType
    {
        private readonly ICalendarRepository _calendarRepository;

        public CalendarQueryGraphQLType(ICalendarRepository calendarRepository)
        {
            _calendarRepository = calendarRepository;

            Field<ListGraphType<NonNullGraphType<CalendarOutputGraphType>>>("getEvents")
                .Argument<IntGraphType>("userId")
                .Argument<NonNullGraphType<DateTimeGraphType>>("date")
                .Argument<NonNullGraphType<EnumerationGraphType<MonthOrWeek>>>("weekOrMonth")
                .Resolve(context =>
                {
                    var userId = context.GetArgument<int?>("userId") ?? TimeQueryGraphQLType.GetUserIdFromClaims(context.User!);
                    var date = TimeQueryGraphQLType.ToUtcDateTime(context.GetArgument<DateTime>("date"));
                    var weekOrMonth = context.GetArgument<MonthOrWeek>("weekOrMonth");


                    var events = _calendarRepository.GetAllEvents(userId);
                    events.AddRange(_calendarRepository.GetAllUsersAbsences(userId));
                    events.AddRange(_calendarRepository.GetAllUsersVacations(userId));
                    switch (weekOrMonth)
                    {
                        case MonthOrWeek.Month:
                            int month = date.Month;
                            int monthAmount = 0;
                            for (int i = 1; i <= month; i++)
                            {
                                monthAmount += DateTime.DaysInMonth(2023, i);
                            }
                            return events.Where(c =>
                            {
                                return Math.Ceiling((decimal)date.DayOfYear / monthAmount) == Math.Ceiling((decimal)c.StartDate.DayOfYear / monthAmount) && date.Month == c.StartDate.Month;

                            });
                        case MonthOrWeek.Week: return events.Where(c => Math.Ceiling((decimal)c.StartDate.DayOfYear / 7) == Math.Ceiling((decimal)date.DayOfYear / 7));
                    }

                    return events;
                });

            Field<NonNullGraphType<CalendarPageOutputGraphType>>("getCalendarUser")
                .Argument<NonNullGraphType<IntGraphType>>("pageNumber")
                .Argument<NonNullGraphType<IntGraphType>>("itemsInPage")
                .Argument<NonNullGraphType<StringGraphType>>("search")
                .Resolve(context =>
                {
                    string search = context.GetArgument<string>("search");
                    int pageNumber = context.GetArgument<int>("pageNumber");
                    int itemsInPage = context.GetArgument<int>("itemsInPage");
                    var userContext = context.RequestServices!.GetService<IUserRepository>();

                    List<User> list = userContext.GetSearchedSortedfUsers(search, "FullName", "ASC", "1").ToList();
                    return new CalendarPage()
                    {
                        CalendarUsers = list.Skip(pageNumber * itemsInPage).Take(itemsInPage)
                                               .Select(u => new CalendarUserViewModel() { Email = u.Email, Id = u.Id, FullName = u.FullName })
                                               .ToList(),
                        Count = list.Count()
                    };
                });

            Field<ListGraphType<NonNullGraphType<CalendarGlobalOutputGraphType>>>("getGlobalEvents")
            .Argument<NonNullGraphType<DateTimeGraphType>>("date")
            .Argument<NonNullGraphType<EnumerationGraphType<MonthOrWeek>>>("weekOrMonth")
            .Resolve(context =>
    {
        var date = TimeQueryGraphQLType.ToUtcDateTime(context.GetArgument<DateTime>("date"));
        var weekOrMonth = context.GetArgument<MonthOrWeek>("weekOrMonth");

        var globalCalendar = _calendarRepository.GetAllGlobalEvents();

        switch (weekOrMonth)
        {
            case MonthOrWeek.Month:
                int month = date.Month;
                int monthAmount = 0;
                for (int i = 1; i <= month; i++)
                {
                    monthAmount += DateTime.DaysInMonth(2023, i);
                }
                return globalCalendar.Where(c =>
                {
                    return Math.Ceiling((decimal)date.DayOfYear / monthAmount) == Math.Ceiling((decimal)c.Date.DayOfYear / monthAmount) && date.Month == c.Date.Month;

                });
            case MonthOrWeek.Week: return globalCalendar.Where(c => Math.Ceiling((decimal)c.Date.DayOfYear / 7) == Math.Ceiling((decimal)date.DayOfYear / 7));
        }

        return globalCalendar;
    });

        }
    }

    public enum TypeOfGlobalEvent
    {
        Celebrate,
        ShortDay,
        Holiday
    }

    public enum MonthOrWeek
    {
        Month,
        Week
    }
}
