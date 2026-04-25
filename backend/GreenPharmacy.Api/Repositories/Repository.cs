using GreenPharmacy.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace GreenPharmacy.Api.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly PharmacyContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(PharmacyContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<T?> GetByIdAsync(string id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public virtual async Task<bool> ExistsAsync(string id)
        {
            // Note: This assumes the entity has an Id property of type string.
            // For a truly generic repository, we might need a better way to check existence.
            var entity = await _dbSet.FindAsync(id);
            return entity != null;
        }
    }
}
