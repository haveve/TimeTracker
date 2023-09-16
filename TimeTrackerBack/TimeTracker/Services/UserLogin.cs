using OAuthTutorial.Helpers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OAuthTutorial.Services
{
    public class UserLogin
    {
        private const string YoutubeApiEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

        public static async Task<string> GetEmail(string accessToken)
        {

            var response = await HttpClientHelper.SendGetRequest<dynamic>(YoutubeApiEndpoint, new Dictionary<string, string>(), accessToken);

            var email = response.email;
            return email;
        }

        public static async Task UpdateChannelDescriptionAsync(string accessToken, string channelId, string newDescription)
        {
            var queryParams = new Dictionary<string, string>
            {
                { "part", "brandingSettings" }
            };

            var body = new
            {
                id = channelId,
                brandingSettings = new
                {
                    channel = new
                    {
                        description = newDescription
                    }
                }
            };

            await HttpClientHelper.SendPutRequest(YoutubeApiEndpoint, queryParams, body, accessToken);
        }
    }
}
