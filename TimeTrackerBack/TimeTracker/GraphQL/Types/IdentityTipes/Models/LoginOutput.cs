using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.IdentityTipes.Models
{
    public class LoginOutput
    {
        public User current_user { get; set; } = null!;
        public string access_token { get; set; } = null!;
    }
}
