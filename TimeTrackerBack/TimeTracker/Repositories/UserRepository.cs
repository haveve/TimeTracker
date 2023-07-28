using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using TimeTracker.Models;
using TimeTracker.Services;

namespace TimeTracker.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IConfiguration _configuration;

        string connectionString = null;
        public UserRepository(DapperContext context, IConfiguration configuration)
        {
            connectionString = context.CreateConnection().ConnectionString;
            _configuration = configuration;
        }
        public List<User> GetUsers()
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>("SELECT * FROM Users").ToList();
            }
        }
        public List<User> GetSearchedSortedfUsers(string search, string orderfield, string order, string filterfield, int minhours, int maxhours)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                if (orderfield != null)
                {
                    return db.Query<User>($"SELECT * FROM Users WHERE Login LIKE '%{search}%' OR FullName LIKE '%{search}%' ORDER BY {orderfield} {order}").ToList();
                }
                return db.Query<User>($"SELECT * FROM Users WHERE (Login LIKE '%{search}%' OR FullName LIKE '%{search}%') " +
                    $"AND ({filterfield} >= {minhours} AND {filterfield} <= {maxhours}) ORDER BY Id {order}").ToList();
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
            string? salt = "";
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                salt = db.Query<string>($"SELECT Salt FROM Users WHERE Login = '{login}'").FirstOrDefault();
                if (salt == null)
                    return null;
                var papper = _configuration.GetSection("Hash:Papper").Value;
                var iteration = int.Parse(_configuration.GetSection("Hash:Iteration").Value);
                var hashedPassword = PasswordHasher.ComputeHash(password, salt, papper, iteration);
                return db.Query<User>($"SELECT * FROM Users WHERE Login = '{login}' AND Password = '{hashedPassword}'").FirstOrDefault();
            }
        }
        public User? GetUserByEmailOrLogin(string LoginOrEmail)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>($"SELECT * FROM Users WHERE Email = '{LoginOrEmail}' OR Login = '{LoginOrEmail}'").FirstOrDefault();
            }
        }
        public void CreateUser(User user)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "INSERT INTO Users (Id, Login, Password, Email, FullName, CRUDUsers, EditPermiters, ViewUsers, EditWorkHours, ImportExcel, ControlPresence, ControlDayOffs, DaySeconds, WeekSeconds, MonthSeconds, ResetCode, Enabled, WorkHours)" +
                    " VALUES((SELECT ISNULL(MAX(ID) + 1, 1) FROM Users), (SELECT ISNULL(MAX(ID) + 1, 1) FROM Users), @Password, @Email, @FullName, @CRUDUsers, @EditPermiters, @ViewUsers, @EditWorkHours, @ImportExcel, @ControlPresence, @ControlDayOffs, @DaySeconds, @WeekSeconds, @MonthSeconds, @ResetCode, 1, @WorkHours)";
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
        public void UpdateUserResetCodeById(int id, string code)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                db.Query("UPDATE Users SET ResetCode = @code WHERE Id = @id", new { id, code });
            }
        }
        public void UpdateRegisteredUserAndCode(User user)
        {
            var salt = PasswordHasher.GenerateSalt();
            var papper = _configuration.GetSection("Hash:Papper").Value;
            var iteration = int.Parse(_configuration.GetSection("Hash:Iteration").Value);
            user.Password = PasswordHasher.ComputeHash(user.Password, salt, papper, iteration);
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = $"UPDATE Users SET Login = @Login, Password = @Password, ResetCode = NULL, Enabled = 1, Salt = '{salt}' WHERE Id = @Id";
                db.Execute(sqlQuery, user);
            }
        }
        public void UpdateUserPassword(int Id, string Password)
        {
            var salt = PasswordHasher.GenerateSalt();
            var papper = _configuration.GetSection("Hash:Papper").Value;
            var iteration = int.Parse(_configuration.GetSection("Hash:Iteration").Value);
            Password = PasswordHasher.ComputeHash(Password, salt, papper, iteration);
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = $"UPDATE Users SET Password = @Password, Salt = @salt WHERE Id = @Id";
                db.Execute(sqlQuery, new { Id, salt, Password });
            }
        }
        public void UpdateUserPasswordAndCode(int id, string code, string password)
        {
            var salt = PasswordHasher.GenerateSalt();
            var papper = _configuration.GetSection("Hash:Papper").Value;
            var iteration = int.Parse(_configuration.GetSection("Hash:Iteration").Value);
            password = PasswordHasher.ComputeHash(password, salt, papper, iteration);
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                string sqlQuery;
                if (code == null)
                {
                    sqlQuery = $"UPDATE Users SET ResetCode = NULL, Password = '{password}', Salt = {salt} WHERE Id = {id}";
                    db.Execute(sqlQuery, new { id, password });

                }

                else
                {
                    sqlQuery = $"UPDATE Users SET ResetCode = @code, Password = @password, Salt = {salt} WHERE Id = @id";
                    db.Execute(sqlQuery, new { id, code, password });

                }


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
        public bool ComparePasswords(int id, string password)
        {
            string? salt = "";
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                salt = db.Query<string>($"SELECT Salt FROM Users WHERE id = {id}").FirstOrDefault();
                if (salt == null)
                    return false;
                var papper = _configuration.GetSection("Hash:Papper").Value;
                var iteration = int.Parse(_configuration.GetSection("Hash:Iteration").Value);
                var hashedPassword = PasswordHasher.ComputeHash(password, salt, papper, iteration);
                return (hashedPassword == db.Query<User>($"SELECT * FROM Users WHERE  id = {id}").First().Password);
            }
        }
    }
}
