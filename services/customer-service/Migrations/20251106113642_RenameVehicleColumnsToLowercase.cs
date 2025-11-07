using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class RenameVehicleColumnsToLowercase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Customers_CustomerIdFk",
                table: "Vehicles");

            migrationBuilder.RenameColumn(
                name: "VehicleType",
                table: "Vehicles",
                newName: "vehicletype");

            migrationBuilder.RenameColumn(
                name: "VehicleRegistrationYear",
                table: "Vehicles",
                newName: "vehicleregistrationyear");

            migrationBuilder.RenameColumn(
                name: "VehicleModelYear",
                table: "Vehicles",
                newName: "vehiclemodelyear");

            migrationBuilder.RenameColumn(
                name: "VehicleModel",
                table: "Vehicles",
                newName: "vehiclemodel");

            migrationBuilder.RenameColumn(
                name: "VehicleId",
                table: "Vehicles",
                newName: "vehicleid");

            migrationBuilder.RenameColumn(
                name: "VehicleBrand",
                table: "Vehicles",
                newName: "vehiclebrand");

            migrationBuilder.RenameColumn(
                name: "NoPlate",
                table: "Vehicles",
                newName: "noplate");

            migrationBuilder.RenameColumn(
                name: "Millage",
                table: "Vehicles",
                newName: "millage");

            migrationBuilder.RenameColumn(
                name: "LastServiceDate",
                table: "Vehicles",
                newName: "lastservicedate");

            migrationBuilder.RenameColumn(
                name: "CustomerName",
                table: "Vehicles",
                newName: "customername");

            migrationBuilder.RenameColumn(
                name: "CustomerIdFk",
                table: "Vehicles",
                newName: "customeridfk");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Vehicles",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "ChaseNo",
                table: "Vehicles",
                newName: "chaseno");

            migrationBuilder.RenameIndex(
                name: "IX_Vehicles_CustomerIdFk",
                table: "Vehicles",
                newName: "IX_Vehicles_customeridfk");

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Customers_customeridfk",
                table: "Vehicles",
                column: "customeridfk",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Customers_customeridfk",
                table: "Vehicles");

            migrationBuilder.RenameColumn(
                name: "vehicletype",
                table: "Vehicles",
                newName: "VehicleType");

            migrationBuilder.RenameColumn(
                name: "vehicleregistrationyear",
                table: "Vehicles",
                newName: "VehicleRegistrationYear");

            migrationBuilder.RenameColumn(
                name: "vehiclemodelyear",
                table: "Vehicles",
                newName: "VehicleModelYear");

            migrationBuilder.RenameColumn(
                name: "vehiclemodel",
                table: "Vehicles",
                newName: "VehicleModel");

            migrationBuilder.RenameColumn(
                name: "vehicleid",
                table: "Vehicles",
                newName: "VehicleId");

            migrationBuilder.RenameColumn(
                name: "vehiclebrand",
                table: "Vehicles",
                newName: "VehicleBrand");

            migrationBuilder.RenameColumn(
                name: "noplate",
                table: "Vehicles",
                newName: "NoPlate");

            migrationBuilder.RenameColumn(
                name: "millage",
                table: "Vehicles",
                newName: "Millage");

            migrationBuilder.RenameColumn(
                name: "lastservicedate",
                table: "Vehicles",
                newName: "LastServiceDate");

            migrationBuilder.RenameColumn(
                name: "customername",
                table: "Vehicles",
                newName: "CustomerName");

            migrationBuilder.RenameColumn(
                name: "customeridfk",
                table: "Vehicles",
                newName: "CustomerIdFk");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Vehicles",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "chaseno",
                table: "Vehicles",
                newName: "ChaseNo");

            migrationBuilder.RenameIndex(
                name: "IX_Vehicles_customeridfk",
                table: "Vehicles",
                newName: "IX_Vehicles_CustomerIdFk");

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Customers_CustomerIdFk",
                table: "Vehicles",
                column: "CustomerIdFk",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
