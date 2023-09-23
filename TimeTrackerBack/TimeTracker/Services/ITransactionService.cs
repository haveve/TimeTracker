namespace TimeTracker.Services
{
    public interface ITransactionService
    {
        public string GetExecuteString();
        public void AddToExecuteString(string query);
        public void Execute();

    }
}
