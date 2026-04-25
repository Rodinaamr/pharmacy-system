using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GreenPharmacy.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPrescriptionImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RefillDueDate",
                table: "Prescriptions",
                newName: "PrescriptionDocumentUrl");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Prescriptions",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Prescriptions");

            migrationBuilder.RenameColumn(
                name: "PrescriptionDocumentUrl",
                table: "Prescriptions",
                newName: "RefillDueDate");
        }
    }
}
