using Microsoft.AspNetCore.Mvc;
using TimeTracker.Services;


namespace TimeTracker.Controllers;

public class TestController : Controller
{
    private readonly IHostEnvironment _environment;
    public TestController(IHostEnvironment environment)
    {
        _environment = environment;
    }
    public IActionResult Download(string id)  
    {  
        var excelHandler = new ExcelHandler(_environment);
        var excelFile = excelHandler.GetExcelTable(id);
        return File(excelFile, "application/vnd.ms-excel", $"ExcelExport-{id}.xlsx");
    }
}