using System.ComponentModel.DataAnnotations;

namespace GreenPharmacy.Api.Models
{
    public class Medication
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public int MinStockLevel { get; set; }
        public string Unit { get; set; } = "Units";
        public string ExpiryDate { get; set; } = string.Empty;
        public string BatchNumber { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Supplier { get; set; } = string.Empty;
        public string Status { get; set; } = "available"; // available, low_stock, out_of_stock
        public string ImageColor { get; set; } = "#E8F5E9";
    }
}
