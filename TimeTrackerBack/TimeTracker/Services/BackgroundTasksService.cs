using TimeTracker.Repositories;

namespace TimeTracker.Services
{
    public class BackgroundTasksService : BackgroundService
    {
        public ITimeRepository TimeRepository { get; }
        public IUserRepository UserRepository { get; }

        public BackgroundTasksService(ITimeRepository timeRepository, IUserRepository userRepository) {
            TimeRepository = timeRepository;
            UserRepository = userRepository;
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
                    updateFullTimersWorkTime(DateTime.Now);
                    Console.WriteLine("Background daily task " + hourSpan);
                    numberOfHours = 24;
                }
                //var times = TimeRepository.GetDayTime(8, DateTime.Now.AddDays(-15));
                //await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
                await Task.Delay(TimeSpan.FromHours(numberOfHours), stoppingToken);
            }
            while (!stoppingToken.IsCancellationRequested);
        }
        private void updateFullTimersWorkTime(DateTime date)
        {
            var users = UserRepository.GetUsers().Where(u => u.WorkHours == 100 && u.Enabled == true).ToList();
            foreach (var user in users)
            {
                
                TimeRepository.CreateTime(date.AddDays(-1).AddHours(8), user.Id);
                TimeRepository.SetEndTrackDate(date.AddDays(-1).AddHours(16), user.Id);
            }
        }
        private string CheckDay(DateTime date) {
            return "Work";
        }
    }
}
