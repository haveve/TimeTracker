namespace TimeTracker.Models
{
    public class Permissions
    {
        public int Id { get; set; }
        public bool CRUDUsers { get; set; } = false;
        public bool EditPermiters { get; set; } = false;
        public bool ViewUsers { get; set; } = false;
        public bool EditWorkHours { get; set; } = false;
        public bool ImportExcel { get; set; } = false;
        public bool ControlPresence { get; set; } = false;
        public bool ControlDayOffs { get; set; } = false;
    }
}
