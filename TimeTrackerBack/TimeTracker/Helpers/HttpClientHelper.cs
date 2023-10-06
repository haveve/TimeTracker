using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace OAuthTutorial.Helpers
{
    public static class HttpClientHelper
    {
        public static async Task<T> SendGetRequest<T>(string endpoint, Dictionary<string, string> queryParams, string accessToken, Dictionary<string, string>? headers = null)
        {
            return await SendHttpRequestAsync<T>(HttpMethod.Get, endpoint, accessToken, queryParams, headers: headers);
        }

        public static async Task<T> SendPostRequest<T>(string endpoint, Dictionary<string, string> bodyParams, Dictionary<string, string>? headers = null)
        {
            var httpContent = new FormUrlEncodedContent(bodyParams);
            return await SendHttpRequestAsync<T>(HttpMethod.Post, endpoint, httpContent: httpContent,headers:headers);
        }

        private static async Task<T> SendHttpRequestAsync<T>(HttpMethod httpMethod, string endpoint, string? accessToken = null, Dictionary<string, string>? queryParams = null, HttpContent? httpContent = null, Dictionary<string, string>? headers = null)
        {
            var url = queryParams != null
                ? QueryHelpers.AddQueryString(endpoint, queryParams)
                : endpoint;

            var request = new HttpRequestMessage(httpMethod, url);

            if (accessToken != null)
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            }
            
            if(headers != null)
            {
               foreach(var header in headers)
                {
                    request.Headers.Add(header.Key, header.Value);
                }
            }

            if (httpContent != null)
            {
                request.Content = httpContent;
            }

            using var httpClient = new HttpClient();
            using var response = await httpClient.SendAsync(request);

            var resultJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(resultJson);
            }

            var result = JsonConvert.DeserializeObject<T>(resultJson);
            return result;
        }
    }
}
