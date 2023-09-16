using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;
using Microsoft.CodeAnalysis;
using Microsoft.AspNetCore.Http.Extensions;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Util.Store;
using System.IO;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Requests;
using Google.Apis.Books.v1;

namespace TimeTracker.Controllers
{
    public class OAuth2Controller : Controller
    {

        [Route("google-auth")]
        public async Task<IActionResult> GoogleAuth([FromServices] IConfiguration config)
        {

            string DomainName = "https://"+HttpContext.Request.Host.Value;
            string redirectUrl =DomainName+"/google-response";

            dsAuthorizationBroker.RedirectUri = redirectUrl;

            var credential = await dsAuthorizationBroker.AuthorizeAsync(
                     new ClientSecrets
                     {
                         ClientId = config["Secrets:Google:ClientId"],
                         ClientSecret = config["Secrets:Google:ClientSecret"]
                     },
                     new[]{"https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/plus.login"},
                     "user", CancellationToken.None);

            return Redirect(redirectUrl);
        }

        [Route("google-response")]
        public IActionResult GoogleResponseHandler(string code)
        {
            return Content(HttpContext.Request.QueryString.Value!+ code);
        }
    }
    public class dsAuthorizationBroker : GoogleWebAuthorizationBroker
    {
        private static object locker = new object();

        private static string _redirectUri;

        public static string RedirectUri
        {
            get
            {
                lock (locker)
                {
                    return _redirectUri;
                }
            }

            set
            {
                lock (locker)
                {
                    _redirectUri = value;
                }
            }
        }

        public new static async Task<UserCredential> AuthorizeAsync(
            ClientSecrets clientSecrets,
            IEnumerable<string> scopes,
            string user,
            CancellationToken taskCancellationToken,
            IDataStore dataStore = null)
        {
            var initializer = new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = clientSecrets,
            };
            return await AuthorizeAsyncCore(initializer, scopes, user,
                taskCancellationToken, dataStore).ConfigureAwait(false);
        }

        private static async Task<UserCredential> AuthorizeAsyncCore(
            GoogleAuthorizationCodeFlow.Initializer initializer,
            IEnumerable<string> scopes,
            string user,
            CancellationToken taskCancellationToken,
            IDataStore dataStore)
        {
            initializer.Scopes = scopes;
            initializer.DataStore = dataStore ?? new FileDataStore(Folder);
            var flow = new dsAuthorizationCodeFlow(initializer);
            return await new AuthorizationCodeInstalledApp(flow,
                new LocalServerCodeReceiver())
                .AuthorizeAsync(user, taskCancellationToken).ConfigureAwait(false);
        }
    }


    public class dsAuthorizationCodeFlow : GoogleAuthorizationCodeFlow
    {
        public dsAuthorizationCodeFlow(Initializer initializer)
            : base(initializer) { }

        public override AuthorizationCodeRequestUrl
                       CreateAuthorizationCodeRequest(string redirectUri)
        {

            return base.CreateAuthorizationCodeRequest(dsAuthorizationBroker.RedirectUri);
        }
    }
}
