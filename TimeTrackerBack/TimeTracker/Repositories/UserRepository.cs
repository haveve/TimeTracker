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
        private readonly IAuthorizationRepository _authorizationRepository;

        string connectionString = null;
        public UserRepository(DapperContext context, IConfiguration configuration,IAuthorizationRepository authorizationRepository)
        {
            connectionString = context.CreateConnection().ConnectionString;
            _configuration = configuration;
            _authorizationRepository = authorizationRepository;
        }
        public List<User> GetUsers()
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>("SELECT * FROM Users").ToList();
            }
        }
        public List<User> GetSearchedSortedfUsers(string search, string orderfield, string order, string enabled)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                if (orderfield == null) orderfield = "Id";
                return db.Query<User>($"SELECT * FROM Users WHERE (Login LIKE '%{search}%' OR FullName LIKE '%{search}%') AND (Enabled LIKE '{enabled}') ORDER BY {orderfield} {order}").ToList();
            }
        }
        public List<User> GetUsersByFullName(string FullName)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>($"SELECT * FROM Users WHERE FullName LIKE '%{FullName}%' ORDER BY FullName ASC").ToList();
            }
        }
        public User GetUser(int id)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>("SELECT * FROM Users WHERE Id = @id", new { id }).First();
            }
        }
        public User? GetUserByCredentials(string login, string password, bool hashed = false)
        {
            string? salt = "";
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                salt = db.Query<string>($"SELECT Salt FROM Users WHERE Login = @login Or Email = @login",new{ login}).FirstOrDefault();
                if (salt == null)
                    return null;
                var papper = _configuration.GetSection("Hash:Papper").Value;
                var iteration = int.Parse(_configuration.GetSection("Hash:Iteration").Value);
                var hashedPassword = hashed ? password : PasswordHasher.ComputeHash(password, salt, papper, iteration);
                return db.Query<User>($"SELECT * FROM Users WHERE (Email = @login OR Login = @login) AND Password = @hashedPassword",new{login,hashedPassword}).FirstOrDefault();
            }
        }
        public User? GetUserByEmailOrLogin(string LoginOrEmail)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<User>($"SELECT * FROM Users WHERE Email = '{LoginOrEmail}' OR Login = '{LoginOrEmail}'").FirstOrDefault();
            }
        }
        public Permissions GetUserPermissions(int id)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                return db.Query<Permissions>("SELECT * FROM Permissions WHERE userId = @id", new { id }).First();
            }
        }
        public void CreateUser(User user, Permissions permissions)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "INSERT INTO Users (Id, Login, Password, Email, FullName, ResetCode, Enabled, WorkHours)" +
                    " VALUES((SELECT ISNULL(MAX(ID) + 1, 1) FROM Users), (SELECT ISNULL(MAX(ID) + 1, 1) FROM Users), @Password, @Email, @FullName, @ResetCode, 1, @WorkHours)";
                db.Execute(sqlQuery, user);
                sqlQuery = "INSERT INTO Permissions (userId, CRUDUsers, EditApprovers, ViewUsers, EditWorkHours, ExportExcel, ControlPresence, ControlDayOffs)" +
                    " VALUES ((SELECT ISNULL(MAX(userId) + 1, 1) FROM Permissions), @CRUDUsers, @EditApprovers, @ViewUsers, @EditWorkHours, @ExportExcel, @ControlPresence, @ControlDayOffs)";
                db.Execute(sqlQuery, permissions );
            }
        }
        public void UpdateUser(User user)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "UPDATE Users SET Login = @Login, FullName = @FullName, Email = @Email, LastChanged = @LastChanged WHERE Id = @Id";
                var LastChanged = DateTime.UtcNow;
                db.Execute(sqlQuery, new{ user.Id ,user.Login, user.FullName, user.Email, LastChanged });
                _authorizationRepository.DeleteAllRefreshTokens(user.Id);
            }
        }
        public void UpdateUserResetCodeById(int id, string code)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var LastChanged = DateTime.UtcNow;
                db.Execute("UPDATE Users SET ResetCode = @code, LastChanged = @LastChanged WHERE Id = @id", new { id, code, LastChanged });
                _authorizationRepository.DeleteAllRefreshTokens(id);
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
                var sqlQuery = $"UPDATE Users SET Password = @Password, Salt = @salt, LastChanged = @LastChanged WHERE Id = @Id";
                var LastChanged = DateTime.UtcNow;
                db.Execute(sqlQuery, new { Id, salt, Password,LastChanged });
                _authorizationRepository.DeleteAllRefreshTokens(Id);
            }
        }
        public void UpdateUserPasswordAndCode(int id, string password)
        {
            var salt = PasswordHasher.GenerateSalt();
            var papper = _configuration.GetSection("Hash:Papper").Value;
            var iteration = int.Parse(_configuration.GetSection("Hash:Iteration").Value);
            password = PasswordHasher.ComputeHash(password, salt, papper, iteration);
            var LastChanged = DateTime.UtcNow;
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                string sqlQuery = "UPDATE Users SET ResetCode = NULL, Password = @password, Salt = @salt, LastChanged = @LastChanged WHERE Id = @id";
                db.Execute(sqlQuery, new { id, password,LastChanged,salt });

                _authorizationRepository.DeleteAllRefreshTokens(id);
            }


        }

        public void UpdateUserPermissions(Permissions permissions)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var sqlQuery = "UPDATE Permissions SET CRUDUsers = @CRUDUsers, EditApprovers = @EditApprovers, ViewUsers = @ViewUsers, EditWorkHours = @EditWorkHours, ExportExcel = @ExportExcel, ControlPresence = @ControlPresence, ControlDayOffs = @ControlDayOffs WHERE userId = @userId";
                db.Execute(sqlQuery, permissions);
            }
        }
        public void DisableUser(int id)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                var LastChanged = DateTime.UtcNow;
                var sqlQuery = "UPDATE Users SET Enabled = 0, LastChanged = @LastChanged WHERE Id = @id";
                db.Execute(sqlQuery, new { id, LastChanged });
                _authorizationRepository.DeleteAllRefreshTokens(id);
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
        public void SetUsersVacationDays(int userId, int daysCount)
        {
            using (IDbConnection db = new SqlConnection(connectionString))
            {
                string sqlQuery = $"UPDATE Users SET VacationDays = {daysCount} WHERE Id = {userId}";
                db.Execute(sqlQuery);
            }
        }
    }
}
