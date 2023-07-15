using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace TimeTracker.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string FullName{ get; set; }
        public bool CRUDUsers { get; set; } = false;
        public bool EditPermiters { get; set; } = false;
        public bool ViewUsers { get; set; } = false;
        public bool EditWorkHours { get; set; } = false;
        public bool ImportExcel { get; set; } = false;
        public bool ControlPresence { get; set; } = false;
        public bool ControlDayOffs { get; set; } = false;
        public int DaySeconds { get; set; }
        public int WeekSeconds { get; set; }
        public int MonthSeconds { get; set; }
    }
}
