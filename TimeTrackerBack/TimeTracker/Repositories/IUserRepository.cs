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
        public List<User> GetSearchedSortedfUsers(string search, string orderfield, string order);
        public User GetUser(int id);
        public User? GetUserByCredentials(string login, string password);
        public void CreateUser(User user);
        public void UpdateUser(User user);
        public void UpdateUserPassword(int id,string Password);
        public void UpdateUserPermissions(Permissions permissions);
        public void DeleteUser(int id);
        User? GetUserByEmailOrLogin(string LoginOrEmail);
        void UpdateUserResetCodeById(int id, string code);
    }
}
