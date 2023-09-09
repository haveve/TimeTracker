using Microsoft.Data.SqlClient;
using System.Data;
using TimeTracker.ViewModels;
using Z.Dapper.Plus;

namespace TimeTracker.Repositories
{
    public class DapperContext
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        public DapperContext(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("SQLConnection");

            DapperPlusManager.Entity<CalendarEventViewModel>()
                .Table("CalendarEvents");
        }
        public IDbConnection CreateConnection()
            => new SqlConnection(_connectionString);
    }
}
    