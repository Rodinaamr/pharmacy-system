using System.ComponentModel.DataAnnotations;

namespace GreenPharmacy.Api.Models
{
    public class Order
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SupplierName { get; set; } = string.Empty;
        public List<OrderItem> Medications { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "pending"; // pending, approved, rejected, completed, cancelled
        public string ExpectedDelivery { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Notes { get; set; } = string.Empty;
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public string MedicationId { get; set; } = string.Empty;
        public string MedicationName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        
        // Foreign Key
        public string OrderId { get; set; } = string.Empty;
    }
}
