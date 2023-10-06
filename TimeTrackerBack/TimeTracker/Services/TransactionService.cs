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

        private string executionstring = "BEGIN TRANSACTION\n";
        public TransactionService(DapperContext context, IConfiguration configuration)
        {
            connectionString = context.CreateConnection().ConnectionString;
            _configuration = configuration;
        }
        public string GetExecuteString()
        {
            return this.executionstring;
        }
        public void AddToExecuteString(string query)
        {
            this.executionstring += query + "\n";
        }
        public void Execute()
        {
            string query = this.executionstring + "COMMIT";
            this.executionstring = "BEGIN TRANSACTION\n";
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                db.Execute(query);
            }
        }
    }
}
