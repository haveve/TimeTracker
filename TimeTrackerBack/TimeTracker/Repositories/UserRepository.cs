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
                    " VALUES((SELECT ISNULL(MAX(ID) + 1, 1) FROM Users), @Login, @Password, @FullName, @Id, @CRUDUsers, @EditPermiters, @ViewUsers, @EditWorkHours, @ImportExcel, @ControlPresence, @ControlDayOffs)";
                db.Execute(sqlQuery, user);
            }
        }
        public void UpdateUser(User user)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "UPDATE Tasks SET Login = @Login, Password = @Pasword, FullName = @FullName WHERE Id = @Id";
                db.Execute(sqlQuery, user);
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
