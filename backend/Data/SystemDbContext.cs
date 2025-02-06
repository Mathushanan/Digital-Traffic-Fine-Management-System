using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Data
{
    public class SystemDbContext:DbContext
    {
        public SystemDbContext(DbContextOptions<SystemDbContext> options):base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Audit>(entity =>
            {

            });
        }
            }
}
