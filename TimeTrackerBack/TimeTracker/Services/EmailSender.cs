using System.Net;
using System.Net.Mail;
using System.Text;
using TimeTracker.Models;

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
        public void SendResponseOfVacationRequest(VacationRequest vacationRequest, string email)
        {
            var client = new SmtpClient(_serverUrl, _port)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_emailFrom, _emailPassword)
            };

            var mail = new MailMessage(_emailFrom, email);
            mail.Subject = "TimeTracker informing";

            if (vacationRequest.Status == "Approved")
            {
                mail.Body = $"Congratuations! Your vacation request \"{vacationRequest.InfoAboutRequest}\" " +
                    $"for dates \"{vacationRequest.StartDate} - {vacationRequest.EndDate}\" was approved!";
            }
            else
            {
                StringBuilder stringBuilder = new StringBuilder();
                foreach (var node in vacationRequest.ApproversNodes)
                {
                    stringBuilder.Append(node.Approver.FullName);
                    stringBuilder.Append(" - ");
                    stringBuilder.Append(node.IsRequestApproved == null ? "No reaction" : node.IsRequestApproved == true ? "Approved" : "Declined");
                    stringBuilder.Append(" - ");
                    stringBuilder.Append(node.ReactionMessage);
                    stringBuilder.Append("\n\r");

                }


                mail.Body = $"Unfortunately, your vacation request \"{vacationRequest.InfoAboutRequest}\" " +
                    $"for dates \"{vacationRequest.StartDate} - {vacationRequest.EndDate}\" was declined. Here is some information from approvers:\n" +
                    $"{stringBuilder}";
            }

            client.Send(mail);
        }
    }
}
