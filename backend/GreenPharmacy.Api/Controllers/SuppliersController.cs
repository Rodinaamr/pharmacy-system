using Microsoft.AspNetCore.Mvc;
using GreenPharmacy.Api.Models;
using GreenPharmacy.Api.Repositories;

namespace GreenPharmacy.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly IRepository<Supplier> _repository;

        public SuppliersController(IRepository<Supplier> repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers()
        {
            return Ok(await _repository.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Supplier>> GetSupplier(string id)
        {
            var supplier = await _repository.GetByIdAsync(id);
            if (supplier == null) return NotFound();
            return Ok(supplier);
        }

        [HttpPost]
        public async Task<ActionResult<Supplier>> PostSupplier(Supplier supplier)
        {
            if (string.IsNullOrEmpty(supplier.Id)) supplier.Id = Guid.NewGuid().ToString();
            await _repository.AddAsync(supplier);
            return CreatedAtAction("GetSupplier", new { id = supplier.Id }, supplier);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSupplier(string id, Supplier supplier)
        {
            if (id != supplier.Id) return BadRequest();
            await _repository.UpdateAsync(supplier);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(string id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
