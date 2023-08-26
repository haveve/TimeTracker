using GraphQL;
using GraphQL.Types;
using System.Security.Claims;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.Services;

namespace TimeTracker.GraphQL.Types.AbsenceTypes
{
    public class AbsenceMutationGraphQLType : ObjectGraphType
    {
        public AbsenceMutationGraphQLType(
            ICalendarRepository CalendarRepository,
            IUserRepository UserRepository,
            ITimeRepository TimeRepository,
            IAbsenceRepository AbsenceRepository,
            IVacationRepository VacationRepository)
        {
            Field<StringGraphType>("addUserAbsence")
                .Argument<NonNullGraphType<AbsenceInputGraphType>>("Absence")
                .ResolveAsync(async context =>
                {
                    var absence = context.GetArgument<Absence>("Absence");
                    AbsenceRepository.AddAbsence(absence);
                    if (UserRepository.GetUser(absence.UserId).WorkHours == 100) TimeRepository.DeleteDayTime(absence.UserId, absence.Date);
                    return "Absence added successfully";
                });

            Field<StringGraphType>("addCurrentUserAbsence")
                .Argument<NonNullGraphType<AbsenceInputGraphType>>("Absence")
                .ResolveAsync(async context =>
                {
                    var absence = context.GetArgument<Absence>("Absence");
                    absence.UserId = GetUserIdFromClaims(context.User!);
                    AbsenceRepository.AddAbsence(absence);
                    if (UserRepository.GetUser(absence.UserId).WorkHours == 100) TimeRepository.DeleteDayTime(absence.UserId, absence.Date);
                    return "Absence added successfully";
                });

            Field<StringGraphType>("removeUserAbsence")
                .Argument<NonNullGraphType<AbsenceInputGraphType>>("Absence")
                .ResolveAsync(async context =>
                {
                    var absence = context.GetArgument<Absence>("Absence");
                    AbsenceRepository.RemoveAbsence(absence);
                    if (UserRepository.GetUser(absence.UserId).WorkHours == 100)
                    {
                        BackgroundTasksService.updateFullTimerWorkTime(absence.UserId, absence.Date,
                        CalendarRepository,
                        UserRepository,
                        TimeRepository,
                        AbsenceRepository,
                        VacationRepository);
                    }
                    return "Absence removed successfully";
                }).AuthorizeWithPolicy("ControlPresence");

            Field<StringGraphType>("removeCurrentUserAbsence")
                .Argument<NonNullGraphType<AbsenceInputGraphType>>("Absence")
                .ResolveAsync(async context =>
                {
                    var absence = context.GetArgument<Absence>("Absence");
                    absence.UserId = GetUserIdFromClaims(context.User!);
                    AbsenceRepository.RemoveAbsence(absence);
                    if (UserRepository.GetUser(absence.UserId).WorkHours == 100)
                    {
                        BackgroundTasksService.updateFullTimerWorkTime(absence.UserId, absence.Date,
                        CalendarRepository,
                        UserRepository,
                        TimeRepository,
                        AbsenceRepository,
                        VacationRepository);
                    }
                    return "Absence removed successfully";
                });
        }
        public static int GetUserIdFromClaims(ClaimsPrincipal user)
        {
            var id = int.Parse(user.Claims.FirstOrDefault(c => c.Type == "UserId")!.Value);
            return id;
        }
    }
}
