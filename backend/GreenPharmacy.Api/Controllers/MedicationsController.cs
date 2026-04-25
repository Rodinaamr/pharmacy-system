using GreenPharmacy.Api.Data;
using GreenPharmacy.Api.Models;
using GreenPharmacy.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GreenPharmacy.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicationsController : ControllerBase
    {
        private readonly IRepository<Medication> _repository;

        public MedicationsController(IRepository<Medication> repository)
        {
            _repository = repository;
        }

        // GET: api/Medications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Medication>>> GetMedications()
        {
            var medications = await _repository.GetAllAsync();
            return Ok(medications);
        }

        // GET: api/Medications/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Medication>> GetMedication(string id)
        {
            var medication = await _repository.GetByIdAsync(id);

            if (medication == null)
            {
                return NotFound();
            }

            return medication;
        }

        // PUT: api/Medications/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMedication(string id, Medication medication)
        {
            if (id != medication.Id)
            {
                return BadRequest();
            }

            try
            {
                await _repository.UpdateAsync(medication);
            }
            catch (Exception)
            {
                if (!await _repository.ExistsAsync(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Medications
        [HttpPost]
        public async Task<ActionResult<Medication>> PostMedication(Medication medication)
        {
            if (string.IsNullOrEmpty(medication.Id))
            {
                medication.Id = Guid.NewGuid().ToString();
            }
            
            await _repository.AddAsync(medication);

            return CreatedAtAction("GetMedication", new { id = medication.Id }, medication);
        }

        // DELETE: api/Medications/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedication(string id)
        {
            if (!await _repository.ExistsAsync(id))
            {
                return NotFound();
            }

            await _repository.DeleteAsync(id);

            return NoContent();
        }
    }
}
