using TimeTracker.Models;

namespace TimeTracker.ViewModels
{
    public class UserViewModel
    {
        public User UserVM { get; set; }
        public Permissions PermissionsVM { get; set; }
        public List<User> UserList { get; set; }
        public List<Permissions> PermissonsList { get; set; }
    }
}
