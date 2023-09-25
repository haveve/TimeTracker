using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using TimeTracker.Repositories;
using TimeTracker.Services;

namespace TimeTracker.Models
{
    public class Transaction
    {
        private string executionstring = "BEGIN TRANSACTION\n";
        public Transaction()
        {
        }
        public string GetExecuteString()
        {
            return this.executionstring;
        }
        public void AddToExecuteString(string query)
        {
            this.executionstring += query + "\n";
        }
        public void Execute(ITransactionService transactionservice)
        {
            string query = this.executionstring + "COMMIT";
            this.executionstring = "BEGIN TRANSACTION\n";
            transactionservice.Execute(query);
        }
    }
}
