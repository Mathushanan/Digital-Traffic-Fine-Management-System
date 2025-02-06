using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace backend.Models
{
    public class VehicleCategory
    {
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Description { get; set; }

        public ICollection<User_VehicleCategory>? User_VehicleCategories { get; set; }

    }
}
