namespace GreenPharmacy.Api.Models
{
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "pharmacist"; // pharmacist, manager, admin
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string Shift { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
    }
}
