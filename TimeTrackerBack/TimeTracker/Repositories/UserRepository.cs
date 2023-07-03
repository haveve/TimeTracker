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
        public async Task<List<User>> GetUsers()
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>("SELECT * FROM Users").ToList();
            }
        }
        public async Task<User> GetUser(int id)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>("SELECT * FROM Users WHERE Id = @id", new { id }).First();
            }
        }

        public async Task<Permissions> GetPermissions(int id)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<Permissions>("SELECT * FROM Permissions WHERE Id = @id", new { id }).First();
            }
        }
        public async Task CreateUser(User user, Permissions permissions)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "INSERT INTO Users (Id, Login, Password, FullName) OUTPUT INSERTED.Id VALUES((SELECT ISNULL(MAX(ID) + 1, 1) FROM Users), @Login, @Password, @FullName)";
                permissions.Id = db.QuerySingle<int>(sqlQuery, user);
                sqlQuery = "INSERT INTO Permissions (Id, CRUDUsers, EditPermiters, ViewUsers, EditWorkHours, ImportExcel, ControlPresence, ControlDayOffs) VALUES(@Id, @CRUDUsers, @EditPermiters, @ViewUsers, @EditWorkHours, @ImportExcel, @ControlPresence, @ControlDayOffs)";
                db.Execute(sqlQuery, permissions);
            }
        }
        public async Task UpdateUser(User user)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "UPDATE Tasks SET Login = @Login, Password = @Pasword, FullName = @FullName WHERE Id = @Id";
                db.Execute(sqlQuery, user);
            }
        }
        public async Task DeleteUser(int id)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "DELETE FROM Users WHERE Id = @id";
                db.Execute(sqlQuery, new { id });
            }
        }

        public async Task<User?> GetUserByCredentials(string login, string password)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>($"SELECT * FROM Users WHERE Login = '{login}' AND Password = '{password}'").FirstOrDefault();
            }
        }
    }
}
