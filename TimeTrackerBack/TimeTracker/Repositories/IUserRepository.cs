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
        public Task<List<User>> GetUsers();
        public Task<User> GetUser(int id);
        public Task<User?> GetUserByCredentials(string login, string password);
        public Task<Permissions> GetPermissions(int id);
        public Task CreateUser(User user, Permissions permissions);
        public Task UpdateUser(User user);
        public Task DeleteUser(int id);
    }
}
