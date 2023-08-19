using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using TimeTracker.Services;


namespace TimeTracker.Controllers;

public class TestController : Controller
{
    private IHostEnvironment Environment;
    public TestController(IHostEnvironment _environment)
    {
        Environment = _environment;
    }
    public IActionResult Index()
    {
        return View();
    }
    public IActionResult Test()
    {
        return View("Test");
    }
    //[HttpGet("download")]  
    public IActionResult Download()  
    {  
        ExcelHandler ExcelHandler = new ExcelHandler();
        //var filepath = Path.Combine(Environment.ContentRootPath,"wwwroot","test.txt");  
        var filepath = Path.Combine(Environment.ContentRootPath,"wwwroot","test.xlsx");
        var excelFile = ExcelHandler.GetExcelTable();
        return File(excelFile, "application/vnd.ms-excel", "test.xlsx");
        //return File(System.IO.File.ReadAllBytes(filepath), "application/vnd.ms-excel", "test.xlsx");
        //return File(System.IO.File.ReadAllBytes(filepath), "text/plain", "test.txt");

        
        return null;
    }  
}