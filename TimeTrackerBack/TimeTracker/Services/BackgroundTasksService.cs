using TimeTracker.GraphQL.Types.Calendar;
using TimeTracker.GraphQL.Types.TimeQuery;
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
        public IEmailSender EmailSender { get; }

        public BackgroundTasksService(ITimeRepository timeRepository,
            IUserRepository userRepository,
            ICalendarRepository calendarRepository,
            IAbsenceRepository absenceRepository,
            IVacationRepository vacationRepository,
            IEmailSender emailSender
            )
        {
            TimeRepository = timeRepository;
            UserRepository = userRepository;
            CalendarRepository = calendarRepository;
            AbsenceRepository = absenceRepository;
            VacationRepository = vacationRepository;
            EmailSender = emailSender;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            do
            {
                DateTime date = DateTime.Now;
                updateFullTimersWorkTime(date);
                if (date.Day == 1)
                {
                    UserRepository.AddUsersVacationDays();
                    CheckUsersWorkTime(date);
                }
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
            while (!stoppingToken.IsCancellationRequested);
        }

        private void updateFullTimersWorkTime(DateTime date)
        {
            bool bIsShortDay = false;

            var globalevent = CalendarRepository.GetDateGlobalEvent(date);

            if (globalevent != null)
            {
                if (globalevent.TypeOfGlobalEvent == TypeOfGlobalEvent.ShortDay)
                {
                    bIsShortDay = true;
                }
                else return;
            }

            var users = UserRepository.GetFulltimers();

            var time = new Models.Time();

            time.StartTimeTrackDate = new DateTime(date.Year, date.Month, date.Day, 9, 0, 0);

            time.EndTimeTrackDate = bIsShortDay ? new DateTime(date.Year, date.Month, date.Day, 17, 0, 0) :
                new DateTime(date.Year, date.Month, date.Day, 16, 0, 0);

            foreach (var user in users)
            {
                if (CheckUserDay(user.Id, date) == "Work")
                {
                    TimeRepository.CreateTimeWithEnd(time, user.Id);
                }
            }
        }
        public string CheckUserDay(int userId, DateTime date)
        {
            if (AbsenceRepository.GetUserDayAbsence(userId, date) != null) return "Absent";
            if (VacationRepository.GetCurrentVacationRequest(userId, date) != null) return "Vacation";
            return "Work";
        }

        public void CheckUsersWorkTime(DateTime d)
        {
            d = d.AddDays(-1);
            var list = UserRepository.GetEnabledUsers();

            foreach (var user in list)
            {
                var userTime = TimeQueryGraphQLType.GetTimeFromSession(TimeRepository.GetUserMonthTime(user.Id, d.Month), new List<ViewModels.TimeMark>(), 0, startOfWeek.Monday);

                var time = TimeQueryGraphQLType.GetMonthWorkTime(user.Id, d, UserRepository, CalendarRepository);

                if (time > userTime.Time.MonthSeconds)
                {
                    EmailSender.SendBadMonthlyWorkResults(user, time, userTime.Time.MonthSeconds);
                }
            }
        }
    }
}
