using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using TimeTracker.Models;
using TimeTracker.Services;


namespace TimeTracker.Controllers;

public class TestController : Controller
{
    private IHostEnvironment Environment;
    private readonly IConfiguration Config; 
    public TestController(IHostEnvironment _environment, IConfiguration _config)
    {
        Environment = _environment;
        Config = _config;
    }
    public IActionResult Download(string id)  
    {  
        ExcelHandler ExcelHandler = new ExcelHandler(Environment);
        var excelFile = ExcelHandler.GetExcelTable(id);
        return File(excelFile, "application/vnd.ms-excel", $"ExcelExport-{id}.xlsx");
    }
}