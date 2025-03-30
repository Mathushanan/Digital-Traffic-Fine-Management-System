using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface ILicenseHolderService
    {
        Task<LicenseHolder?> GetLicenseHolderByLicenseNumberAsync(string licenseNumber);
        Task<LicenseHolder?> GetPublicUserByNicLicenseNumberAsync(string nicNumber, string licenseNumber);
    }
}
