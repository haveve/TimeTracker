using TimeTracker.Models;

namespace TimeTracker.ViewModels
{
    public class UserPageViewModel
    {
        public List<User> UserList { get; set; }
        public int PageIndex { get; set; }
        public int TotalCount { get; set; }
    }
}
