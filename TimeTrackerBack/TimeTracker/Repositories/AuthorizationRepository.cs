using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;
using static TimeTracker.Controllers._2fAuth;

namespace TimeTracker.Repositories
{
    public class AuthorizationRepository : IAuthorizationRepository
    {
        private readonly DapperContext _dapperContext;

        public AuthorizationRepository(DapperContext context)
        {
            _dapperContext = context;
        }

        void IAuthorizationRepository.CreateRefreshToken(TokenResult refreshToken, int userId,bool? _2fActivatedValue = null)
        {

            string query = "INSERT INTO UserRefreshes (UserId, ExpiresStart, ExpiresEnd, Token,Activated2fAuth) VALUES(@userId, @issuedAt, @expiredAt, @token,@_2fActivatedValue)";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { userId, refreshToken.token, refreshToken.expiredAt, refreshToken.issuedAt, _2fActivatedValue });
        }

        void IAuthorizationRepository.Activate2fRefreshToken(string refreshToken, int userId)
        {
            string query = "UPDATE UserRefreshes SET Activated2fAuth = @activatedValue WHERE UserId = @userId AND Token = @refreshToken";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { activatedValue = true, refreshToken ,userId});
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
            connection.Execute(query, new { refreshToken });
        }

        void IAuthorizationRepository.UpdateRefreshToken(string oldRefreshToken, TokenResult refreshToken, int userId)
        {
            string query = "UPDATE UserRefreshes SET Token = @token, ExpiresStart = @issuedAt , ExpiresEnd = @expiredAt   WHERE UserId = @userId AND Token = @oldRefreshToken";
            using var connection = _dapperContext.CreateConnection();
            connection.Execute(query, new { userId, refreshToken.token, refreshToken.expiredAt, refreshToken.issuedAt, oldRefreshToken });
        }
        public RefreshToken? GetRefreshToken(string refreshToken)
        {
            string query = "SELECT * FROM UserRefreshes WHERE Token = @refreshToken";
            using var connection = _dapperContext.CreateConnection();
            return connection.QuerySingleOrDefault<RefreshToken?>(query, new { refreshToken });
        }
        public DateTime? GetLastDateOfUserChanging(int userId)
        {
            using var connection = _dapperContext.CreateConnection();
            var sqlQuery = "SELECT LastChanged FROM Users WHERE Id = @userId";
            return connection.QuerySingle<DateTime?>(sqlQuery, new { userId });
        }

        public void Add2factorKey(int userId, string key)
        {
            using var connection = _dapperContext.CreateConnection();
            var sqlQuery = "Update Users SET Key2Auth = @key WHERE Id = @userId";
            connection.Execute(sqlQuery, new { key, userId });
        }

        public void Drop2factorKey(int userId, string? emailCode, WayToDrop2f way)
        {
            using var connection = _dapperContext.CreateConnection();
            string sqlQuery = "";

            switch (way)
            {
                case WayToDrop2f.Code:
                    {
                        sqlQuery = "Update Users SET Key2Auth = @key WHERE Id = @userId";
                        break;
                    }
                case WayToDrop2f.Email:
                    {
                        sqlQuery = "Update Users SET Key2Auth = @key WHERE Id = @userId AND Key2Auth = @emailCode";
                        break;
                    }
            }

            connection.Execute(sqlQuery, new { key = (string?)null, userId, emailCode });
        }

        public string? Get2factorKey(int userId)
        {
            using var connection = _dapperContext.CreateConnection();
            var sqlQuery = "SELECT Key2Auth FROM Users WHERE Id = @userId";
            return connection.QuerySingle<string?>(sqlQuery, new { userId });
        }
    }
}
