using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.IdentityTipes.Models
{
    public class LoginOutput
    {
        public int user_id { get; set; }
        public string access_token { get; set; } = null!;
        public bool is_fulltimer { get; set; }
    }
}
