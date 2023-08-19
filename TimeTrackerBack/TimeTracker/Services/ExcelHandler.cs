
using TimeTracker.GraphQL.Types.TimeQuery;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using TimeTracker.Models;
using TimeTracker.Repositories;

namespace TimeTracker.Services;

public class ExcelHandler : IExcelHandler
{
    private IHostEnvironment Environment;

    public ExcelHandler(IHostEnvironment _environment)
    {
        Environment = _environment;
    }
    public byte[] GetExcelTable(string fileName)
    {
        byte[] excelBytes;
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        string inputFileName=Path.Combine(Environment.ContentRootPath,"wwwroot",$"ExcelExport-{fileName}.xlsx");
        using (var package = new ExcelPackage(inputFileName))
        {
            //get the workbook as a bytearray
            excelBytes = package.GetAsByteArray();
        }
        File.Delete(inputFileName);
        return excelBytes;
    }

    public void WriteExcelTable(List<User> users, string inputFileName)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        using (var package = new ExcelPackage())
        {
            var sheet = package.Workbook.Worksheets.Add("Sheet");

            sheet.Cells[1, 1].Value = "Id";
            sheet.Cells[1, 2].Value = "Login";
            sheet.Cells[1, 3].Value = "Email";
            sheet.Cells[1, 4].Value = "Full Name";
            sheet.Cells[1, 5].Value = "Work hours";
            sheet.Cells[1, 6].Value = "Worked hours";
            sheet.Cells[1, 7].Value = "%";
            
            for (int i = 0; i < users.Count; i++)
            {
                sheet.Cells[i+2, 1].Value = users[i].Id;
                sheet.Cells[i+2, 2].Value = users[i].Login;
                sheet.Cells[i+2, 3].Value = users[i].Email;
                sheet.Cells[i+2, 4].Value = users[i].FullName;
                sheet.Cells[i+2, 5].Value = users[i].WorkHours;
                sheet.Cells[i+2, 6].Value = users[i].WorkedHours;
                sheet.Cells[i+2, 7].Value = users[i].WorkedHours/users[i].WorkHours*100;
            }
            var bin = package.GetAsByteArray();
            var filepath = Path.Combine(Environment.ContentRootPath,"wwwroot",$"ExcelExport-{inputFileName}.xlsx");
            File.WriteAllBytes(filepath, bin);
            FileInfo fi = new FileInfo(filepath);
            package.SaveAs(fi);
        }
    }
}