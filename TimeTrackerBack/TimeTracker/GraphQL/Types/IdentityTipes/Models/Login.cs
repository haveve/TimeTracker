using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TimeTracker.GraphQL.Types.IdentityTipes.Models
{
    public class Login
    {
        [BindRequired]
        public string LoginOrEmail { get; set; } = null!;
        [BindRequired]
        public string Password { get; set; } = null!;
    }
}
