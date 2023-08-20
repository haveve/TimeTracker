using GraphQL.Types;
using GraphQL;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;
using TimeTracker.ViewModels;
using TimeTracker.GraphQL.Types.Calendar.GlobalCalendar;

namespace TimeTracker.GraphQL.Types.Calendar
{
    public class CalendarMutationGraphQLType : ObjectGraphType
    {
        private readonly ICalendarRepository _calendarRepository;

        public CalendarMutationGraphQLType(ICalendarRepository calendarRepository)
        {
            _calendarRepository = calendarRepository;

            Field<StringGraphType>("createEvent")
                 .Argument<NonNullGraphType<CalendarInputGraphType>>("event")
                 .Resolve((context) =>
                 {
                     var userId = TimeQueryGraphQLType.GetUserIdFromClaims(context.User!);
                     var calendarEvent = context.GetArgument<CalendarEventViewModel>("event");
                     _calendarRepository.AddEvent(userId, calendarEvent);
                     return "successfully";
                 });

            Field<StringGraphType>("deleteEvent")
                 .Argument<NonNullGraphType<DateTimeGraphType>>("eventStartDate")
                 .Resolve((context) =>
                 {
                     var userId = TimeQueryGraphQLType.GetUserIdFromClaims(context.User!);
                     var eventStartDate = context.GetArgument<DateTime>("eventStartDate");
                     _calendarRepository.RemoveEvent(userId, eventStartDate);
                     return "successfully";
                 });

            Field<StringGraphType>("updateEvent")
                 .Argument<NonNullGraphType<DateTimeGraphType>>("eventStartDate")
                 .Argument<NonNullGraphType<CalendarInputGraphType>>("event")
                 .Resolve((context) =>
                 {
                     var userId = TimeQueryGraphQLType.GetUserIdFromClaims(context.User!);
                     var eventStartDate = context.GetArgument<DateTime>("eventStartDate");
                     var calendarEvent = context.GetArgument<CalendarEventViewModel>("event");
                     _calendarRepository.UpdateEvent(userId, eventStartDate, calendarEvent);
                     return "successfully";
                 });

            Field<StringGraphType>("createRangeEvent")
                 .Argument<ListGraphType<NonNullGraphType<CalendarInputGraphType>>>("rangeEvent")
                 .Resolve((context) =>
                 {
                     var userId = TimeQueryGraphQLType.GetUserIdFromClaims(context.User!);
                     var calendarEvent = context.GetArgument<List<CalendarEventViewModel>>("rangeEvent");
                     _calendarRepository.AddEventRange(userId, calendarEvent);
                     return "successfully";
                 });
            Field<GlobalCalendarMutationGraphQLType>("globalCalendar")
    .Resolve((context) => new { });
        }
    }
}
