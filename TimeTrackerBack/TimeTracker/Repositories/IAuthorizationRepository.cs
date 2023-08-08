using TimeTracker.GraphQL.Types.IdentityTipes.Models;

namespace TimeTracker.Repositories
{
    public interface IAuthorizationRepository
    {
        public void CreateRefreshToken(string refreshToken,int userId);
        public void UpdateRefreshToken(string oldRefreshToken,string refreshToken, int userId);
        public void DeleteRefreshToken(string refreshToken);
        public void DeleteAllRefreshTokens(int userId);
        public RefreshToken? GetRefreshToken(string refreshToken, int userId);
        public DateTime? GetLastDateOfUserChanging(int userId);
    }
}
