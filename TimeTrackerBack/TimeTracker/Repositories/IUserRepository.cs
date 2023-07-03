using Dapper;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using TimeTracker.Models;

namespace TimeTracker.Repositories
{
    public interface IUserRepository
    {
        public List<User> GetUsers();
        public User GetUser(int id);
        public User? GetUserByCredentials(string login, string password);
        public void CreateUser(User user);
        public void UpdateUser(User user);
        public void DeleteUser(int id);
    }
}
