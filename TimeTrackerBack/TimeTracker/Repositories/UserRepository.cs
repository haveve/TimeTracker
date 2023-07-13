using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using TimeTracker.Models;

namespace TimeTracker.Repositories
{
    public class UserRepository : IUserRepository
    {
        string connectionString = null;
        public UserRepository(DapperContext context)
        {
            connectionString = context.CreateConnection().ConnectionString;
        }
        public List<User> GetUsers()
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>("SELECT * FROM Users").ToList();
            }
        }
        public List<User> GetSearchedSortedfUsers(string search, string orderfield, string order)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                if(orderfield != null)
                {
                    return db.Query<User>($"SELECT * FROM Users WHERE Login LIKE '%{search}%' OR FullName LIKE '%{search}%' ORDER BY {orderfield} {order}").ToList();
                }
                return db.Query<User>($"SELECT * FROM Users WHERE Login LIKE '%{search}%' OR FullName LIKE '%{search}%' ORDER BY Id {order}").ToList();
            }
        }
        public User GetUser(int id)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>("SELECT * FROM Users WHERE Id = @id", new { id }).First();
            }
        }
        public User? GetUserByCredentials(string login, string password)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>($"SELECT * FROM Users WHERE Login = '{login}' AND Password = '{password}'").FirstOrDefault();
            }
        }
        public void CreateUser(User user)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "INSERT INTO Users (Id, Login, Password, FullName, CRUDUsers, EditPermiters, ViewUsers, EditWorkHours, ImportExcel, ControlPresence, ControlDayOffs)" +
                    " VALUES((SELECT ISNULL(MAX(ID) + 1, 1) FROM Users), @Login, @Password, @FullName, @CRUDUsers, @EditPermiters, @ViewUsers, @EditWorkHours, @ImportExcel, @ControlPresence, @ControlDayOffs)";
                db.Execute(sqlQuery, user);
            }
        }
        public void UpdateUser(User user)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "UPDATE Users SET Login = @Login, FullName = @FullName WHERE Id = @Id";
                db.Execute(sqlQuery, user);
            }
        }
        public void UpdateUserPassword(int Id, string Password)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "UPDATE Users SET Password = @Password WHERE Id = @Id";
                db.Execute(sqlQuery, new { Id, Password});
            }
        }

        public void UpdateUserPermissions(Permissions permissions)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "UPDATE Users SET CRUDUsers = @CRUDUsers, EditPermiters = @EditPermiters, ViewUsers = @ViewUsers, EditWorkHours = @EditWorkHours, ImportExcel = @ImportExcel, ControlPresence = @ControlPresence, ControlDayOffs = @ControlDayOffs WHERE Id = @Id";
                db.Execute(sqlQuery, permissions);
            }
        }
        public void DeleteUser(int id)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "DELETE FROM Users WHERE Id = @id";
                db.Execute(sqlQuery, new { id });
            }
        }
    }
}
