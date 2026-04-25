using GreenPharmacy.Api.Data;
using GreenPharmacy.Api.Models;

namespace GreenPharmacy.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(PharmacyContext context)
        {
            context.Database.EnsureCreated();

            if (context.Medications.Any())
            {
                return;   // DB has been seeded
            }

            var medications = new Medication[]
            {
                new Medication { Name = "Amoxicillin", Category = "Tablets", StockQuantity = 150, MinStockLevel = 20, Price = 45.50m, Status = "available", ExpiryDate = "2025-12-01" },
                new Medication { Name = "Panadol", Category = "Tablets", StockQuantity = 500, MinStockLevel = 50, Price = 15.00m, Status = "available", ExpiryDate = "2026-06-15" },
                new Medication { Name = "Insulin", Category = "Injections", StockQuantity = 5, MinStockLevel = 10, Price = 320.00m, Status = "low_stock", ExpiryDate = "2025-08-20" }
            };

            context.Medications.AddRange(medications);
            
            var user = new User
            {
                Name = "Dr. Sarah Ahmed",
                Role = "pharmacist",
                Email = "sarah.a@greenpharmacy.com",
                Phone = "+20 123 456 789",
                Shift = "Morning (08:00 - 16:00)",
                LicenseNumber = "PH-987654"
            };
            context.Users.Add(user);

            context.SaveChanges();
        }
    }
}
