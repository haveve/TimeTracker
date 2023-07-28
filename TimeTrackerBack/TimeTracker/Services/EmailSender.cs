using System.Net;
using System.Net.Mail;

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
            string resetUrl = "http://localhost:3000/ResetPassword";

            string url = $"{resetUrl}?code={code}&email={email}";

            var mail = new MailMessage(_emailFrom, email);
            mail.Subject = "Password recovery TimeTracker";
            mail.Body = $"To reset your password, follow the following link = {url}";

            client.Send(mail);
        }
        public void SendRegistrationEmail(string code, string email)
        {
            var client = new SmtpClient(_serverUrl, _port)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_emailFrom, _emailPassword)
            };
            string resetUrl = "http://localhost:3000/UserRegistration";

            string url = $"{resetUrl}?code={code}&email={email}";

            var mail = new MailMessage(_emailFrom, email);
            mail.Subject = "TimeTracker Registration";
            mail.Body = $"To register, follow the link = {url}";

            client.Send(mail);
        }
        public void SendResponseOfVacationRequest(bool reaction, string date, string email)
        {
            var client = new SmtpClient(_serverUrl, _port)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_emailFrom, _emailPassword)
            };

            var mail = new MailMessage(_emailFrom, email);
            mail.Subject = "TimeTracker informing";

            mail.Body = reaction ? $"Congratulations, your vacation request {date} has been approved" :
                $"Unfortunately, your vacation request {date} was rejected";

            client.Send(mail);
        }
    }
}
