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
        public DateTime getLastUpdate();
        public void setLastUpdate(DateTime date);

    }
}
