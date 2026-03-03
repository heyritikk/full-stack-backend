using InternalBudgetTracker.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace InternalBudgetTracker.Controllers
{
 [ApiController]
 [Route("api/report")]
 [Authorize] // any authenticated user can view reports; tighten if needed
 public class ReportController : ControllerBase
 {
 private readonly AppDbContext _context;

 public ReportController(AppDbContext context)
 {
 _context = context;
 }

 // GET /api/report/department
 [HttpGet("department")]
 public IActionResult GetDepartmentReport()
 {
 var data = _context.Departments
 .AsNoTracking()
 .Select(d => new
 {
 departmentId = d.DepartmentId,
 departmentName = d.DepartmentName,
 totalBudgets = _context.Budgets.Count(b => b.DepartmentId == d.DepartmentId),
 totalAllocated = _context.Budgets
 .Where(b => b.DepartmentId == d.DepartmentId)
 .Sum(b => (decimal?)b.AmountAllocated) ?? 0m,
 totalApprovedExpenses = _context.Expenses
 .Where(e => e.Budget.DepartmentId == d.DepartmentId && e.Status == Enum.ExpenseStatus.Approved)
 .Sum(e => (decimal?)e.Amount) ?? 0m
 })
 .ToList();

 return Ok(data);
 }

 // GET /api/report/budget
 [HttpGet("budget")]
 public IActionResult GetBudgetReport()
 {
 var data = _context.Budgets
 .Include(b => b.Department)
 .AsNoTracking()
 .Select(b => new
 {
 budgetId = b.BudgetId,
 title = b.Title,
 departmentName = b.Department != null ? b.Department.DepartmentName : null,
 allocated = b.AmountAllocated,
 spent = _context.Expenses
 .Where(e => e.BudgetId == b.BudgetId && e.Status == Enum.ExpenseStatus.Approved)
 .Sum(e => (decimal?)e.Amount) ?? 0m
 })
 .ToList()
 .Select(x => new
 {
 x.budgetId,
 x.title,
 x.departmentName,
 allocated = x.allocated,
 spent = x.spent,
 remaining = x.allocated - x.spent
 });

 return Ok(data);
 }

 // GET /api/report/summary
 [HttpGet("summary")]
 public IActionResult GetSummaryReport()
 {
 var totalBudgets = _context.Budgets.Count();
 var totalAllocated = _context.Budgets.Sum(b => (decimal?)b.AmountAllocated) ?? 0m;
 var totalApprovedExpenses = _context.Expenses
 .Where(e => e.Status == Enum.ExpenseStatus.Approved)
 .Sum(e => (decimal?)e.Amount) ?? 0m;

 var overBudgetCount = _context.Budgets
 .Select(b => new
 {
 allocated = b.AmountAllocated,
 spent = _context.Expenses
 .Where(e => e.BudgetId == b.BudgetId && e.Status == Enum.ExpenseStatus.Approved)
 .Sum(e => (decimal?)e.Amount) ?? 0m
 })
 .ToList()
 .Count(x => x.spent > x.allocated);

 var summary = new[]
 {
 new
 {
 totalBudgets,
 totalAllocated,
 totalSpent = totalApprovedExpenses,
 overBudget = overBudgetCount
 }
 };

 return Ok(summary);
 }
 }
}


