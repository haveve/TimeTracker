using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.Calendar.GlobalCalendar
{
    public class GlobalCalendarMutationGraphQLType : ObjectGraphType
    {
        private readonly ICalendarRepository _calendarRepository;

        public GlobalCalendarMutationGraphQLType(ICalendarRepository calendarRepository)
        {
            _calendarRepository = calendarRepository;

            Field<StringGraphType>("createEvent")
                .Argument<NonNullGraphType<CalendarGlobalInputGraphType>>("event")
                .Resolve((context) =>
                {
                    var calendarEvent = context.GetArgument<GlobalEventsViewModel>("event");
                    _calendarRepository.AddGlobalEvent(calendarEvent);
                    return "successfully";
                });

            Field<StringGraphType>("deleteEvent")
                .Argument<NonNullGraphType<DateTimeGraphType>>("eventStartDate")
                .Resolve((context) =>
                {
                    var eventStartDate = context.GetArgument<DateTime>("eventStartDate");
                    _calendarRepository.RemoveGlobalEvent(eventStartDate);
                    return "successfully";
                });

            Field<StringGraphType>("updateEvent")
                .Argument<NonNullGraphType<DateTimeGraphType>>("eventStartDate")
                .Argument<NonNullGraphType<CalendarGlobalInputGraphType>>("event")
                .Resolve((context) =>
                {
                    var eventStartDate = context.GetArgument<DateTime>("eventStartDate");
                    var calendarEvent = context.GetArgument<GlobalEventsViewModel>("event");
                    _calendarRepository.UpdateGlobalEvent(eventStartDate, calendarEvent);
                    return "successfully";
                });
            Field<StringGraphType>("createRangeEvent")
                .Argument<ListGraphType<NonNullGraphType<CalendarGlobalInputGraphType>>>("rangeEvent")
                .Resolve((context) =>
                {
                    var calendarEvent = context.GetArgument<List<GlobalEventsViewModel>>("rangeEvent");
                    _calendarRepository.AddEvenGlobaltRange(calendarEvent);
                    return "successfully";
                });
        }
    }
}