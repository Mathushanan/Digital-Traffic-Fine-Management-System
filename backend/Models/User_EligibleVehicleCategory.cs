using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Models
{
    public class User_EligibleVehicleCategory
    {
        public int	MappingId { get; set; }

        public int 	UserId { get; set; }
        public virtual User? User { get; set; }

        public int 	VehicleCategoryId { get; set; }
        public virtual EligibleVehicleCategory? EligibleVehicleCategory { get; set; }


    }
}
