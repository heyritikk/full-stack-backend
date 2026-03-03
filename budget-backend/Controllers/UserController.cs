

using Microsoft.AspNetCore.Mvc;
using InternalBudgetTracker.DTOs;
using InternalBudgetTracker.Services;

namespace InternalBudgetTracker.Controllers
{
 [ApiController]
 [Route("api/users")]
 public class UsersController : ControllerBase
 {
 private readonly UserService _userService;

 public UsersController(UserService userService)
 {
 _userService = userService;
 }

 [HttpPost("register-employee")]
 public IActionResult RegisterEmployee(UserRegisterDTO dto)
 => Ok(new { message = _userService.RegisterEmployee(dto) });

 [HttpPost("register-manager")]
 public IActionResult RegisterManager(UserRegisterDTO dto)
 => Ok(new { message = _userService.RegisterManager(dto) });

 [HttpGet("verify")]
 public IActionResult Verify([FromQuery] string token)
 {
 if (string.IsNullOrEmpty(token)) return BadRequest("Token is missing");
 var result = _userService.VerifyUser(token);
 return Ok(result);
 }

 [HttpPost("login")]
 public IActionResult Login(UserLoginDTO dto)
 {
 var result = _userService.Login(dto);
 return Ok(result);
 }

 [HttpPost("forgot-password/validate-email")]
 public IActionResult ValidateForgotPasswordEmail(ForgotPasswordEmailDTO dto)
 {
 try
 {
 var result = _userService.ValidateForgotPasswordEmail(dto);
 return Ok(new { message = result });
 }
 catch (Exception ex)
 {
 return BadRequest(new { message = ex.Message });
 }
 }

 [HttpPost("forgot-password/reset")]
 public IActionResult ResetPassword(ResetPasswordDTO dto)
 {
 try
 {
 var result = _userService.ResetPassword(dto);
 return Ok(new { message = result });
 }
 catch (Exception ex)
 {
 return BadRequest(new { message = ex.Message });
 }
 }

 // Used by Angular ApiService.getDepartments()
 [HttpGet("departments")]
 public IActionResult GetDepartments()
 {
 var result = _userService.GetDepartments();
 return Ok(result);
 }

 // Used by Angular ApiService.getManagers()
 [HttpGet("managers")]
 public IActionResult GetManagers()
 {
 var result = _userService.GetManagers();
 return Ok(result);
 }
 }
}



