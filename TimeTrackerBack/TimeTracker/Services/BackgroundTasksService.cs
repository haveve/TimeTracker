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
                updateFullTimersWorkTime(DateTime.Now);
                if (DateTime.Now.Day == 1)
                {
                    UserRepository.AddUsersVacationDays();
                }
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
            while (!stoppingToken.IsCancellationRequested);
        }
        private void updateFullTimersWorkTime(DateTime date)
        {
            Comparer comparer = new Comparer();
            bool bIsShortDay = false;
            bool bIsCelebrateOrHoliday = false;

            //var globalevent = CalendarQueryGraphQLType.ukraineGovernmentGlobalEvents.Where(e => comparer.DateEquals(e.Date, date)).FirstOrDefault();
            //if (globalevent == null)
            //{
            //    globalevent = CalendarRepository.GetDateGlobalEvent(date);
            //}
            //if (globalevent != null)
            //{
            //    if (globalevent.TypeOfGlobalEvent == TypeOfGlobalEvent.Celebrate || globalevent.TypeOfGlobalEvent == TypeOfGlobalEvent.Holiday)
            //    {
            //        Console.WriteLine("No work due to selebration/holiday");
            //        bIsCelebrateOrHoliday = true;
            //        return;
            //    }
            //    if (globalevent.TypeOfGlobalEvent == TypeOfGlobalEvent.ShortDay) { bIsShortDay = true; Console.WriteLine("Short day"); }
            //}
            
            if (bIsCelebrateOrHoliday) return;
            var users = UserRepository.GetFulltimers();

            DateTime start = new DateTime(date.Year, date.Month, date.Day, 9, 0, 0);
            DateTime end = new DateTime(date.Year, date.Month, date.Day, 17, 0, 0);
            if (bIsShortDay)
            {
                end = end.AddHours(-1);
            }
            

            foreach (var user in users)
            {
                if (CheckUserDay(user.Id, date) == "Work")
                {
                    TimeRepository.CreateTime(start, user.Id);
                    TimeRepository.SetEndTrackDate(end, user.Id);
                }
            }
        }
        public string CheckUserDay(int userId, DateTime date)
        {
            if (AbsenceRepository.GetUserDayAbsence(userId, date) != null) return "Absent";
            if (VacationRepository.GetCurrentVacationRequest(userId, date) != null) return "Vacation";
            return "Work";
        }
    }
}
