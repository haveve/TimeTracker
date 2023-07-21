using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarQueryGraphqlType : ObjectGraphType
    {
        private readonly ICalendarRepository _calendarRepository;

        public CalendarQueryGraphqlType(ICalendarRepository calendarRepository)
        {
            _calendarRepository = calendarRepository;

            Field<ListGraphType<NonNullGraphType<CalendarOutputGraphType>>>("getEvents")
                .Argument<NonNullGraphType<DateTimeGraphType>>("date")
                .Argument<NonNullGraphType<EnumerationGraphType<MonthOrWeek>>>("weekOrMonth")
                .Resolve(context =>
                {
                    var userId = TimeQueryGraphqlType.GetUserIdFromClaims(context.User!);
                    var date = context.GetArgument<DateTime>("date");
                    var weekOrMonth = context.GetArgument<MonthOrWeek>("weekOrMonth");

                    var events = _calendarRepository.GetAllEvents(userId);

                    switch (weekOrMonth)
                    {
                        case MonthOrWeek.Month: return events.Where(c => c.StartDate.Month == date.Month);
                        case MonthOrWeek.Week: return events.Where(c => c.StartDate.Month == date.Month&& c.StartDate.DayOfYear/7 == date.DayOfYear/7);
                    }

                    return events;
                });
        }
    }

    public enum MonthOrWeek
    {
        Month,
        Week
    }
}
