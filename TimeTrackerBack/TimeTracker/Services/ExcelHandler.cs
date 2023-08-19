

using OfficeOpenXml;

namespace TimeTracker.Services;

public class ExcelHandler : IExcelHandler
{
    public byte[] GetExcelTable()
    {
        byte[] excelBytes;
        
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        using (var package = new ExcelPackage())
        {
            var sheet = package.Workbook.Worksheets.Add("Sheet");

            sheet.Cells[1,1].Value = "test";
            //get the workbook as a bytearray
            excelBytes = package.GetAsByteArray();
        }

        return excelBytes;
    }
}