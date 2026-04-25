using System.ComponentModel.DataAnnotations;

namespace GreenPharmacy.Api.Models
{
    public class Prescription
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string MedicationName { get; set; } = string.Empty;
        public string MedicationId { get; set; } = string.Empty;
        public string PrescribingDoctor { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = "pending"; // pending, approved, rejected, dispensed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string Clinic { get; set; } = string.Empty;
        public bool IsChronic { get; set; }
        public string? PrescriptionDocumentUrl { get; set; }
        public string? ImageUrl { get; set; }
    }
}
