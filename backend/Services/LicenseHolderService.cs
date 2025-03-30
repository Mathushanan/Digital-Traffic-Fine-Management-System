using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Interfaces;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class LicenseHolderService:ILicenseHolderService
    {
        private readonly LicenseHolderDbContext _licenseHolderDbContext;

        public LicenseHolderService(LicenseHolderDbContext licenseHolderDbContext)
        {
            this._licenseHolderDbContext = licenseHolderDbContext;
        }
        public async Task<LicenseHolder?> GetLicenseHolderByLicenseNumberAsync(string licenseNumber)
        {

            return await _licenseHolderDbContext.LicenseHolders
                .Where(licenceHolder => licenceHolder.LicenseNumber == licenseNumber)
                .SingleOrDefaultAsync();
        }
        public async Task<LicenseHolder?> GetPublicUserByNicLicenseNumberAsync(string nicNumber, string licenseNumber)
        {
            return await _licenseHolderDbContext.LicenseHolders
                .Where(licenseHolder =>
                               licenseHolder.NicNumber == nicNumber &&
                               licenseHolder.LicenseNumber == licenseNumber)
                .FirstOrDefaultAsync();

        }
    }
}
