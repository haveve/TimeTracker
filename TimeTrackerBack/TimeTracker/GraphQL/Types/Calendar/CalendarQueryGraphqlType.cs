using GraphQL;
using GraphQL.Types;
using Newtonsoft.Json.Linq;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarQueryGraphqlType : ObjectGraphType
    {
        private readonly ICalendarRepository _calendarRepository;

        public static readonly List<GlobalEventsViewModel> ukraineGovernmentCelebrations = new List<GlobalEventsViewModel>
        {
            new GlobalEventsViewModel("Новий рік", new DateTime(DateTime.Now.Year, 1, 1),TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("Різдво Христове за юліанським календарем", new DateTime(DateTime.Now.Year, 1, 7), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("День Соборності України", new DateTime(DateTime.Now.Year, 1, 22), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("Міжнародний жіночий день", new DateTime(DateTime.Now.Year, 3, 8), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("Міжнародний день праці", new DateTime(DateTime.Now.Year, 5, 1), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("День Конституції України", new DateTime(DateTime.Now.Year, 6, 28), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("День Української Державності", new DateTime(DateTime.Now.Year, 7, 28), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("День Державного Прапора України", new DateTime(DateTime.Now.Year, 8, 23), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("День незалежності України", new DateTime(DateTime.Now.Year, 8, 24), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("День захисників і захисниць України", new DateTime(DateTime.Now.Year, 10, 14), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("День Збройних Сил України", new DateTime(DateTime.Now.Year, 12, 6), TypeOfGlobalEvent.Celebrate),
            new GlobalEventsViewModel("Різдво Христове", new DateTime(DateTime.Now.Year, 12, 25), TypeOfGlobalEvent.Celebrate),
        };

        public CalendarQueryGraphqlType(ICalendarRepository calendarRepository)
        {
            _calendarRepository = calendarRepository;

            Field<ListGraphType<NonNullGraphType<CalendarOutputGraphType>>>("getEvents")
                .Argument<IntGraphType>("userId")
                .Argument<NonNullGraphType<DateTimeGraphType>>("date")
                .Argument<NonNullGraphType<EnumerationGraphType<MonthOrWeek>>>("weekOrMonth")
                .Resolve(context =>
                {
                    var userId = context.GetArgument<int?>("userId") ?? TimeQueryGraphqlType.GetUserIdFromClaims(context.User!);
                    var date = TimeQueryGraphqlType.ToUtcDateTime(context.GetArgument<DateTime>("date"));
                    var weekOrMonth = context.GetArgument<MonthOrWeek>("weekOrMonth");


                    var events = _calendarRepository.GetAllEvents(userId);
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
                    List<User> list = userContext.GetSearchedSortedfUsers(search, "FullName", "ASC", "DaySeconds", 0, int.MaxValue).ToList();
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
        var date = TimeQueryGraphqlType.ToUtcDateTime(context.GetArgument<DateTime>("date"));
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
