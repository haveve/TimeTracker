namespace TimeTracker.Models
{
    public class Permissions
    {
        public int userId { get; set; }
        public bool CRUDUsers { get; set; } = false;
        public bool EditApprovers { get; set; } = false;
        public bool ViewUsers { get; set; } = false;
        public bool EditWorkHours { get; set; } = false;
        public bool ExportExcel { get; set; } = false;
        public bool ControlPresence { get; set; } = false;
        public bool ControlDayOffs { get; set; } = false;
    }
}
