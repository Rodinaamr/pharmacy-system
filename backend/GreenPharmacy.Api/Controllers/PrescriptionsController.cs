using Microsoft.AspNetCore.Mvc;
using GreenPharmacy.Api.Models;
using GreenPharmacy.Api.Repositories;
using GreenPharmacy.Api.Data;

namespace GreenPharmacy.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IRepository<Prescription> _repository;
        private readonly IRepository<Activity> _activityRepo;
        private readonly PharmacyContext _context;

        public PrescriptionsController(IRepository<Prescription> repository, IRepository<Activity> activityRepo, PharmacyContext context)
        {
            _repository = repository;
            _activityRepo = activityRepo;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Prescription>>> GetPrescriptions()
        {
            return Ok(await _repository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Prescription>> GetPrescription(string id)
        {
            var prescription = await _repository.GetByIdAsync(id);
            if (prescription == null) return NotFound();
            return Ok(prescription);
        }

        [HttpPost]
        public async Task<ActionResult<Prescription>> PostPrescription(Prescription prescription)
        {
            if (string.IsNullOrEmpty(prescription.Id)) prescription.Id = Guid.NewGuid().ToString();
            await _repository.AddAsync(prescription);
            
            // Advance System: Log the activity
            await _activityRepo.AddAsync(new Activity {
                Id = Guid.NewGuid().ToString(),
                Title = "New Prescription Intake",
                Description = $"New prescription processed for patient {prescription.PatientName}.",
                Color = "#3B82F6",
                Timestamp = DateTime.UtcNow
            });

            return CreatedAtAction("GetPrescription", new { id = prescription.Id }, prescription);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPrescription(string id, Prescription prescription)
        {
            if (id != prescription.Id) return BadRequest();
            prescription.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(prescription);
            return NoContent();
        }

        // Action: Approve
        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> ApprovePrescription(string id)
        {
            var prescription = await _repository.GetByIdAsync(id);
            if (prescription == null) return NotFound();

            prescription.Status = "approved";
            prescription.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(prescription);

            await _activityRepo.AddAsync(new Activity {
                Id = Guid.NewGuid().ToString(),
                Title = "Prescription Approved",
                Description = $"Doctor approved prescription {prescription.Id}.",
                Color = "#10B981", // Green
                Timestamp = DateTime.UtcNow
            });

            return Ok(prescription);
        }

        // Action: Dispense
        [HttpPatch("{id}/dispense")]
        public async Task<IActionResult> DispensePrescription(string id)
        {
            var prescription = await _repository.GetByIdAsync(id);
            if (prescription == null) return NotFound();

            if (prescription.Status == "dispensed") return BadRequest("Prescription already dispensed.");

            // Update prescription status
            prescription.Status = "dispensed";
            prescription.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(prescription);

            // Update stock
            if (!string.IsNullOrEmpty(prescription.MedicationId))
            {
                var med = await _context.Medications.FindAsync(prescription.MedicationId);
                if (med != null)
                {
                    // For now assuming quantity 1 as it's not in the model
                    med.StockQuantity = Math.Max(0, med.StockQuantity - 1);
                    if (med.StockQuantity == 0) med.Status = "out_of_stock";
                    else if (med.StockQuantity <= med.MinStockLevel) med.Status = "low_stock";
                    
                    await _context.SaveChangesAsync();
                }
            }

            await _activityRepo.AddAsync(new Activity {
                Id = Guid.NewGuid().ToString(),
                Title = "Prescription Dispensed",
                Description = $"Medication {prescription.MedicationName} dispensed to {prescription.PatientName}.",
                Color = "#3B82F6",
                Timestamp = DateTime.UtcNow
            });

            return Ok(prescription);
        }
        // Action: Reject
        [HttpPatch("{id}/reject")]
        public async Task<IActionResult> RejectPrescription(string id)
        {
            var prescription = await _repository.GetByIdAsync(id);
            if (prescription == null) return NotFound();

            prescription.Status = "rejected";
            prescription.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(prescription);

            await _activityRepo.AddAsync(new Activity {
                Id = Guid.NewGuid().ToString(),
                Title = "Prescription Rejected",
                Description = $"Clinical review failed for prescription {prescription.Id}.",
                Color = "#EF4444", // Red
                Timestamp = DateTime.UtcNow
            });

            return Ok(prescription);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);

            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{fileName}";
            return Ok(new { url = fileUrl });
        }
    }
}
