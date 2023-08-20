using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using TimeTracker.Repositories;

namespace TimeTracker.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string FullName{ get; set; }
        public string Email { get; set; }
        public string ResetCode { get; set; } = null;
        public bool Enabled { get; set; } = false;
        public int WorkHours {  get; set; }
        public LasUpdatedBy TimeManagedBy { get; set; }
    }
}
