using System.Net.Mail;
using System.Net;

namespace TimeTracker.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly string _emailFrom = "TimeTrackerSanaProject@outlook.com";
        private readonly string _emailPassword = "JcuYokAVozr_";
        private readonly string _serverUrl = "smtp.office365.com";
        private readonly int _port = 587;
        public EmailSender() { }

        public void SendResetPassEmail(string code, string email)
        {
            var client = new SmtpClient(_serverUrl, _port)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_emailFrom, _emailPassword)
            };
            string resetUrl = "https://time-tracker3f.azurewebsites.net/ResetPassword";

            string url = $"{resetUrl}?code={code}&email={email}";

            var mail = new MailMessage(_emailFrom, email);
            mail.Subject = "Password recovery TimeTracker";
            mail.Body = $"To reset your password, follow the following link = {url}";
            
            client.Send(mail);
        }
    }
}
