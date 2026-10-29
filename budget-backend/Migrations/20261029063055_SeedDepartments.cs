using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternalBudgetTracker.Migrations
{
    /// <inheritdoc />
    public partial class SeedDepartments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotent: databases where departments were inserted by hand keep working.
            migrationBuilder.Sql(@"
SET IDENTITY_INSERT t_Department ON;
IF NOT EXISTS (SELECT 1 FROM t_Department WHERE DepartmentId = 1) INSERT INTO t_Department (DepartmentId, DepartmentName) VALUES (1, 'IT');
IF NOT EXISTS (SELECT 1 FROM t_Department WHERE DepartmentId = 2) INSERT INTO t_Department (DepartmentId, DepartmentName) VALUES (2, 'HR');
IF NOT EXISTS (SELECT 1 FROM t_Department WHERE DepartmentId = 3) INSERT INTO t_Department (DepartmentId, DepartmentName) VALUES (3, 'Finance');
SET IDENTITY_INSERT t_Department OFF;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rows are left in place: users may already reference them.
        }
    }
}
