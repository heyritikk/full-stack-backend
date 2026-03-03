using InternalBudgetTracker.Data;
using InternalBudgetTracker.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// --- 1. THE "ALLOW EVERYTHING" CORS POLICY ---
builder.Services.AddCors(options =>
{
 options.AddPolicy("OpenPolicy", policy =>
 {
 policy.AllowAnyOrigin() // This allows ANY frontend to connect
 .AllowAnyHeader()
 .AllowAnyMethod();
 });
});
// ----------------------------------------------

builder.Services.AddControllers();

builder.Services.AddAuthentication(options =>
{
 options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
 options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
 options.TokenValidationParameters = new TokenValidationParameters
 {
 ValidateIssuer = false,
 ValidateAudience = false,
 ValidateLifetime = true,
 ValidateIssuerSigningKey = true,
 NameClaimType = ClaimTypes.Name,
 RoleClaimType = ClaimTypes.Role,
 IssuerSigningKey = new SymmetricSecurityKey(
 Encoding.UTF8.GetBytes(builder.Configuration["Security:SecretKey"] ?? "KJH@98sdF#23!dkL09@#Lksj$%23Fsd!@#")
 )
 };
});

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options => 
 options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<HelperService>();
builder.Services.AddScoped<BudgetService>();
builder.Services.AddScoped<ExpenseService>();
builder.Services.AddScoped<NotificationService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
 app.UseSwagger();
 app.UseSwaggerUI();
}

// --- 2. THE ORDER IS CRITICAL ---
 // Must be BEFORE Auth and Controllers

// Comment this out to stay on http://localhost:5078
// app.UseHttpsRedirection(); 

app.UseAuthentication();
app.UseCors("OpenPolicy");
app.UseAuthorization();
app.MapControllers();



app.Run();
