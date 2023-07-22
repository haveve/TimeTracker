using GraphQL;
using GraphQL.Types;
using Newtonsoft.Json.Linq;
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
                    var date = TimeQueryGraphqlType.ToUkraineDateTime(context.GetArgument<DateTime>("date"));
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
                                return Math.Ceiling((decimal)date.DayOfYear/monthAmount) == Math.Ceiling((decimal)c.StartDate.DayOfYear / monthAmount)&&date.Month == c.StartDate.Month;

                            });
                        case MonthOrWeek.Week: return events.Where(c =>Math.Ceiling((decimal)c.StartDate.DayOfYear / 7) == Math.Ceiling((decimal)date.DayOfYear / 7));
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
