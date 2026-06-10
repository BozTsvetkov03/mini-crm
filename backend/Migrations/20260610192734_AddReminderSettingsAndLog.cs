using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderSettingsAndLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DigestHour",
                table: "UserSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "EmailRemindersEnabled",
                table: "UserSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "RemindDaysBefore",
                table: "UserSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TimeZone",
                table: "UserSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ReminderLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DigestDate = table.Column<DateOnly>(type: "date", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TaskCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReminderLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReminderLogs_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReminderLogs_UserId_DigestDate",
                table: "ReminderLogs",
                columns: new[] { "UserId", "DigestDate" },
                unique: true);

            // Data fix only (no schema change, snapshot unaffected): rows created
            // before this migration should get the same defaults new rows get from
            // the C# initializers. Reminders stay opt-in (EmailRemindersEnabled=false).
            migrationBuilder.Sql(
                """UPDATE "UserSettings" SET "RemindDaysBefore" = 3, "DigestHour" = 8, "TimeZone" = 'UTC';""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReminderLogs");

            migrationBuilder.DropColumn(
                name: "DigestHour",
                table: "UserSettings");

            migrationBuilder.DropColumn(
                name: "EmailRemindersEnabled",
                table: "UserSettings");

            migrationBuilder.DropColumn(
                name: "RemindDaysBefore",
                table: "UserSettings");

            migrationBuilder.DropColumn(
                name: "TimeZone",
                table: "UserSettings");
        }
    }
}
