using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations.System
{
    /// <inheritdoc />
    public partial class V3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ViolationCategory",
                table: "TrafficViolations",
                newName: "SectionOfAct");

            migrationBuilder.AddColumn<string>(
                name: "Provision",
                table: "TrafficViolations",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Provision",
                table: "TrafficViolations");

            migrationBuilder.RenameColumn(
                name: "SectionOfAct",
                table: "TrafficViolations",
                newName: "ViolationCategory");
        }
    }
}
