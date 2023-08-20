using TimeTracker.Models;

namespace TimeTracker.Services;

public interface IExcelHandler
{
    public byte[] GetExcelTable(string fileName);
    public void WriteExcelTable(List<User> users, string inputFileName);
}