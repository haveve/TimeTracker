using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;

namespace TimeTracker.Repositories
{
    public class AuthorizationRepository : IAuthorizationRepository
    {
        private readonly DapperContext _dapperContext;

        public AuthorizationRepository(DapperContext context)
        {
            _dapperContext = context;
        }

        void IAuthorizationRepository.CreateRefreshToken(string refreshToken, int userId)
        {
            var startDate = DateTime.UtcNow;
            var endDate = DateTime.UtcNow.AddSeconds(IAuthorizationManager.RefreshTokenExpiration);

            string query = "INSERT INTO UserRefreshes (UserId, ExpiresStart, ExpiresEnd, Token) VALUES(@userId, @startDate, @endDate, @refreshToken)";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { userId, startDate, endDate, refreshToken });
        }

        void IAuthorizationRepository.DeleteAllRefreshTokens(int userId)
        {
            string query = "DELETE UserRefreshes WHERE UserId = @userId";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { userId });
        }

        void IAuthorizationRepository.DeleteRefreshToken(string refreshToken)
        {
            string query = "DELETE UserRefreshes WHERE Token = @refreshToken";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new {refreshToken });
        }

        void IAuthorizationRepository.UpdateRefreshToken(string oldRefreshToken, string refreshToken, int userId)
        {
            string query = "UPDATE UserRefreshes SET Token = @refreshToken  WHERE UserId = @userId AND Token = @oldRefreshToken";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { userId, refreshToken, oldRefreshToken });
        }
        public RefreshToken? GetRefreshToken(string refreshToken, int userId)
        {
            string query = "SELECT * FROM UserRefreshes WHERE UserId = @userId AND Token = @refreshToken";
            using var connection = _dapperContext.CreateConnection();
            return connection.QuerySingleOrDefault<RefreshToken?>(query, new { userId, refreshToken });
        }
        public DateTime? GetLastDateOfUserChanging(int userId)
        {
            using var connection = _dapperContext.CreateConnection();
            var sqlQuery = "SELECT LastChanged FROM Users WHERE Id = @userId";
            return connection.QuerySingle<DateTime?>(sqlQuery, new { userId });
        }
    }
}
