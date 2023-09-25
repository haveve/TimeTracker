using Dapper;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using TimeTracker.Models;

namespace TimeTracker.Repositories
{
    public interface IUpdateRepository
    {
        public DateTime GetLastUpdate();
        public void SetLastUpdate(DateTime date);
        public string GetQuerySetLastUpdate(DateTime date);

    }
}
