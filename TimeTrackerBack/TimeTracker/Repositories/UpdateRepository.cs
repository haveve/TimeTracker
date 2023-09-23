using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using TimeTracker.Models;
using TimeTracker.Services;

namespace TimeTracker.Repositories
{
    public class UpdateRepository : IUpdateRepository
    {
        private readonly IConfiguration _configuration;
        private readonly IAuthorizationRepository _authorizationRepository;

        string connectionString = null;
        public UpdateRepository(DapperContext context, IConfiguration configuration)
        {
            connectionString = context.CreateConnection().ConnectionString;
            _configuration = configuration;
        }


        public DateTime getLastUpdate()
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<DateTime>("SELECT TOP(1) Update_Date FROM Updates ORDER BY Update_Date DESC").First();
            }
        }
        public void setLastUpdate(DateTime date)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                db.Execute("INSERT INTO Updates (Update_Id, Update_Date) VALUES((SELECT ISNULL(MAX(Update_Id) + 1, 1) FROM UPDATES), @date)", new { date });
            }
        }

    }
}
