namespace TimeTracker.Helpers
{
    public static class RandomString
    {
        public static string GetRandomString()
        {
            return Guid.NewGuid().ToString();
        }
    }
}
