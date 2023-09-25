using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using TimeTracker.Models;
using TimeTracker.Repositories;

namespace TimeTracker.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly IConfiguration _configuration;

        string connectionString = null;
        public TransactionService(DapperContext context, IConfiguration configuration)
        {
            connectionString = context.CreateConnection().ConnectionString;
            _configuration = configuration;
        }
        public void Execute(string query)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                db.Execute(query);
            }
        }
    }
}
