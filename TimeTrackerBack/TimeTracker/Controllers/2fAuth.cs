﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Google.Authenticator;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using TimeTracker.Helpers;
using TimeTracker.Repositories;
using TimeTracker.GraphQL.Types.TimeQuery;
using System.Net;
using Microsoft.AspNetCore.WebUtilities;
using TimeTracker.GraphQL.Types.IdentityTipes.AuthorizationManager;
using System.Text.Json;

namespace TimeTracker.Controllers
{
    [Authorize]
    public class _2fAuth : Controller
    {
        [Route("2f-auth")]
        public IActionResult Get2fData( [FromServices] IUserRepository userRepository)
        {
            string key = RandomString.GetRandomString();

            var id = TimeQueryGraphQLType.GetUserIdFromClaims(HttpContext.User);

            var user = userRepository.GetUser(id);

            TwoFactorAuthenticator tfa = new TwoFactorAuthenticator();
            SetupCode setupInfo = tfa.GenerateSetupCode(HttpContext.Request.Host.Host, user.Email, key, false, 3);

            string qrCodeImageUrl = setupInfo.QrCodeSetupImageUrl;
            string manualEntrySetupCode = setupInfo.ManualEntryKey;

            return Json(new { qrUrl = qrCodeImageUrl, manualEntry = manualEntrySetupCode,key });
        }


        [Route("set-2f-auth")]
        public IActionResult SetUser2fAuth([FromServices] IAuthorizationRepository authorizationRepository, string key, string code)
        {
            var id = TimeQueryGraphQLType.GetUserIdFromClaims(HttpContext.User);
            TwoFactorAuthenticator tfa = new TwoFactorAuthenticator();

            if(tfa.ValidateTwoFactorPIN(key, code))
            {
                authorizationRepository.Add2factorKey(id, key);

                return NoContent();
            }

            return BadRequest("Uncorrect Code");
        }

        [AllowAnonymous]
        [Route("verify-2f-auth")]
        public IActionResult Verify2fAuth([FromServices] IUserRepository userRepository, [FromServices] IConfiguration config, [FromServices] IAuthorizationManager authorizationManager, [FromServices] IAuthorizationRepository _authorizationRepository, [FromQuery] string token, [FromQuery] string code)
        {
            if (!authorizationManager.IsValidToken(token))
            {
                return BadRequest("Invalid temporary token");
            }

            var tokenData = authorizationManager.ReadJwtToken(token);
            try
            {
                int userId = int.Parse(tokenData.Claims.First(c => c.Type == "UserId").Value);
                string refreshToken = tokenData.Claims.First(c => c.Type == "RefreshToken").Value;
                DateTime issuedAt = JsonSerializer.Deserialize<DateTime>(tokenData.Claims.First(c => c.Type == "IssuedAtRefresh").Value);
                DateTime expiredAt = JsonSerializer.Deserialize<DateTime>(tokenData.Claims.First(c => c.Type == "ExpiredAtRefresh").Value);

                var user = userRepository.GetUser(userId);

                if (user.Key2Auth == null || !_2fAuthHelper.Check2fAuth(user.Key2Auth, code))
                {
                    return BadRequest("Invalid one-time code or you does not turn on 2f auth");
                }

                _authorizationRepository.Activate2fRefreshToken(refreshToken, userId);

                Dictionary<string, string?> queryParams = new Dictionary<string, string?>
            {
                { "expiredAt", JsonSerializer.Serialize(expiredAt)},
                { "issuedAt", JsonSerializer.Serialize(issuedAt) },
                { "token", refreshToken }
            };

                var url = QueryHelpers.AddQueryString("/Login", queryParams);

                return Json(url);
            }
            catch
            {
                return BadRequest("Invalid temporary token");
            }

        }


        [Route("drop-2f-auth")]
        public IActionResult Drop2fAuth([FromServices] IConfiguration config,[FromServices] IAuthorizationRepository authorizationRepository, [FromQuery]string code, [FromQuery] WayToDrop2f way)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid parameters");
            }

            var id = TimeQueryGraphQLType.GetUserIdFromClaims(HttpContext.User);

            TwoFactorAuthenticator tfa = new TwoFactorAuthenticator();

            string? key = authorizationRepository.Get2factorKey(id);

            switch (way)
            {
                case WayToDrop2f.Code:
                    {
                        if (!tfa.ValidateTwoFactorPIN(key, code))
                            return BadRequest("Invalid one-time code");


                        authorizationRepository.Drop2factorKey(id, code, way);
                        break;
                    }

                case WayToDrop2f.Email:
                    {
                        authorizationRepository.Drop2factorKey(id, code, way);
                        return Redirect("http://" + config["FrontDomain"]!);
                    }
            }

            return NoContent();
        }

        public enum WayToDrop2f
        {
            Code = 0,
            Email = 1
        }
    }
}