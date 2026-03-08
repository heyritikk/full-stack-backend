using InternalBudgetTracker.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
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

 private static bool HasDateFilter(DateTime? start, DateTime? end) =>
 start.HasValue || end.HasValue;

 // GET /api/report/department?startDate=&endDate=
 [HttpGet("department")]
 public IActionResult GetDepartmentReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
 {
 var useDateFilter = HasDateFilter(startDate, endDate);

 var data = _context.Departments
 .AsNoTracking()
 .Select(d => new
 {
 departmentId = d.DepartmentId,
 departmentName = d.DepartmentName,
 totalBudgets = useDateFilter
 ? _context.Budgets.Count(b => b.DepartmentId == d.DepartmentId &&
 (!startDate.HasValue || b.StartDate >= startDate) &&
 (!endDate.HasValue || b.StartDate <= endDate))
 : _context.Budgets.Count(b => b.DepartmentId == d.DepartmentId),
 totalAllocated = useDateFilter
 ? _context.Budgets
 .Where(b => b.DepartmentId == d.DepartmentId &&
 (!startDate.HasValue || b.StartDate >= startDate) &&
 (!endDate.HasValue || b.StartDate <= endDate))
 .Sum(b => (decimal?)b.AmountAllocated) ?? 0m
 : _context.Budgets
 .Where(b => b.DepartmentId == d.DepartmentId)
 .Sum(b => (decimal?)b.AmountAllocated) ?? 0m,
 totalApprovedExpenses = useDateFilter
 ? _context.Expenses
 .Where(e => e.Budget.DepartmentId == d.DepartmentId && e.Status == Enum.ExpenseStatus.Approved &&
 (!startDate.HasValue || e.SubmittedDate >= startDate) &&
 (!endDate.HasValue || e.SubmittedDate <= endDate))
 .Sum(e => (decimal?)e.Amount) ?? 0m
 : _context.Expenses
 .Where(e => e.Budget.DepartmentId == d.DepartmentId && e.Status == Enum.ExpenseStatus.Approved)
 .Sum(e => (decimal?)e.Amount) ?? 0m
 })
 .ToList();

 return Ok(data);
 }

 // GET /api/report/budget?startDate=&endDate=
 [HttpGet("budget")]
 public IActionResult GetBudgetReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
 {
 var useDateFilter = HasDateFilter(startDate, endDate);

 var query = _context.Budgets
 .Include(b => b.Department)
 .AsNoTracking();

 if (useDateFilter)
 query = query.Where(b =>
 (!startDate.HasValue || b.StartDate >= startDate) &&
 (!endDate.HasValue || b.StartDate <= endDate));

 var data = query
 .Select(b => new
 {
 budgetId = b.BudgetId,
 title = b.Title,
 departmentName = b.Department != null ? b.Department.DepartmentName : null,
 allocated = b.AmountAllocated,
 spent = useDateFilter
 ? _context.Expenses
 .Where(e => e.BudgetId == b.BudgetId && e.Status == Enum.ExpenseStatus.Approved &&
 (!startDate.HasValue || e.SubmittedDate >= startDate) &&
 (!endDate.HasValue || e.SubmittedDate <= endDate))
 .Sum(e => (decimal?)e.Amount) ?? 0m
 : _context.Expenses
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

 // GET /api/report/summary?startDate=&endDate=
 [HttpGet("summary")]
 public IActionResult GetSummaryReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
 {
 var useDateFilter = HasDateFilter(startDate, endDate);

 var budgetQuery = _context.Budgets.AsNoTracking();
 if (useDateFilter)
 budgetQuery = budgetQuery.Where(b =>
 (!startDate.HasValue || b.StartDate >= startDate) &&
 (!endDate.HasValue || b.StartDate <= endDate));

 var totalBudgets = budgetQuery.Count();
 var totalAllocated = budgetQuery.Sum(b => (decimal?)b.AmountAllocated) ?? 0m;

 var expenseQuery = _context.Expenses.Where(e => e.Status == Enum.ExpenseStatus.Approved);
 if (useDateFilter)
 expenseQuery = expenseQuery.Where(e =>
 (!startDate.HasValue || e.SubmittedDate >= startDate) &&
 (!endDate.HasValue || e.SubmittedDate <= endDate));
 var totalApprovedExpenses = expenseQuery.Sum(e => (decimal?)e.Amount) ?? 0m;

 var budgetList = budgetQuery.ToList();
 var overBudgetCount = budgetList
 .Select(b => new
 {
 allocated = b.AmountAllocated,
 spent = useDateFilter
 ? _context.Expenses
 .Where(e => e.BudgetId == b.BudgetId && e.Status == Enum.ExpenseStatus.Approved &&
 (!startDate.HasValue || e.SubmittedDate >= startDate) &&
 (!endDate.HasValue || e.SubmittedDate <= endDate))
 .Sum(e => (decimal?)e.Amount) ?? 0m
 : _context.Expenses
 .Where(e => e.BudgetId == b.BudgetId && e.Status == Enum.ExpenseStatus.Approved)
 .Sum(e => (decimal?)e.Amount) ?? 0m
 })
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


