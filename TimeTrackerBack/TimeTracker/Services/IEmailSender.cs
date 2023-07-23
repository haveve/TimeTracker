namespace TimeTracker.Services
{
    public interface IEmailSender
    {
        void SendResetPassEmail(string code, string email);
        void SendRegistrationEmail(string code, string email);
        void SendResponseOfVacationRequest(bool reaction, string date, string email);
    }
}
