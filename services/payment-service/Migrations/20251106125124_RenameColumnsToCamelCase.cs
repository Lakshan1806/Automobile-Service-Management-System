using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PaymentService.Migrations
{
    /// <inheritdoc />
    public partial class RenameColumnsToCamelCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Customers_customeridfk",
                table: "Vehicles");

            migrationBuilder.RenameColumn(
                name: "vehicletype",
                table: "Vehicles",
                newName: "vehicleType");

            migrationBuilder.RenameColumn(
                name: "vehicleregistrationyear",
                table: "Vehicles",
                newName: "vehicleRegistrationYear");

            migrationBuilder.RenameColumn(
                name: "vehiclemodelyear",
                table: "Vehicles",
                newName: "vehicleModelYear");

            migrationBuilder.RenameColumn(
                name: "vehiclemodel",
                table: "Vehicles",
                newName: "vehicleModel");

            migrationBuilder.RenameColumn(
                name: "vehicleid",
                table: "Vehicles",
                newName: "vehicleId");

            migrationBuilder.RenameColumn(
                name: "vehiclebrand",
                table: "Vehicles",
                newName: "vehicleBrand");

            migrationBuilder.RenameColumn(
                name: "noplate",
                table: "Vehicles",
                newName: "noPlate");

            migrationBuilder.RenameColumn(
                name: "lastservicedate",
                table: "Vehicles",
                newName: "lastServiceDate");

            migrationBuilder.RenameColumn(
                name: "customername",
                table: "Vehicles",
                newName: "customerName");

            migrationBuilder.RenameColumn(
                name: "customeridfk",
                table: "Vehicles",
                newName: "customerIdFk");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Vehicles",
                newName: "createdAt");

            migrationBuilder.RenameColumn(
                name: "chaseno",
                table: "Vehicles",
                newName: "chaseNo");

            migrationBuilder.RenameIndex(
                name: "IX_Vehicles_customeridfk",
                table: "Vehicles",
                newName: "IX_Vehicles_customerIdFk");

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_Customers_customerIdFk",
                table: "Vehicles",
                column: "customerIdFk",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_Customers_customerIdFk",
                table: "Vehicles");

            migrationBuilder.RenameColumn(
                name: "vehicleType",
                table: "Vehicles",
                newName: "vehicletype");

            migrationBuilder.RenameColumn(
                name: "vehicleRegistrationYear",
                table: "Vehicles",
                newName: "vehicleregistrationyear");

            migrationBuilder.RenameColumn(
                name: "vehicleModelYear",
                table: "Vehicles",
                newName: "vehiclemodelyear");

            migrationBuilder.RenameColumn(
                name: "vehicleModel",
                table: "Vehicles",
                newName: "vehiclemodel");

            migrationBuilder.RenameColumn(
                name: "vehicleId",
                table: "Vehicles",
                newName: "vehicleid");

            migrationBuilder.RenameColumn(
                name: "vehicleBrand",
                table: "Vehicles",
                newName: "vehiclebrand");

            migrationBuilder.RenameColumn(
                name: "noPlate",
                table: "Vehicles",
                newName: "noplate");

            migrationBuilder.RenameColumn(
                name: "lastServiceDate",
                table: "Vehicles",
                newName: "lastservicedate");

            migrationBuilder.RenameColumn(
                name: "customerName",
                table: "Vehicles",
                newName: "customername");

            migrationBuilder.RenameColumn(
                name: "customerIdFk",
                table: "Vehicles",
                newName: "customeridfk");

            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "Vehicles",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "chaseNo",
                table: "Vehicles",
                newName: "chaseno");

            migrationBuilder.RenameIndex(
                name: "IX_Vehicles_customerIdFk",
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
    }
}
