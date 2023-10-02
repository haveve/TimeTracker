using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using TimeTracker.GraphQL.Types.IdentityTipes.Models;
using static TimeTracker.Controllers._2fAuth;

namespace TimeTracker.Repositories
{
    public interface IAuthorizationRepository
    {
        public void CreateRefreshToken(TokenResult refreshToken,int userId);
        public void UpdateRefreshToken(string oldRefreshToken, TokenResult refreshToken, int userId);
        public void DeleteRefreshToken(string refreshToken);
        public void DeleteAllRefreshTokens(int userId);
        public RefreshToken? GetRefreshToken(string refreshToken);
        public DateTime? GetLastDateOfUserChanging(int userId);
        public void Add2factorKey(int userId,string key);
        public string? Get2factorKey(int userId);
        public void Drop2factorKey(int userId, string? emailCode, WayToDrop2f way);
    }
}
