using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerAndRefactorVehicles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "Vehicles");

            migrationBuilder.RenameColumn(
                name: "VehicleNo",
                table: "Vehicles",
                newName: "VehicleBrand");

            migrationBuilder.RenameColumn(
                name: "Mileage",
                table: "Vehicles",
                newName: "Millage");

            migrationBuilder.RenameColumn(
                name: "ChassisNo",
                table: "Vehicles",
                newName: "ChaseNo");

            migrationBuilder.RenameColumn(
                name: "Brand",
                table: "Vehicles",
                newName: "NoPlate");

            migrationBuilder.AlterColumn<string>(
                name: "VehicleId",
                table: "Vehicles",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "CustomerIdFk",
                table: "Vehicles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "VehicleModelYear",
                table: "Vehicles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VehicleRegistrationYear",
                table: "Vehicles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VehicleType",
                table: "Vehicles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AuthUserId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_CustomerIdFk",
                table: "Vehicles",
                column: "CustomerIdFk");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_VehicleId",
                table: "Vehicles",
                column: "VehicleId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_AuthUserId",
                table: "Customers",
                column: "AuthUserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Customers_CustomerIdFk",
                table: "Vehicles",
                column: "CustomerIdFk",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Customers_CustomerIdFk",
                table: "Vehicles");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_CustomerIdFk",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_VehicleId",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "CustomerIdFk",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "VehicleModelYear",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "VehicleRegistrationYear",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "VehicleType",
                table: "Vehicles");

            migrationBuilder.RenameColumn(
                name: "VehicleBrand",
                table: "Vehicles",
                newName: "VehicleNo");

            migrationBuilder.RenameColumn(
                name: "NoPlate",
                table: "Vehicles",
                newName: "Brand");

            migrationBuilder.RenameColumn(
                name: "Millage",
                table: "Vehicles",
                newName: "Mileage");

            migrationBuilder.RenameColumn(
                name: "ChaseNo",
                table: "Vehicles",
                newName: "ChassisNo");

            migrationBuilder.AlterColumn<string>(
                name: "VehicleId",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "CustomerId",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "Vehicles",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }
    }
}
