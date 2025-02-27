﻿using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface ILicenseHolderService
    {
        Task<LicenseHolder?> GetLicenseHolderByLicenseNumber(string licenseNumber);
    }
}
