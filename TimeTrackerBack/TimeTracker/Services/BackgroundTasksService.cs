using TimeTracker.GraphQL.Types.Calendar;
using TimeTracker.Repositories;

namespace TimeTracker.Services
{
    public class BackgroundTasksService : BackgroundService
    {
        public ITimeRepository TimeRepository { get; }
        public IUserRepository UserRepository { get; }
        public ICalendarRepository CalendarRepository { get; }
        public IAbsenceRepository AbsenceRepository { get; }
        public IVacationRepository VacationRepository { get; }

        public BackgroundTasksService(ITimeRepository timeRepository, IUserRepository userRepository, ICalendarRepository calendarRepository, IAbsenceRepository absenceRepository, IVacationRepository vacationRepository)
        {
            TimeRepository = timeRepository;
            UserRepository = userRepository;
            CalendarRepository = calendarRepository;
            AbsenceRepository = absenceRepository;
            VacationRepository = vacationRepository;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            do
            {
                int hourSpan = 24 - DateTime.Now.Hour;
                int numberOfHours = hourSpan;

                if (hourSpan == 24)
                {
                    //do something
                    updateFullTimersWorkTime(DateTime.Now.AddHours(-1), AbsenceRepository, VacationRepository);
                    if (DateTime.Now.Day == 1)
                    {
                        UserRepository.AddUsersVacationDays();
                    }
                    Console.WriteLine("Background daily task " + hourSpan);
                    numberOfHours = 24;
                }
                await Task.Delay(TimeSpan.FromHours(numberOfHours), stoppingToken);
            }
            while (!stoppingToken.IsCancellationRequested);
        }
        private void updateFullTimersWorkTime(DateTime date,
            IAbsenceRepository AbsenceRepository,
            IVacationRepository VacationRepository)
        {
            bool bIsShortDay = false;
            bool bIsCelebrateOrHoliday = false;
            var globalCalendar = CalendarRepository.GetAllGlobalEvents();
            globalCalendar.AddRange(CalendarQueryGraphQLType.ukraineGovernmentCelebrations);
            globalCalendar = globalCalendar.FindAll(e => e.Date.ToString("yyyy-MM-dd") == date.ToString("yyyy-MM-dd") || e.Date.ToString("yyyy-MM-dd") == date.AddDays(1).ToString("yyyy-MM-dd"));
            globalCalendar.ForEach(e =>
            {
                if (e.Date.ToString("yyyy-MM-dd") == date.ToString("yyyy-MM-dd"))
                {
                    if (e.TypeOfGlobalEvent == TypeOfGlobalEvent.Celebrate || e.TypeOfGlobalEvent == TypeOfGlobalEvent.Holiday)
                    {
                        Console.WriteLine("No work due to selebration/holiday");
                        bIsCelebrateOrHoliday = true;
                        return;
                    }
                    if (e.TypeOfGlobalEvent == TypeOfGlobalEvent.ShortDay) { bIsShortDay = true; Console.WriteLine("Short day"); }
                }
                if (e.Date.ToString("yyyy-MM-dd") == date.AddDays(1).ToString("yyyy-MM-dd"))
                {
                    if (e.TypeOfGlobalEvent == TypeOfGlobalEvent.Celebrate) { bIsShortDay = true; Console.WriteLine("Short day"); }
                }
            });
            if (bIsCelebrateOrHoliday) return;
            var users = UserRepository.GetUsers().Where(u => u.WorkHours == 100 && u.Enabled == true).ToList();
            foreach (var user in users)
            {
                if (CheckUserDay(user.Id, date, AbsenceRepository, VacationRepository) == "Work")
                {
                    if (bIsShortDay)
                    {
                        TimeRepository.CreateTime(date.AddDays(-1).AddHours(8), user.Id);
                        TimeRepository.SetEndTrackDate(date.AddDays(-1).AddHours(15), user.Id);
                    }
                    else
                    {
                        TimeRepository.CreateTime(date.AddDays(-1).AddHours(8), user.Id);
                        TimeRepository.SetEndTrackDate(date.AddDays(-1).AddHours(16), user.Id);
                    }
                }
            }
        }
        public static void updateFullTimerWorkTime(int userId, DateTime date,
            ICalendarRepository CalendarRepository,
            IUserRepository UserRepository,
            ITimeRepository TimeRepository,
            IAbsenceRepository AbsenceRepository,
            IVacationRepository VacationRepository)
        {
            bool bIsShortDay = false;
            bool bIsCelebrateOrHoliday = false;
            var globalCalendar = CalendarRepository.GetAllGlobalEvents();
            globalCalendar.AddRange(CalendarQueryGraphQLType.ukraineGovernmentCelebrations);
            globalCalendar = globalCalendar.FindAll(e => e.Date.ToString("yyyy-MM-dd") == date.ToString("yyyy-MM-dd") || e.Date.ToString("yyyy-MM-dd") == date.AddDays(1).ToString("yyyy-MM-dd"));
            globalCalendar.ForEach(e =>
            {
                if (e.Date.ToString("yyyy-MM-dd") == date.ToString("yyyy-MM-dd"))
                {
                    if (e.TypeOfGlobalEvent == TypeOfGlobalEvent.Celebrate || e.TypeOfGlobalEvent == TypeOfGlobalEvent.Holiday)
                    {
                        Console.WriteLine("No work due to selebration/holiday");
                        bIsCelebrateOrHoliday = true;
                        return;
                    }
                    if (e.TypeOfGlobalEvent == TypeOfGlobalEvent.ShortDay) { bIsShortDay = true; Console.WriteLine("Short day"); }
                }
                if (e.Date.ToString("yyyy-MM-dd") == date.AddDays(1).ToString("yyyy-MM-dd"))
                {
                    if (e.TypeOfGlobalEvent == TypeOfGlobalEvent.Celebrate) { bIsShortDay = true; Console.WriteLine("Short day"); }
                }
            });
            if (bIsCelebrateOrHoliday) return;
            var user = UserRepository.GetUser(userId);
            if (CheckUserDay(user.Id, date, AbsenceRepository, VacationRepository) == "Work")
            {
                if (bIsShortDay)
                {
                    TimeRepository.CreateTime(date.AddDays(-1).AddHours(8), user.Id);
                    TimeRepository.SetEndTrackDate(date.AddDays(-1).AddHours(15), user.Id);
                }
                else
                {
                    TimeRepository.CreateTime(date.AddDays(-1).AddHours(8), user.Id);
                    TimeRepository.SetEndTrackDate(date.AddDays(-1).AddHours(16), user.Id);
                }
            }
        }
        public static string CheckUserDay(int userId, DateTime date, IAbsenceRepository AbsenceRepository, IVacationRepository VacationRepository)
        {
            if (AbsenceRepository.GetUserDayAbsence(userId, date) != null) return "Absent";
            if (VacationRepository.GetCurrentVacationRequest(userId, date) != null) return "Vacation";
            return "Work";
        }
    }
}
