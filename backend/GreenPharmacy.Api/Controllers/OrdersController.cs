using Microsoft.AspNetCore.Mvc;
using GreenPharmacy.Api.Models;
using GreenPharmacy.Api.Repositories;
using GreenPharmacy.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace GreenPharmacy.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IRepository<Order> _repository;
        private readonly PharmacyContext _context;

        public OrdersController(IRepository<Order> repository, PharmacyContext context)
        {
            _repository = repository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return Ok(await _context.Orders.Include(o => o.Medications).ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(string id)
        {
            var order = await _context.Orders.Include(o => o.Medications).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            if (string.IsNullOrEmpty(order.Id)) order.Id = Guid.NewGuid().ToString();
            order.CreatedAt = DateTime.UtcNow;
            
            // Link items to the order
            foreach (var item in order.Medications)
            {
                item.OrderId = order.Id;
            }
            
            await _repository.AddAsync(order);
            return CreatedAtAction("GetOrder", new { id = order.Id }, order);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(string id, [FromBody] System.Text.Json.JsonElement update)
        {
            Console.WriteLine($"[DEBUG] Received PutOrder for ID: {id}");
            var existingOrder = await _context.Orders.Include(o => o.Medications).FirstOrDefaultAsync(o => o.Id == id);
            if (existingOrder == null) 
            {
                Console.WriteLine($"[DEBUG] Order with ID {id} not found.");
                return NotFound();
            }

            if (update.ValueKind == System.Text.Json.JsonValueKind.Object)
            {
                if (update.TryGetProperty("status", out var statusProp))
                {
                    var newStatus = statusProp.GetString();
                    var oldStatus = existingOrder.Status;
                    
                    Console.WriteLine($"[DEBUG] Updating status for Order {id} from '{oldStatus}' to '{newStatus}'");
                    
                    if (newStatus == "completed" && oldStatus != "completed")
                    {
                        Console.WriteLine($"[DEBUG] Order {id} marked as completed. Updating inventory stock...");
                        foreach (var item in existingOrder.Medications)
                        {
                            var med = await _context.Medications.FindAsync(item.MedicationId);
                            if (med != null)
                            {
                                Console.WriteLine($"[DEBUG] Increasing stock for {med.Name} by {item.Quantity}. Old: {med.StockQuantity}");
                                med.StockQuantity += item.Quantity;
                                
                                // Automatic status update based on new stock level
                                if (med.StockQuantity > med.MinStockLevel)
                                {
                                    med.Status = "available";
                                }
                                else if (med.StockQuantity > 0)
                                {
                                    med.Status = "low_stock";
                                }
                            }
                            else
                            {
                                Console.WriteLine($"[DEBUG] Medication {item.MedicationId} not found for stock update.");
                            }
                        }
                    }
                    
                    existingOrder.Status = newStatus ?? existingOrder.Status;
                }
                else 
                {
                    Console.WriteLine("[DEBUG] Payload does not contain 'status' property.");
                }
            }
            else 
            {
                Console.WriteLine($"[DEBUG] Received invalid payload type: {update.ValueKind}");
            }
            
            await _context.SaveChangesAsync();
            return Ok(existingOrder);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(string id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
