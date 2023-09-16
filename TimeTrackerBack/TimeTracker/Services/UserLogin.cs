using OAuthTutorial.Helpers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OAuthTutorial.Services
{
    public class UserLogin
    {
        private const string YoutubeApiEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

        private record GetEmailObject(string email);

        public static async Task<string> GetEmail(string accessToken)
        {

            var response = await HttpClientHelper.SendGetRequest<GetEmailObject>(YoutubeApiEndpoint, new Dictionary<string, string>(), accessToken);
            var email = response.email;
            return email;
        }
    }
}
