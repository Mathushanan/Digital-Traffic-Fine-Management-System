using Azure.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using backend.Models;
using backend.Interfaces;

namespace backend
{
    public class Functions
    {
        private readonly ILogger<Functions> _logger;
        private readonly IPasswordService _passwordService;
        private readonly IUserService _userService;

        public Functions(ILogger<Functions> logger, IPasswordService passwordService, IUserService userService)
        {
            _logger = logger;
            this._passwordService = passwordService;
            this._userService = userService;
        }

        [Function("RegisterSystemAdmin")]
        public async Task<IActionResult> RegisterSystemAdmin([HttpTrigger(AuthorizationLevel.Function, "post", Route = "register-system-admin")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                string? userType = req.Query["userType"];
                string? firstName = req.Query["firstName"];
                string? lastName = req.Query["lastName"];
                string? gender = req.Query["gender"];
                DateTime? dateOfBirth = DateTime.TryParse(req.Query["dateOfBirth"], out DateTime tempDateOfBirth) ? tempDateOfBirth : null;
                string? address = req.Query["address"];
                string? email = req.Query["email"];
                string? contactNumber = req.Query["contactNumber"];
                string? password = req.Query["password"];
                string? nicNumber = req.Query["nicNumber"];
                string? licenseNumber = req.Query["licenseNumber"];
                DateTime? licenseIssueDate = DateTime.TryParse(req.Query["licenseIssueDate"], out DateTime tempLicenseIssueDate) ? tempLicenseIssueDate : null;
                DateTime? licenseExpiryDate = DateTime.TryParse(req.Query["licenseExpiryDate"], out DateTime tempLicenseExpiryDate) ? tempLicenseExpiryDate : null;
                int badgeNumber = int.TryParse(req.Query["badgeNumber"], out int tempBadgeNumber) ? tempBadgeNumber : 0;

                var existingUser = await _userService.GetUserByParameters(email!, nicNumber!, licenseNumber!, badgeNumber.ToString());

                if (existingUser != null)
                {
                    return new ConflictObjectResult("System Admin already registered!");
                }
                else
                {
                    var newUser = new User
                    {
                        UserType = userType,
                        FirstName = firstName,
                        LastName = lastName,
                        Gender = gender,
                        DateOfBirth = dateOfBirth,
                        Address = address,
                        Email = email,
                        ContactNumber = contactNumber,
                        NicNumber = nicNumber,
                        LicenseNumber = licenseNumber,
                        LicenseIssueDate = licenseIssueDate,
                        LicenseExpiryDate = licenseExpiryDate,
                        BadgeNumber = badgeNumber
                    };

                    newUser.PasswordHash = _passwordService.HashPassword(newUser, password!);
                    await _userService.AddUserAsync(newUser);
                    return new OkObjectResult("System Admin registered successfully!");

                }

            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message)
                {
                    StatusCode = 500
                };
            }


        }
        [Function("Function2")]
        public async Task<IActionResult> AddUser([HttpTrigger(AuthorizationLevel.Function, "get", Route = "inventory/supplier")] HttpRequest req)
        {
            await Task.Delay(1000);
            _logger.LogInformation("function 2 triggered!.");
            return new OkObjectResult("Welcome to Azure Functions!");

        }
    }
}
