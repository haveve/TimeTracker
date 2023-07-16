namespace TimeTracker.Services
{
    public interface IEmailSender
    {
        void SendResetPassEmail(string code, string email);
    }
}
