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
        public List<User> GetSearchedSortedfUsers(string search, string orderfield, string order, string enabled);
        public User GetUser(int id);
        public User? GetUserByCredentials(string login, string password,bool hashed = false);
        public Permissions GetUserPermissions(int id);
        public void CreateUser(User user, Permissions permissions);
        public void UpdateUser(User user);
        public void UpdateRegisteredUserAndCode(User user);
        public void UpdateUserPassword(int id,string Password);
        public void UpdateUserPermissions(Permissions permissions);
        public void DisableUser(int id);
        public void DeleteUser(int id);
        User? GetUserByEmailOrLogin(string LoginOrEmail);
        void UpdateUserResetCodeById(int id, string code);
        void UpdateUserPasswordAndCode(int id, string code, string password);
        public bool ComparePasswords(int id, string password);
        List<User> GetUsersByFullName(string loginOrFullName);
    }
}
