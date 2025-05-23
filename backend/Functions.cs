﻿using Azure.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using backend.Models;
using backend.Interfaces;
using Newtonsoft.Json;
using backend.Dtos;
using backend.Services;
using Newtonsoft.Json.Linq;
using System.Runtime.InteropServices;
using System.Text.Json;
using Microsoft.VisualBasic;
using Grpc.Core;
using Stripe.Checkout;
using Stripe;
using System.Globalization;

namespace backend
{
    public class Functions
    {
        private readonly ILogger<Functions> _logger;
        private readonly IPasswordService _passwordService;
        private readonly IUserService _userService;
        private readonly IJwtService _jwtService;
        private readonly IStationService _stationService;
        private readonly ITrafficPoliceService _trafficPoliceService;
        private readonly ILicenseHolderService _licenseHolderService;
        private readonly ITrafficViolationService _trafficViolationService;
        private readonly INotificationService _notificationService;
        private readonly IAuditService _auditService;
        private readonly IUserEligibleVehicleCategoryService _userEligibleVehicleCategoryService;
        private readonly IVehicleRegistrationService _vehicleRegistrationService;
        private readonly ICourtService _courtService;
        private readonly IFineService _fineService;
        private readonly IPaymentService _paymentService;
        private readonly IDisputeService _disputeService;

        public Functions(ILogger<Functions> logger, IPasswordService passwordService, IUserService userService, IJwtService jwtService, IStationService stationService, ITrafficPoliceService trafficPoliceService, ILicenseHolderService licenseHolderService, ITrafficViolationService trafficViolationService, INotificationService notificationService, IAuditService auditService, IUserEligibleVehicleCategoryService userEligibleVehicleCategory, IVehicleRegistrationService vehicleRegistrationService, ICourtService courtService, IFineService fineService, IPaymentService paymentService, IDisputeService disputeService)
        {
            _logger = logger;
            this._passwordService = passwordService;
            this._userService = userService;
            this._jwtService = jwtService;
            this._stationService = stationService;
            this._trafficPoliceService = trafficPoliceService;
            this._licenseHolderService = licenseHolderService;
            this._trafficViolationService = trafficViolationService;
            this._notificationService = notificationService;
            this._auditService = auditService;
            this._userEligibleVehicleCategoryService = userEligibleVehicleCategory;
            this._vehicleRegistrationService = vehicleRegistrationService;
            this._courtService = courtService;
            this._fineService = fineService;
            this._paymentService = paymentService;
            this._disputeService = disputeService;
        }

        [Function("RegisterSystemAdmin")]
        public async Task<IActionResult> RegisterSystemAdmin([HttpTrigger(AuthorizationLevel.Function, "post", Route = "register-system-admin")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body.");
                        }

                        //Accessing deserialized parameters
                        string? userType = data.UserType;
                        string? firstName = data.FirstName;
                        string? lastName = data.LastName;
                        string? gender = data.Gender;
                        DateTime? dateOfBirth = data.DateOfBirth;
                        string? address = data.Address;
                        string? email = data.Email;
                        string? contactNumber = data.ContactNumber;
                        string? password = data.Password;
                        string? nicNumber = data.NicNumber;
                        string? licenseNumber = data.LicenseNumber;
                        DateTime? licenseIssueDate = data.LicenseIssueDate;
                        DateTime? licenseExpiryDate = data.LicenseExpiryDate;
                        int? badgeNumber = data.BadgeNumber;
                        int registeredStationId = data.RegisteredStationId;

                        if (firstName == null || lastName == null || gender == null || dateOfBirth == null || address == null || contactNumber == null || password == null || licenseIssueDate == null || licenseExpiryDate == null || email == null || nicNumber == null || licenseNumber == null || badgeNumber == null || userType == null || userType != "SystemAdmin")
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing/User type is wrong!");
                        }
                        else
                        {
                            var existingUser = await _userService.GetUserByParametersAsync(email!, nicNumber!, licenseNumber!, badgeNumber ?? 0);

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
                                    BadgeNumber = badgeNumber,
                                };

                                newUser.PasswordHash = _passwordService.HashPassword(newUser, password!);
                                await _userService.AddUserAsync(newUser);
                                return new OkObjectResult("System Admin registered successfully!");

                            }

                        }

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("Login")]
        public async Task<IActionResult> Login([HttpTrigger(AuthorizationLevel.Function, "post", Route = "login")] HttpRequest req)
        {
            // Read and deserialize the JSON request body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);

            if (data == null)
            {
                return new BadRequestObjectResult("Invalid JSON request body!");
            }

            //Accessing deserialized parameters
            string? email = data.Email;
            string? password = data.Password;

            var existingUser = await _userService.GetUserByEmailAsync(email!);
            if (existingUser == null)
            {
                return new NotFoundObjectResult("User not registered yet!");
            }
            else
            {
                if (_passwordService.VerifyPassword(existingUser, password!))
                {
                    var jwt = _jwtService.GenerateJwtToken(existingUser);
                    return new OkObjectResult(new
                    {
                        Message = "Login successful!",
                        Token = jwt
                    });
                }
                else
                {
                    return new BadRequestObjectResult("Invalid password!");
                }
            }


        }

        [Function("RegisterStation")]
        public async Task<IActionResult> RegisterStation([HttpTrigger(AuthorizationLevel.Function, "post", Route = "register-station")] HttpRequest req)
        {
            try
            {

                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<StationRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body!");
                        }

                        //Accessing deserialized parameters
                        string? stationCode = data.StationCode;
                        string? stationName = data.StationName;
                        string? address = data.Address;
                        string? district = data.District;
                        string? contactNumber = data.ContactNumber;
                        string? email = data.Email;


                        if (stationCode == null || stationName == null || address == null || district == null || contactNumber == null || email == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing!");
                        }
                        else
                        {

                            var existingStation = await _stationService.GetStationByParametersAsync(stationCode!, stationName!, contactNumber!, email!);
                            if (existingStation != null)
                            {
                                return new ConflictObjectResult("Station already registered with provided parameters!");
                            }
                            else
                            {

                                var newStation = new Station
                                {
                                    StationCode = stationCode,
                                    StationName = stationName,
                                    Address = address,
                                    District = district,
                                    ContactNumber = contactNumber,
                                    Email = email,

                                };
                                int stationId = await _stationService.AddStationAsync(newStation);

                                //add audit log
                                if (stationId > 0)
                                {
                                    string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                    User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                    // Capture additional audit details
                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "register-station",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);

                                    return new OkObjectResult("Station registered successfully!");
                                }
                                else
                                {
                                    return new BadRequestObjectResult("Failed to register the station!");
                                }


                            }



                        }

                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("GetAllStations")]
        public async Task<IActionResult> GetAllStations([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-all-stations")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        var stations = await _stationService.GetAllStationsAsync();

                        var stationsDto = stations.Select(station => new StationResponseDto
                        {
                            StationId = station.StationId,
                            StationCode = station.StationCode,
                            StationName = station.StationName,
                            Address = station.Address,
                            District = station.District,
                            ContactNumber = station.ContactNumber,
                            Email = station.Email,
                            AdminId = station.StationAdminId,
                            AdminFirstName = station.Users?.FirstOrDefault(u => u.UserId == station.StationAdminId)?.FirstName,
                            AdminBadgeNumber = station.Users?.FirstOrDefault(u => u.UserId == station.StationAdminId)?.BadgeNumber,
                            AdminEmail = station.Users?.FirstOrDefault(u => u.UserId == station.StationAdminId)?.Email,
                            AdminContactNumber = station.Users?.FirstOrDefault(u => u.UserId == station.StationAdminId)?.ContactNumber

                        }).ToList();


                        if (stationsDto != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-all-stations",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(stationsDto);
                        }
                        else
                        {
                            return new BadRequestObjectResult("User is not authorized for this action!");

                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("UpdateStation")]
        public async Task<IActionResult> UpdateStation([HttpTrigger(AuthorizationLevel.Function, "put", Route = "update-station")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<StationRequestDto>(requestBody);

                        if (data == null || data.StationCode == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body! StationId is required.");
                        }

                        // Accessing deserialized parameters
                        string? stationCode = data.StationCode;
                        string? stationName = data.StationName;
                        string? address = data.Address;
                        string? district = data.District;
                        string? contactNumber = data.ContactNumber;
                        string? email = data.Email;
                        int? stationAdminBadgeNumber = data.StationAdminBadgeNumber;

                        // Check if the station exists
                        var existingStation = await _stationService.GetStationByCodeAsync(stationCode);
                        if (existingStation == null)
                        {
                            return new NotFoundObjectResult("Station not found!");
                        }

                        // If a new StationAdminBadgeNumber is provided, verify its validity
                        if (stationAdminBadgeNumber.HasValue)
                        {
                            var isValidStationAdmin = await _userService.GetStationAdminByBadgeNumberAsync(stationAdminBadgeNumber.Value);
                            if (isValidStationAdmin == null)
                            {
                                return new BadRequestObjectResult("Station Admin not registered yet!");
                            }
                            else
                            {
                                var stationWithRegisteredSationAdmin = await _stationService.GetStationByStationAdminIdAsync(isValidStationAdmin.UserId);
                                if (stationWithRegisteredSationAdmin?.StationCode != stationCode)
                                {
                                    return new ConflictObjectResult("User already registered as Station Admin with other station!");
                                }
                                existingStation.StationAdminId = isValidStationAdmin.UserId;
                                var isUpdated = await _userService.UpdateStationAdminRegisteredStaionIdAsync(isValidStationAdmin.UserId, existingStation.StationId);
                                if (isUpdated == null)
                                {
                                    return new BadRequestObjectResult("Failed to update the station admin's registered station!");
                                }
                            }

                        }

                        // Update station details if provided
                        existingStation.StationCode = stationCode ?? existingStation.StationCode;
                        existingStation.StationName = stationName ?? existingStation.StationName;
                        existingStation.Address = address ?? existingStation.Address;
                        existingStation.District = district ?? existingStation.District;
                        existingStation.ContactNumber = contactNumber ?? existingStation.ContactNumber;
                        existingStation.Email = email ?? existingStation.Email;

                        // Update station in the database
                        var updateResult = await _stationService.UpdateStationAsync(existingStation);
                        if (!updateResult)
                        {
                            return new BadRequestObjectResult("Failed to update the station!");
                        }
                        else
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "update-station",
                                RequestType = "PUT",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = requestBody,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult("Station updated successfully!");
                        }



                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("DeleteStation")]
        public async Task<IActionResult> DeleteStation([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "delete-station")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        string stationCode = data?.stationCode!;

                        if (string.IsNullOrWhiteSpace(stationCode))
                        {
                            return new BadRequestObjectResult("Station code is required in the request body!");
                        }

                        var existingStation = await _stationService.GetStationByCodeAsync(stationCode);
                        if (existingStation == null)
                        {
                            return new NotFoundObjectResult("Station not found!");
                        }
                        if (existingStation.StationAdminId != null)
                        {
                            var isUpdated = await _userService.SetRegisteredStationIdToNull(existingStation.StationAdminId!.Value);
                            if (!isUpdated)
                            {
                                return new BadRequestObjectResult("Failed to delete the station!");
                            }
                            else
                            {
                                bool isDeleted = await _stationService.DeleteStationAsync(existingStation);
                                if (!isDeleted)
                                {
                                    return new StatusCodeResult(StatusCodes.Status500InternalServerError);
                                }
                                else
                                {
                                    string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                    User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                    // Capture additional audit details
                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "delete-station",
                                        RequestType = "DELETE",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);
                                    return new OkObjectResult("Station deleted successfully!");
                                }


                            }


                        }
                        else
                        {
                            bool isDeleted = await _stationService.DeleteStationAsync(existingStation);
                            if (!isDeleted)
                            {
                                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
                            }
                            else
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                // Capture additional audit details
                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "delete-station",
                                    RequestType = "DELETE",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = requestBody,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);
                                return new OkObjectResult("Station deleted successfully!");

                            }



                        }

                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("SearchTrafficPolice")]
        public async Task<IActionResult> SearchTrafficPolice([HttpTrigger(AuthorizationLevel.Function, "post", Route = "search-traffic-police")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin" || userRole == "StationAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);
                        string nicNumber = data?.NicNumber!;
                        int? badgeNumber = data?.BadgeNumber;

                        if (string.IsNullOrWhiteSpace(nicNumber) || badgeNumber == null)
                        {
                            return new BadRequestObjectResult("Nic number & Badge number are required in the request body!");
                        }

                        var existingTrafficPolice = await _trafficPoliceService.GetTrafficPoliceByNicBadgeNumberAsync(nicNumber, badgeNumber.Value);
                        if (existingTrafficPolice == null)
                        {
                            return new NotFoundObjectResult("Traffic Police not found!");
                        }
                        else
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "search-traffic-police",
                                RequestType = "POST",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = requestBody,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(existingTrafficPolice);
                        }

                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("RegisterStationAdmin")]
        public async Task<IActionResult> RegisterStationAdmin([HttpTrigger(AuthorizationLevel.Function, "post", Route = "register-station-admin")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body.");
                        }

                        //Accessing deserialized parameters
                        string? firstName = data.FirstName;
                        string? lastName = data.LastName;
                        string? address = data.Address;
                        string? email = data.Email;
                        string? contactNumber = data.ContactNumber;
                        string? gender = data.Gender;
                        DateTime? dateOfBirth = data.DateOfBirth;


                        string? stationCode = data.StationCode;

                        string? password = data.Password;

                        string? nicNumber = data.NicNumber;
                        int? badgeNumber = data.BadgeNumber;






                        string? licenseNumber = data.LicenseNumber;

                        var licenseHolder = await _licenseHolderService.GetLicenseHolderByLicenseNumberAsync(licenseNumber!);

                        if (licenseHolder == null)
                        {
                            return new NotFoundObjectResult("Station admin details are not valid!");
                        }
                        DateTime? licenseIssueDate = licenseHolder.IssueDate;
                        DateTime? licenseExpiryDate = licenseHolder.ExpiryDate;


                        string? userType = "StationAdmin";


                        if (firstName == null || lastName == null || gender == null || dateOfBirth == null || address == null || contactNumber == null || password == null || licenseIssueDate == null || licenseExpiryDate == null || email == null || nicNumber == null || licenseNumber == null || badgeNumber == null || userType == null || userType != "StationAdmin")
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing/User type is wrong!");
                        }
                        else
                        {
                            var existingUser = await _userService.GetUserByParametersAsync(email!, nicNumber!, licenseNumber!, badgeNumber ?? 0);
                            var newStation = await _stationService.GetStationByCodeAsync(stationCode!);

                            if (newStation!.StationAdminId != null)
                            {
                                return new ConflictObjectResult("Station Admin already assigned for this station. Try after remove him/her!");
                            }
                            if (existingUser != null)
                            {
                                return new ConflictObjectResult("Station Admin already registered with provided credentials!");
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
                                    BadgeNumber = badgeNumber,

                                };

                                newUser.PasswordHash = _passwordService.HashPassword(newUser, password!);
                                var userId = await _userService.AddUserAsync(newUser);

                                if (userId > 0)
                                {
                                    var stationWithRegisteredSationAdmin = await _stationService.GetStationByStationAdminIdAsync(userId);
                                    if (stationWithRegisteredSationAdmin != null)
                                    {
                                        var isDeleted = await _userService.DeleteUserByUserIdAsync(userId);
                                        return new ConflictObjectResult("User already registered as Station Admin with other station!");
                                    }
                                    else
                                    {
                                        var updatedStation = await _stationService.UpdateStationAdminIdAsync(newStation.StationId, userId);
                                        var updatedUser = await _userService.UpdateStationAdminRegisteredStaionIdAsync(userId, newStation.StationId);
                                        if (updatedStation == null || updatedUser == null)
                                        {
                                            return new BadRequestObjectResult("Failed to register the Station Admin!");
                                        }
                                        else
                                        {
                                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                            // Capture additional audit details
                                            var auditEntry = new Audit
                                            {
                                                UserId = user!.UserId,
                                                ApiEndPoint = "register-station-admin",
                                                RequestType = "POST",
                                                TimeStamp = DateTime.UtcNow,
                                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                                RequestBody = requestBody,
                                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                                UserAgent = req.Headers["User-Agent"].ToString()
                                            };
                                            await _auditService.LogAuditAsync(auditEntry);
                                            return new OkObjectResult("Station Admin registered successfully!");
                                        }
                                    }
                                }
                                else
                                {
                                    return new BadRequestObjectResult("Failed to register the Station Admin!");
                                }


                            }

                        }

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetAllStationAdmins")]
        public async Task<IActionResult> GetAllStationAdmins([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-all-station-admins")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        var stationAdmins = await _userService.GetAllStationAdminsAsync();

                        var stationAdminDtos = stationAdmins.Select(stationAdmin => new UserResponseDto
                        {
                            UserId = stationAdmin.UserId,
                            FirstName = stationAdmin.FirstName,
                            LastName = stationAdmin.LastName,
                            Gender = stationAdmin.Gender,
                            DateOfBirth = stationAdmin.DateOfBirth,
                            Address = stationAdmin.Address,
                            Email = stationAdmin.Email,
                            ContactNumber = stationAdmin.ContactNumber,
                            NicNumber = stationAdmin.NicNumber,
                            LicenseNumber = stationAdmin.LicenseNumber,
                            LicenseIssueDate = stationAdmin.LicenseIssueDate,
                            LicenseExpiryDate = stationAdmin.LicenseExpiryDate,
                            AvailablePoints = stationAdmin.AvailablePoints,
                            BadgeNumber = stationAdmin.BadgeNumber,
                            RegisteredStationId = stationAdmin.RegisteredStation!.StationId,
                            RegisteredStationDistrict = stationAdmin.RegisteredStation!.District,
                            RegisteredStationName = stationAdmin.RegisteredStation!.StationName,
                            UserType = stationAdmin.UserType
                        }).ToList();

                        if (stationAdminDtos != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-all-stations",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(stationAdminDtos);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No station admins found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("DeleteUser")]
        public async Task<IActionResult> DeleteUser([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "delete-user")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin" || userRole == "StationAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        int userId = data?.userId!;

                        if (userId <= 0)
                        {
                            return new BadRequestObjectResult("Station admin id is required in the request body!");
                        }

                        var existingUser = await _userService.GetUserByUserIdAsync(userId);
                        if (existingUser == null)
                        {
                            return new NotFoundObjectResult("User not found!");
                        }
                        if (existingUser.UserType == "StationAdmin")
                        {
                            var isUpdated = await _stationService.UpdateStationAdminIdAsync(existingUser.RegisteredStationId!.Value, 0);
                            if (isUpdated == null)
                            {
                                return new BadRequestObjectResult("Failed to update the registered station admin id!");
                            }
                            else
                            {
                                bool isDeleted = await _userService.DeleteUserAsync(existingUser.UserId);
                                if (!isDeleted)
                                {
                                    return new BadRequestObjectResult("Failed to delete the user!");
                                }
                                else
                                {
                                    string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                    User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                    // Capture additional audit details
                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "delete-user",
                                        RequestType = "DELETE",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = null,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);
                                    return new OkObjectResult("User deleted successfully!");

                                }

                            }
                        }
                        else if (existingUser.UserType == "TrafficPolice" || existingUser.UserType == "PublicUser")
                        {

                            bool isDeleted = await _userService.DeleteUserAsync(existingUser.UserId);
                            if (!isDeleted)
                            {
                                return new BadRequestObjectResult("Failed to delete the user!");
                            }
                            else
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                // Capture additional audit details
                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "delete-user",
                                    RequestType = "DELETE",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = null,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);
                                return new OkObjectResult("User deleted successfully!");

                            }



                        }
                        else
                        {
                            return new BadRequestObjectResult("Failed to delete the user!");

                        }
                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("UpdateUser")]
        public async Task<IActionResult> UpdateUser([HttpTrigger(AuthorizationLevel.Function, "put", Route = "update-user")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin" || userRole == "StationAdmin" || userRole == "PublicUser")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body!");
                        }

                        // Accessing deserialized parameters
                        int userId = data.UserId;
                        string? address = data.Address;
                        string? contactNumber = data.ContactNumber;
                        string? email = data.Email;
                        string? password = data.Password;




                        // Check if the station exists
                        var existingUser = await _userService.GetUserByUserIdAsync(userId);
                        if (existingUser == null)
                        {
                            return new NotFoundObjectResult("User not found!");
                        }

                        if (existingUser.UserType == "StationAdmin" || existingUser.UserType == "TrafficPolice")
                        {
                            // Update user details if provided
                            existingUser.Address = address ?? existingUser.Address;
                            existingUser.ContactNumber = contactNumber ?? existingUser.ContactNumber;
                            existingUser.Email = email ?? existingUser.Email;




                            // Update user in the database
                            var updateResult = await _userService.UpdateUserAsync(existingUser);
                            if (!updateResult)
                            {
                                return new BadRequestObjectResult("Failed to update the user!");
                            }
                            else
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                // Capture additional audit details
                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "update-user",
                                    RequestType = "PUT",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = null,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);
                                return new OkObjectResult("User updated successfully!");
                            }


                        }
                        else if (existingUser.UserType == "PublicUser")
                        {
                            // Update user details if provided
                            existingUser.Address = address ?? existingUser.Address;
                            existingUser.ContactNumber = contactNumber ?? existingUser.ContactNumber;
                            existingUser.Email = email ?? existingUser.Email;

                            if (password != null)
                            {
                                existingUser.PasswordHash = _passwordService.HashPassword(existingUser, password!);
                            }



                            // Update user in the database
                            var updateResult = await _userService.UpdateUserAsync(existingUser);
                            if (!updateResult)
                            {
                                return new BadRequestObjectResult("Failed to update the user!");
                            }
                            else
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                // Capture additional audit details
                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "update-user",
                                    RequestType = "PUT",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = null,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);
                                return new OkObjectResult("User updated successfully!");
                            }

                        }
                        else
                        {
                            return new BadRequestObjectResult("Failed to update the user!");
                        }



                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("RegisterTrafficViolation")]
        public async Task<IActionResult> RegisterTrafficViolation([HttpTrigger(AuthorizationLevel.Function, "post", Route = "register-traffic-violation")] HttpRequest req)
        {
            try
            {

                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<TrafficViolationRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body!");
                        }

                        //Accessing deserialized parameters
                        string? sectionOfAct = data.SectionOfAct;
                        string? violationType = data.ViolationType;
                        string? provision = data.Provision;
                        decimal fineAmount = data.FineAmount;
                        int points = data.Points;
                        int dueDays = data.DueDays;

                        if (sectionOfAct == null || violationType == null || provision == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing!");
                        }
                        else
                        {

                            var existingTrafficViolation = await _trafficViolationService.GetTrafficViolationByParametersAsync(sectionOfAct, provision);
                            if (existingTrafficViolation != null)
                            {
                                return new ConflictObjectResult("Traffic Violation already registered with provided parameters!");
                            }
                            else
                            {

                                var newTrafficViolation = new TrafficViolation
                                {
                                    SectionOfAct = sectionOfAct,
                                    ViolationType = violationType,
                                    Provision = provision,
                                    FineAmount = fineAmount,
                                    Points = points,
                                    DueDays = dueDays

                                };
                                int trafficViolationId = await _trafficViolationService.AddTrafficViolationAsync(newTrafficViolation);
                                if (trafficViolationId > 0)
                                {
                                    string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                    User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                    // Capture additional audit details
                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "register-traffic-violation",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = null,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);

                                    return new OkObjectResult("Traffcic Violation registered successfully!");

                                }
                                else
                                {
                                    return new BadRequestObjectResult("Failed to register the traffic violation!");
                                }


                            }



                        }

                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("GetAllTrafficViolations")]
        public async Task<IActionResult> GetAllTrafficViolations([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-all-traffic-violations")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin" || userRole == "TrafficPolice")
                    {
                        var trafficViolations = await _trafficViolationService.GetAllTrafficViolationsAsync();
                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                            MaxDepth = 32
                        };

                        // Serialize the stations with the custom options
                        var jsonData = System.Text.Json.JsonSerializer.Serialize(trafficViolations, jsonOptions);
                        if (jsonData != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-all-traffic-violations",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(jsonData);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No traffic violations found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("UpdateTrafficViolation")]
        public async Task<IActionResult> UpdateTrafficViolation([HttpTrigger(AuthorizationLevel.Function, "put", Route = "update-traffic-violation")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<TrafficViolationRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body!");
                        }

                        // Accessing deserialized parameters
                        int violationId = data.ViolationId;
                        string? violationType = data.ViolationType;
                        string? sectionOfAct = data.SectionOfAct;
                        string? provision = data.Provision;
                        int? points = data.Points;
                        int? dueDays = data.DueDays;
                        decimal? fineAmount = data.FineAmount;


                        // Check if the station exists
                        var existingTrafficViolation = await _trafficViolationService.GetTrafficViolationByViolationIdAsync(violationId);
                        if (existingTrafficViolation == null)
                        {
                            return new NotFoundObjectResult("Traffic Violation not found!");
                        }

                        else
                        {
                            // Update user details if provided
                            existingTrafficViolation.ViolationType = violationType ?? existingTrafficViolation.ViolationType;
                            existingTrafficViolation.SectionOfAct = sectionOfAct ?? existingTrafficViolation.SectionOfAct;
                            existingTrafficViolation.Provision = provision ?? existingTrafficViolation.Provision;
                            existingTrafficViolation.Points = points ?? existingTrafficViolation.Points;
                            existingTrafficViolation.DueDays = dueDays ?? existingTrafficViolation.DueDays;
                            existingTrafficViolation.FineAmount = fineAmount ?? existingTrafficViolation.FineAmount;


                            // Update user in the database
                            var updateResult = await _trafficViolationService.UpdateTrafficViolationAsync(existingTrafficViolation);
                            if (!updateResult)
                            {
                                return new BadRequestObjectResult("Failed to update the traffic violation!");
                            }
                            else
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                // Capture additional audit details
                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "update-traffic-violation",
                                    RequestType = "PUT",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = null,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);
                                return new OkObjectResult("Traffic Violation updated successfully!");
                            }


                        }




                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("DeleteTrafficViolation")]
        public async Task<IActionResult> DeleteTrafficViolation([HttpTrigger(AuthorizationLevel.Function, "delete", Route = "delete-traffic-violation")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin" || userRole == "StationAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        int violationId = data?.violationId!;

                        if (violationId <= 0)
                        {
                            return new BadRequestObjectResult("ViolationId is required in the request body!");
                        }

                        var existingTrafficViolation = await _trafficViolationService.GetTrafficViolationByViolationIdAsync(violationId);
                        if (existingTrafficViolation == null)
                        {
                            return new NotFoundObjectResult("Traffic Violation not found!");
                        }
                        else
                        {
                            bool isDeleted = await _trafficViolationService.DeleteTrafficViolationAsync(existingTrafficViolation.ViolationId);
                            if (!isDeleted)
                            {
                                return new BadRequestObjectResult("Failed to delete the traffic violation!");
                            }
                            else
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                // Capture additional audit details
                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "delete-traffic-violation",
                                    RequestType = "DELETE",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = null,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);
                                return new OkObjectResult("Traffic violation deleted successfully!");

                            }

                        }


                    }


                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("SendNotification")]
        public async Task<IActionResult> SendNotification([HttpTrigger(AuthorizationLevel.Function, "post", Route = "send-notification")] HttpRequest req)
        {
            try
            {

                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin" || userRole == "StationAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<NotificationRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body!");
                        }

                        //Accessing deserialized parameters
                        string? notifiedBy = data.MessageSender;
                        string? receiverType = data.MessageReceiverType;
                        string? message = data.MessageContent;
                        DateTime? sentAt = data.SentAt;




                        if (notifiedBy == null || receiverType == null || message == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing!");
                        }
                        else
                        {

                            var newNotification = new Notification
                            {
                                NotifiedBy = notifiedBy,
                                ReceiverType = receiverType,
                                Message = message,
                                SentAt = sentAt
                            };

                            int notificationId = await _notificationService.AddNotificationAsync(newNotification);
                            if (notificationId > 0)
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);
                                // Capture additional audit details
                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "send-notification",
                                    RequestType = "POST",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = null,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);
                                return new OkObjectResult("Notification added successfully!");

                            }
                            else
                            {
                                return new BadRequestObjectResult("Failed to add the notification!");
                            }



                        }

                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        //retrive notifications for system admins
        [Function("GetAllNotificationsBySenderEmail")]
        public async Task<IActionResult> GetAllNotificationsBySenderEmail([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-all-notifications-by-email")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        string senderEmail = data?.senderEmail!;

                        if (senderEmail == null)
                        {
                            return new BadRequestObjectResult("Email is required in the request body!");
                        }

                        var notifications = await _notificationService.GetAllNotificationsBySenderEmailAsync(senderEmail);
                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                            MaxDepth = 32
                        };

                        // Serialize the stations with the custom options
                        var jsonData = System.Text.Json.JsonSerializer.Serialize(notifications, jsonOptions);
                        if (jsonData != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-all-notifications",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(jsonData);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No notifications found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetAllAudits")]
        public async Task<IActionResult> GetAllAudits([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-all-audits")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        var audits = await _auditService.GetAllAuditsAsync();



                        if (audits != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-all-audits",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(audits);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No audits found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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


        [Function("RegisterTrafficPolice")]
        public async Task<IActionResult> RegisterTrafficPolice([HttpTrigger(AuthorizationLevel.Function, "post", Route = "register-traffic-police")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "StationAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body.");
                        }

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        //Accessing deserialized parameters
                        string? firstName = data.FirstName;
                        string? lastName = data.LastName;
                        string? address = data.Address;
                        string? email = data.Email;
                        string? contactNumber = data.ContactNumber;
                        string? gender = data.Gender;
                        DateTime? dateOfBirth = data.DateOfBirth;



                        string? password = data.Password;

                        string? nicNumber = data.NicNumber;
                        int? badgeNumber = data.BadgeNumber;






                        string? licenseNumber = data.LicenseNumber;

                        var licenseHolder = await _licenseHolderService.GetLicenseHolderByLicenseNumberAsync(licenseNumber!);

                        if (licenseHolder == null)
                        {
                            return new NotFoundObjectResult("Traffic police details are not valid!");
                        }
                        DateTime? licenseIssueDate = licenseHolder.IssueDate;
                        DateTime? licenseExpiryDate = licenseHolder.ExpiryDate;


                        string? userType = "TrafficPolice";


                        if (firstName == null || lastName == null || gender == null || dateOfBirth == null || address == null || contactNumber == null || password == null || licenseIssueDate == null || licenseExpiryDate == null || email == null || nicNumber == null || licenseNumber == null || badgeNumber == null || userType == null || userType != "TrafficPolice")
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing/User type is wrong!");
                        }
                        else
                        {
                            var existingUser = await _userService.GetUserByParametersAsync(email!, nicNumber!, licenseNumber!, badgeNumber ?? 0);

                            if (existingUser != null)
                            {
                                return new ConflictObjectResult("User already registered with provided credentials!");
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
                                    BadgeNumber = badgeNumber,
                                    RegisteredStationId = user?.RegisteredStationId

                                };

                                newUser.PasswordHash = _passwordService.HashPassword(newUser, password!);
                                var userId = await _userService.AddUserAsync(newUser);

                                if (userId > 0)
                                {


                                    // Capture additional audit details
                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "register-traffic-police",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);
                                    return new OkObjectResult("Traffic police registered successfully!");


                                }
                                else
                                {
                                    return new BadRequestObjectResult("Failed to register the Traffic police!");
                                }


                            }

                        }

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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


        [Function("GetAllTrafficPolice")]
        public async Task<IActionResult> GetAllTrafficPolice(
       [HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-all-traffic-police")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                    return new BadRequestObjectResult("Missing Authorization token!");

                token = token.ToString().Replace("Bearer ", "");
                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal == null)
                    return new BadRequestObjectResult("Token is invalid or expired!");

                var userRole = principal.Claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                if (userRole != "StationAdmin")
                    return new BadRequestObjectResult("User is not authorized for this action!");

                var stationIdClaim = principal.Claims.FirstOrDefault(c => c.Type == "RegisteredStationId")?.Value;
                int registeredStationId = int.TryParse(stationIdClaim, out int parsedId) ? parsedId : 0;

                var trafficPoliceEntities = await _userService.GetAllTrafficPoliceAsync(registeredStationId);

                var trafficPoliceDtos = trafficPoliceEntities.Select(tp => new TrafficPoliceResponseDto
                {
                    UserId = tp.UserId,
                    UserType = tp.UserType,
                    FirstName = tp.FirstName,
                    LastName = tp.LastName,
                    Gender = tp.Gender,
                    DateOfBirth = tp.DateOfBirth,
                    Address = tp.Address,
                    Email = tp.Email,
                    ContactNumber = tp.ContactNumber,
                    NicNumber = tp.NicNumber,
                    LicenseNumber = tp.LicenseNumber,
                    BadgeNumber = tp.BadgeNumber,
                    RegisteredStationId = tp.RegisteredStationId,
                    RegisteredStationName = tp.RegisteredStation?.StationName,
                    RegisteredStationDistrict = tp.RegisteredStation?.District,
                }).ToList();

                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = true
                };

                var jsonData = System.Text.Json.JsonSerializer.Serialize(trafficPoliceDtos, jsonOptions);

                var userEmail = _jwtService.GetUserEmailFromToken(token!);
                User? user = await _userService.GetUserByEmailAsync(userEmail!);

                var auditEntry = new Audit
                {
                    UserId = user!.UserId,
                    ApiEndPoint = "get-all-traffic-police",
                    RequestType = "GET",
                    TimeStamp = DateTime.UtcNow,
                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                    RequestBody = null,
                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                    UserAgent = req.Headers["User-Agent"].ToString()
                };
                await _auditService.LogAuditAsync(auditEntry);

                return new OkObjectResult(jsonData);
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = 500 };
            }
        }


        [Function("SearchPublicUser")]
        public async Task<IActionResult> SearchPublicUser([HttpTrigger(AuthorizationLevel.Function, "post", Route = "search-public-user")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "StationAdmin" || userRole == "PublicUser")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);
                        string nicNumber = data?.NicNumber!;
                        string? licenseNumber = data?.LicenseNumber!;

                        if (string.IsNullOrWhiteSpace(nicNumber) || string.IsNullOrWhiteSpace(licenseNumber))
                        {
                            return new BadRequestObjectResult("Nic number & License number are required in the request body!");
                        }

                        var existingPublicUser = await _licenseHolderService.GetPublicUserByNicLicenseNumberAsync(nicNumber, licenseNumber);
                        if (existingPublicUser == null)
                        {
                            return new NotFoundObjectResult("Public user not found!");
                        }
                        else
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "search-public-user",
                                RequestType = "POST",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = requestBody,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(existingPublicUser);
                        }

                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("RegisterPublicUser")]
        public async Task<IActionResult> RegisterPublicUser([HttpTrigger(AuthorizationLevel.Function, "post", Route = "register-public-user")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "StationAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body.");
                        }

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        //Accessing deserialized parameters
                        string? firstName = data.FirstName;
                        string? lastName = data.LastName;
                        string? address = data.Address;
                        string? email = data.Email;
                        string? contactNumber = data.ContactNumber;
                        string? gender = data.Gender;
                        DateTime? dateOfBirth = data.DateOfBirth;



                        string? password = data.Password;

                        string? nicNumber = data.NicNumber;


                        string? licenseNumber = data.LicenseNumber;

                        var licenseHolder = await _licenseHolderService.GetLicenseHolderByLicenseNumberAsync(licenseNumber!);

                        if (licenseHolder == null)
                        {
                            return new NotFoundObjectResult("Public user details are not valid!");
                        }
                        DateTime? licenseIssueDate = licenseHolder.IssueDate;
                        DateTime? licenseExpiryDate = licenseHolder.ExpiryDate;




                        string? userType = "PublicUser";
                        int availablePoints = 120;


                        if (firstName == null || lastName == null || gender == null || dateOfBirth == null || address == null || contactNumber == null || password == null || licenseIssueDate == null || licenseExpiryDate == null || email == null || nicNumber == null || licenseNumber == null || userType == null || userType != "PublicUser")
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing/User type is wrong!");
                        }
                        else
                        {
                            var existingUser = await _userService.GetPublicUserByParametersAsync(email!, nicNumber!, licenseNumber!);

                            if (existingUser != null)
                            {
                                return new ConflictObjectResult("User already registered with provided credentials!");
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
                                    RegisteredStationId = user?.RegisteredStationId,
                                    BadgeNumber = null,
                                    AvailablePoints = availablePoints

                                };




                                newUser.PasswordHash = _passwordService.HashPassword(newUser, password!);
                                var userId = await _userService.AddUserAsync(newUser);


                                var categoryMap = new Dictionary<string, int>
                                {
                                     { "A1", 1 },
                                     { "A", 2 },
                                     { "B1", 3 },
                                     { "B", 4 },
                                     { "C1", 5 },
                                     { "C", 6 },
                                     { "CE", 7 },
                                     { "D1", 8 },
                                     { "D", 9 },
                                     { "DE", 10 },
                                     { "G1", 11 },
                                     { "G", 12 },
                                     { "J", 13 }
                                };


                                string? permittedvehicles = licenseHolder.PermittedVehicleCategories;

                                if (!string.IsNullOrWhiteSpace(permittedvehicles))
                                {
                                    var categories = permittedvehicles.Split(',', StringSplitOptions.RemoveEmptyEntries);

                                    foreach (var categoryCode in categories)
                                    {
                                        var trimmedCode = categoryCode.Trim();
                                        if (categoryMap.TryGetValue(trimmedCode, out int categoryId))
                                        {
                                            await _userEligibleVehicleCategoryService.AddUserEligibleVehicleCategoryAsync(newUser.UserId, categoryId);
                                        }
                                        else
                                        {
                                            // Optional: Log or handle unknown category codes
                                            Console.WriteLine($"Unknown vehicle category code: {trimmedCode}");
                                        }
                                    }
                                }


                                if (userId > 0)
                                {


                                    // Capture additional audit details
                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "register-public-user",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);
                                    return new OkObjectResult("Public user registered successfully!");


                                }
                                else
                                {
                                    return new BadRequestObjectResult("Failed to register the Public user!");
                                }


                            }

                        }

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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




        [Function("GetAllPublicUsers")]
        public async Task<IActionResult> GetAllPublicUsers(
      [HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-all-public-users")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                    return new BadRequestObjectResult("Missing Authorization token!");

                token = token.ToString().Replace("Bearer ", "");
                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal == null)
                    return new BadRequestObjectResult("Token is invalid or expired!");

                var userRole = principal.Claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                if (userRole != "StationAdmin")
                    return new BadRequestObjectResult("User is not authorized for this action!");

                var stationIdClaim = principal.Claims.FirstOrDefault(c => c.Type == "RegisteredStationId")?.Value;
                int registeredStationId = int.TryParse(stationIdClaim, out int parsedId) ? parsedId : 0;

                var publicUserEntities = await _userService.GetAllPublicUsersAsync(registeredStationId);

                var publicUserDtos = publicUserEntities.Select(tp => new PublicUserResponseDto
                {
                    UserId = tp.UserId,
                    UserType = tp.UserType,
                    FirstName = tp.FirstName,
                    LastName = tp.LastName,
                    Gender = tp.Gender,
                    DateOfBirth = tp.DateOfBirth,
                    Address = tp.Address,
                    Email = tp.Email,
                    ContactNumber = tp.ContactNumber,
                    NicNumber = tp.NicNumber,
                    LicenseNumber = tp.LicenseNumber,
                    RegisteredStationId = tp.RegisteredStationId,
                    RegisteredStationName = tp.RegisteredStation?.StationName,
                    RegisteredStationDistrict = tp.RegisteredStation?.District,
                    AvailablePoints = tp.AvailablePoints!.Value
                }).ToList();



                var userEmail = _jwtService.GetUserEmailFromToken(token!);
                User? user = await _userService.GetUserByEmailAsync(userEmail!);

                var auditEntry = new Audit
                {
                    UserId = user!.UserId,
                    ApiEndPoint = "get-all-public-users",
                    RequestType = "GET",
                    TimeStamp = DateTime.UtcNow,
                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                    RequestBody = null,
                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                    UserAgent = req.Headers["User-Agent"].ToString()
                };
                await _auditService.LogAuditAsync(auditEntry);

                return new OkObjectResult(publicUserDtos);
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = 500 };
            }
        }
        [Function("GetAllStationAdminNotifications")]
        public async Task<IActionResult> GetAllStationAdminNotifications([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-all-station-admin-notifications")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "StationAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        string senderEmail = data?.senderEmail!;

                        if (senderEmail == null)
                        {
                            return new BadRequestObjectResult("Email is required in the request body!");
                        }

                        var notifications = await _notificationService.GetAllStationAdminNotificationsBySenderEmailAsync(senderEmail);
                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                            MaxDepth = 32
                        };

                        // Serialize the stations with the custom options
                        var jsonData = System.Text.Json.JsonSerializer.Serialize(notifications, jsonOptions);
                        if (jsonData != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-all-station-admin-notifications",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(jsonData);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No notifications found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetAllPublicUserNotifications")]
        public async Task<IActionResult> GetAllPublicUserNotifications([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-all-public-user-notifications")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "PublicUser")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        string senderEmail = data?.senderEmail!;

                        if (senderEmail == null)
                        {
                            return new BadRequestObjectResult("Email is required in the request body!");
                        }

                        var notifications = await _notificationService.GetAllPublicUserNotificationsBySenderEmailAsync(senderEmail);
                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                            MaxDepth = 32
                        };

                        // Serialize the stations with the custom options
                        var jsonData = System.Text.Json.JsonSerializer.Serialize(notifications, jsonOptions);
                        if (jsonData != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-all-public-user-notifications",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(jsonData);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No notifications found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetPublicUser")]
        public async Task<IActionResult> GetPublicUser([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-public-user")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "StationAdmin" || userRole == "PublicUser")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);
                        string nicNumber = data?.NicNumber!;
                        string? licenseNumber = data?.LicenseNumber!;

                        if (string.IsNullOrWhiteSpace(nicNumber) || string.IsNullOrWhiteSpace(licenseNumber))
                        {
                            return new BadRequestObjectResult("Nic number & License number are required in the request body!");
                        }

                        var existingPublicUser = await _userService.GetPublicUserByNicLicenseNumberAsync(nicNumber, licenseNumber);

                        if (existingPublicUser == null)
                        {
                            return new NotFoundObjectResult("Public user not found!");
                        }

                        var publicUserDto = new PublicUserResponseDto
                        {
                            UserId = existingPublicUser.UserId,
                            UserType = existingPublicUser.UserType,
                            FirstName = existingPublicUser.FirstName,
                            LastName = existingPublicUser.LastName,
                            Gender = existingPublicUser.Gender,
                            DateOfBirth = existingPublicUser.DateOfBirth,
                            Address = existingPublicUser.Address,
                            Email = existingPublicUser.Email,
                            ContactNumber = existingPublicUser.ContactNumber,
                            NicNumber = existingPublicUser.NicNumber,
                            LicenseNumber = existingPublicUser.LicenseNumber,
                            RegisteredStationId = existingPublicUser.RegisteredStationId,
                            RegisteredStationName = existingPublicUser.RegisteredStation?.StationName,
                            RegisteredStationDistrict = existingPublicUser.RegisteredStation?.District,
                            AvailablePoints = existingPublicUser.AvailablePoints!.Value
                        };

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        var auditEntry = new Audit
                        {
                            UserId = user!.UserId,
                            ApiEndPoint = "search-public-user",
                            RequestType = "POST",
                            TimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        };
                        await _auditService.LogAuditAsync(auditEntry);

                        return new OkObjectResult(publicUserDto);
                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetAllTrafficPoliceNotifications")]
        public async Task<IActionResult> GetAllTrafficPoliceNotifications([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-all-traffic-police-notifications")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "TrafficPolice")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        string senderEmail = data?.senderEmail!;

                        if (senderEmail == null)
                        {
                            return new BadRequestObjectResult("Email is required in the request body!");
                        }

                        var notifications = await _notificationService.GetAllTrafficPoliceNotificationsBySenderEmailAsync(senderEmail);
                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                            MaxDepth = 32
                        };

                        // Serialize the stations with the custom options
                        var jsonData = System.Text.Json.JsonSerializer.Serialize(notifications, jsonOptions);
                        if (jsonData != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-all-traffic-police-notifications",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(jsonData);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No notifications found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetLicenseHolderDetails")]
        public async Task<IActionResult> GetLicenseHolderDetails([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-license-holder-details")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "TrafficPolice" || userRole == "PublicUser")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);

                        string? licenseNumber = data?.LicenseNumber!;

                        if (string.IsNullOrWhiteSpace(licenseNumber))
                        {
                            return new BadRequestObjectResult("License number is required in the request body!");
                        }

                        var existingPublicUser = await _userService.GetPublicUserByLicenseNumberAsync(licenseNumber);
                        if (existingPublicUser == null)
                        {
                            return new NotFoundObjectResult("Public user not found!");
                        }
                        string? permittedVehicles = await _userService.GetEligibleVehicleCategories(existingPublicUser!.UserId);



                        var publicUserDto = new PublicUserResponseDto
                        {
                            UserId = existingPublicUser.UserId,
                            UserType = existingPublicUser.UserType,
                            FirstName = existingPublicUser.FirstName,
                            LastName = existingPublicUser.LastName,
                            Gender = existingPublicUser.Gender,
                            DateOfBirth = existingPublicUser.DateOfBirth,
                            Address = existingPublicUser.Address,
                            Email = existingPublicUser.Email,
                            ContactNumber = existingPublicUser.ContactNumber,
                            NicNumber = existingPublicUser.NicNumber,
                            LicenseNumber = existingPublicUser.LicenseNumber,
                            RegisteredStationId = existingPublicUser.RegisteredStationId,
                            RegisteredStationName = existingPublicUser.RegisteredStation?.StationName,
                            RegisteredStationDistrict = existingPublicUser.RegisteredStation?.District,
                            AvailablePoints = existingPublicUser.AvailablePoints!.Value,
                            LicenseIssueDate = existingPublicUser.LicenseIssueDate,
                            LicenseExpiryDate = existingPublicUser.LicenseExpiryDate,
                            PermittedVehicles = permittedVehicles
                        };

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        var auditEntry = new Audit
                        {
                            UserId = user!.UserId,
                            ApiEndPoint = "get-license-holder-details",
                            RequestType = "POST",
                            TimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        };
                        await _auditService.LogAuditAsync(auditEntry);

                        return new OkObjectResult(publicUserDto);
                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetVehicleRegistrationDetails")]
        public async Task<IActionResult> GetVehicleRegistrationDetails([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-vehicle-registration-details")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "TrafficPolice")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<VehicleRegistrationRequestDto>(requestBody);

                        string? vehicleNumber = data?.VehicleNumber!;

                        if (string.IsNullOrWhiteSpace(vehicleNumber))
                        {
                            return new BadRequestObjectResult("Vehicle number is required in the request body!");
                        }

                        var existingVehicle = await _vehicleRegistrationService.GetVehicleByVehicleNumberAsync(vehicleNumber);

                        if (existingVehicle == null)
                        {
                            return new NotFoundObjectResult("Vehicle not found!");
                        }

                        var vehicleRegistrationDto = new VehicleRegistrationResponseDto
                        {
                            VehicleId = existingVehicle.VehicleId,
                            VehicleNumber = existingVehicle.VehicleNumber,
                            VehicleCategory = existingVehicle.VehicleCategory,
                            NicNumber = existingVehicle.NicNumber,
                            Make = existingVehicle.Make,
                            Model = existingVehicle.Model,
                            Year = existingVehicle.Year,
                            Color = existingVehicle.Color,
                            RegistrationNo = existingVehicle.RegistrationNo,
                            RegistrationDate = existingVehicle.RegistrationDate,
                            IsRoadTaxPaid = existingVehicle.IsRoadTaxPaid,
                            IsInsuranced = existingVehicle.IsInsuranced

                        };

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        var auditEntry = new Audit
                        {
                            UserId = user!.UserId,
                            ApiEndPoint = "get-vehicle-registration-details",
                            RequestType = "POST",
                            TimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        };
                        await _auditService.LogAuditAsync(auditEntry);

                        return new OkObjectResult(vehicleRegistrationDto);
                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("GetTrafficViolations")]
        public async Task<IActionResult> GetTrafficViolations([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-traffic-violations")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin" || userRole == "TrafficPolice")
                    {
                        var trafficViolations = await _trafficViolationService.GetAllTrafficViolationsAsync();


                        if (trafficViolations != null)
                        {
                            var trafficViolationsDto = trafficViolations.Select(tv => new TrafficViolationResponseDto
                            {
                                ViolationId = tv.ViolationId,
                                SectionOfAct = tv.SectionOfAct,
                                ViolationType = tv.ViolationType,
                                Provision = tv.Provision,
                                FineAmount = tv.FineAmount,
                                DueDays = tv.DueDays,
                                Points = tv.Points
                            }).ToList();

                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-traffic-violations",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(trafficViolationsDto);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No traffic violations found!");
                        }
                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("GetCourts")]
        public async Task<IActionResult> GetCourts([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-courts")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin" || userRole == "TrafficPolice")
                    {
                        var courts = await _courtService.GetAllCourtsAsync();


                        if (courts != null)
                        {
                            var courtsDto = courts.Select(tv => new CourtDto
                            {
                                CourtId = tv.CourtId,
                                CourtName = tv.CourtName,
                                CourtType = tv.CourtType,
                                Location = tv.Location,
                                Jurisdiction = tv.Jurisdiction,
                                ContactNumber = tv.ContactNumber,
                                EstablishedDate = tv.EstablishedDate
                            }).ToList();

                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-courts",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(courtsDto);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No courts found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("AddFine")]
        public async Task<IActionResult> AddFine([HttpTrigger(AuthorizationLevel.Function, "post", Route = "add-fine")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "TrafficPolice")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<FineRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body.");
                        }

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        User? offender = await _userService.GetUserByLicenseNumberAsync(data.LicenseNumber!);

                        VehicleRegistration? vehicle = await _vehicleRegistrationService.GetVehicleByVehicleNumberAsync(data.VehicleNumber!);

                        Station? station = await _stationService.GetStationByIdAsync(data.StationId);

                        int issuerId = user!.UserId;
                        int offenderId = offender!.UserId;
                        int vehicleId = vehicle!.VehicleId;
                        int stationId = data.StationId;
                        int courtId = data.CourtId;
                        DateTime violationDate = data.ViolationDate;
                        string? longitude = data.Longitude;
                        string? latitude = data.Latitude;
                        string? status = data.Status;
                        string? district = station?.District;

                        string? userType = "TrafficPolice";


                        if (longitude == null || latitude == null || status == null || district == null || userType != "TrafficPolice")
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing/User type is wrong!");
                        }
                        else
                        {

                            if (data.AssignedFines == null || !data.AssignedFines.Any())
                            {
                                return new BadRequestObjectResult("No assigned fines provided.");
                            }

                            foreach (var fineDetail in data.AssignedFines)
                            {
                                var newFine = new Fine
                                {
                                    IssuerId = issuerId,
                                    OffenderId = offenderId,
                                    VehicleId = vehicleId,
                                    StationId = stationId,
                                    CourtId = courtId,
                                    ViolationDate = violationDate,
                                    Longitude = longitude,
                                    Latitude = latitude,
                                    Status = status,
                                    District = district,
                                    ViolationId = fineDetail.ViolationId,
                                    DueDate = DateTime.Now.AddDays(fineDetail.DueDays)
                                };

                                var fineId = await _fineService.AddFineAsync(newFine);
                                TrafficViolation? trafficViolation = await _trafficViolationService.GetTrafficViolationByViolationIdAsync(fineDetail.ViolationId);
                                int pointsToDeduct = trafficViolation!.Points;
                                var isPointsDeducted = await _userService.DeductPointsAsync(offenderId, pointsToDeduct);

                                if (fineId <= 0 && !isPointsDeducted)
                                {
                                    return new BadRequestObjectResult("Failed to add one of the fines.");
                                }
                            }


                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "add-fine",
                                RequestType = "POST",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = requestBody,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult("Fine added successfully!");

                        }

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetFines")]
        public async Task<IActionResult> GetFines([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-fines")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "TrafficPolice" || userRole == "PublicUser")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);

                        string? licenseNumber = data?.LicenseNumber!;

                        if (string.IsNullOrWhiteSpace(licenseNumber))
                        {
                            return new BadRequestObjectResult("License number is required in the request body!");
                        }

                        var existingPublicUser = await _userService.GetPublicUserByLicenseNumberAsync(licenseNumber);

                        if (existingPublicUser == null)
                        {
                            return new NotFoundObjectResult("Public user not found!");
                        }
                        else
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);

                            int userId = existingPublicUser.UserId;
                            var fines = await _fineService.GetFinesByUserIdAndStatusAsync(userId, "pending");

                            var fineDtos = fines.Select(f => new FineResponseDto
                            {
                                FineId = f.FineId,
                                OffenderId = f.OffenderId,
                                IssuerId = f.IssuerId,
                                VehicleId = f.VehicleId,
                                ViolationId = f.ViolationId,
                                StationId = f.StationId,
                                CourtId = f.CourtId,
                                ViolationDate = f.ViolationDate,
                                DueDate = f.DueDate,
                                District = f.District,
                                Longitude = f.Longitude,
                                Latitude = f.Latitude,
                                Status = f.Status
                            }).ToList();

                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-fines",
                                RequestType = "POST",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = requestBody,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);

                            return new OkObjectResult(fineDtos);

                        }



                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetFineDetails")]
        public async Task<IActionResult> GetFineDetails([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-fine-details")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "TrafficPolice" || userRole == "PublicUser" || userRole == "StationAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JObject.Parse(requestBody);

                        string? LicenseNumber = data["licenseNumber"]?.ToString();
                        string? IssuerEmail = data["issuerEmail"]?.ToString();
                        string? OffenderEmail = data["offenderEmail"]?.ToString();
                        string? fineType = data["typeOfFines"]?.ToString();
                        int StationId = data["stationId"]?.ToObject<int>() ?? 0;




                        if (!string.IsNullOrEmpty(LicenseNumber))
                        {
                            string? licenseNumber = LicenseNumber;

                            if (string.IsNullOrWhiteSpace(licenseNumber))
                            {
                                return new BadRequestObjectResult("License number is required in the request body!");
                            }

                            var existingPublicUser = await _userService.GetPublicUserByLicenseNumberAsync(licenseNumber);

                            if (existingPublicUser == null)
                            {
                                return new NotFoundObjectResult("Public user not found!");
                            }
                            else
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);

                                int userId = existingPublicUser.UserId;
                                var fines = await _fineService.GetFinesByUserIdAndStatusAsync(userId, "pending");

                                var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                {

                                    FineId = f.FineId,

                                    OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                    IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                    BadgeNumber = f.Issuer?.BadgeNumber,
                                    VehicleNumber = f.Vehicle?.VehicleNumber,
                                    SectionOfAct = f.Violation?.SectionOfAct,
                                    Provision = f.Violation?.Provision,
                                    Amount = f.Violation?.FineAmount,
                                    DeductedPoints = f.Violation!.Points,
                                    StationName = f.Station?.StationName,
                                    CourtName = f.Court?.CourtName,
                                    ViolationDate = f.ViolationDate,
                                    DueDate = f.DueDate,
                                    Longitude = f.Longitude,
                                    Latitude = f.Latitude,
                                    Status = f.Status
                                }).ToList();

                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "get-fine-details",
                                    RequestType = "POST",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = requestBody,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);

                                return new OkObjectResult(fineDtos);
                            }
                        }
                        else if (!string.IsNullOrEmpty(IssuerEmail))
                        {
                            string? issuerEmail = IssuerEmail;

                            if (string.IsNullOrWhiteSpace(issuerEmail))
                            {
                                return new BadRequestObjectResult("Email is required in the request body!");
                            }

                            var trafficPolice = await _userService.GetUserByEmailAsync(issuerEmail);

                            if (trafficPolice == null)
                            {
                                return new NotFoundObjectResult("TrafficPolice not found!");
                            }
                            else
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);

                                int userId = trafficPolice.UserId;
                                var fines = await _fineService.GetFinesByTrafficPoliceUserIdAsync(userId);

                                var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                {

                                    FineId = f.FineId,

                                    OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                    IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                    BadgeNumber = f.Issuer?.BadgeNumber,
                                    VehicleNumber = f.Vehicle?.VehicleNumber,
                                    SectionOfAct = f.Violation?.SectionOfAct,
                                    Provision = f.Violation?.Provision,
                                    Amount = f.Violation?.FineAmount,
                                    DeductedPoints = f.Violation!.Points,
                                    StationName = f.Station?.StationName,
                                    CourtName = f.Court?.CourtName,
                                    ViolationDate = f.ViolationDate,
                                    DueDate = f.DueDate,
                                    Longitude = f.Longitude,
                                    Latitude = f.Latitude,
                                    Status = f.Status
                                }).ToList();

                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "get-fine-details",
                                    RequestType = "POST",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = requestBody,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);

                                return new OkObjectResult(fineDtos);
                            }
                        }
                        else if (!string.IsNullOrEmpty(OffenderEmail))
                        {
                            string? offenderEmail = OffenderEmail;

                            if (string.IsNullOrWhiteSpace(offenderEmail))
                            {
                                return new BadRequestObjectResult("Email is required in the request body!");
                            }

                            var publicUser = await _userService.GetUserByEmailAsync(offenderEmail);

                            if (publicUser == null)
                            {
                                return new NotFoundObjectResult("Public user not found!");
                            }
                            else
                            {
                                string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                                User? user = await _userService.GetUserByEmailAsync(userEmail!);

                                int userId = publicUser.UserId;
                                if (fineType == "all")
                                {
                                    var fines = await _fineService.GetFinesByPublicUserIdAsync(userId);

                                    var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                    {

                                        FineId = f.FineId,

                                        OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                        IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                        BadgeNumber = f.Issuer?.BadgeNumber,
                                        VehicleNumber = f.Vehicle?.VehicleNumber,
                                        SectionOfAct = f.Violation?.SectionOfAct,
                                        Provision = f.Violation?.Provision,
                                        Amount = f.Violation?.FineAmount,
                                        DeductedPoints = f.Violation!.Points,
                                        StationName = f.Station?.StationName,
                                        CourtName = f.Court?.CourtName,
                                        ViolationDate = f.ViolationDate,
                                        DueDate = f.DueDate,
                                        Longitude = f.Longitude,
                                        Latitude = f.Latitude,
                                        Status = f.Status
                                    }).ToList();

                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "get-fine-details",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);

                                    return new OkObjectResult(fineDtos);

                                }
                                else if (fineType == "paid")
                                {
                                    var fines = await _fineService.GetFinesByUserIdAndStatusAsync(userId, "paid");

                                    var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                    {

                                        FineId = f.FineId,

                                        OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                        IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                        BadgeNumber = f.Issuer?.BadgeNumber,
                                        VehicleNumber = f.Vehicle?.VehicleNumber,
                                        SectionOfAct = f.Violation?.SectionOfAct,
                                        Provision = f.Violation?.Provision,
                                        Amount = f.Violation?.FineAmount,
                                        DeductedPoints = f.Violation!.Points,
                                        StationName = f.Station?.StationName,
                                        CourtName = f.Court?.CourtName,
                                        ViolationDate = f.ViolationDate,
                                        DueDate = f.DueDate,
                                        Longitude = f.Longitude,
                                        Latitude = f.Latitude,
                                        Status = f.Status
                                    }).ToList();

                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "get-fine-details",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);

                                    return new OkObjectResult(fineDtos);
                                }
                                else if (fineType == "pending")
                                {
                                    var fines = await _fineService.GetFinesByUserIdAndStatusAsync(userId, "pending");

                                    var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                    {

                                        FineId = f.FineId,

                                        OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                        IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                        BadgeNumber = f.Issuer?.BadgeNumber,
                                        VehicleNumber = f.Vehicle?.VehicleNumber,
                                        SectionOfAct = f.Violation?.SectionOfAct,
                                        Provision = f.Violation?.Provision,
                                        Amount = f.Violation?.FineAmount,
                                        DeductedPoints = f.Violation!.Points,
                                        StationName = f.Station?.StationName,
                                        CourtName = f.Court?.CourtName,
                                        ViolationDate = f.ViolationDate,
                                        DueDate = f.DueDate,
                                        Longitude = f.Longitude,
                                        Latitude = f.Latitude,
                                        Status = f.Status
                                    }).ToList();

                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "get-fine-details",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);

                                    return new OkObjectResult(fineDtos);
                                }
                                else
                                {
                                    var fines = await _fineService.GetFinesByUserIdAndStatusAsync(userId, "disputed");

                                    var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                    {

                                        FineId = f.FineId,

                                        OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                        IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                        BadgeNumber = f.Issuer?.BadgeNumber,
                                        VehicleNumber = f.Vehicle?.VehicleNumber,
                                        SectionOfAct = f.Violation?.SectionOfAct,
                                        Provision = f.Violation?.Provision,
                                        Amount = f.Violation?.FineAmount,
                                        DeductedPoints = f.Violation!.Points,
                                        StationName = f.Station?.StationName,
                                        CourtName = f.Court?.CourtName,
                                        ViolationDate = f.ViolationDate,
                                        DueDate = f.DueDate,
                                        Longitude = f.Longitude,
                                        Latitude = f.Latitude,
                                        Status = f.Status
                                    }).ToList();

                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "get-fine-details",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);

                                    return new OkObjectResult(fineDtos);
                                }


                            }
                        }
                        else if (StationId > 0)
                        {
                            int stationId = StationId;


                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);

                            if (fineType == "all")
                            {
                                var fines = await _fineService.GetAllFinesByStationIdAsync(stationId);

                                var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                {

                                    FineId = f.FineId,

                                    OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                    IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                    BadgeNumber = f.Issuer?.BadgeNumber,
                                    VehicleNumber = f.Vehicle?.VehicleNumber,
                                    SectionOfAct = f.Violation?.SectionOfAct,
                                    Provision = f.Violation?.Provision,
                                    Amount = f.Violation?.FineAmount,
                                    DeductedPoints = f.Violation!.Points,
                                    StationName = f.Station?.StationName,
                                    CourtName = f.Court?.CourtName,
                                    ViolationDate = f.ViolationDate,
                                    DueDate = f.DueDate,
                                    Longitude = f.Longitude,
                                    Latitude = f.Latitude,
                                    Status = f.Status
                                }).ToList();

                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "get-fine-details",
                                    RequestType = "POST",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = requestBody,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);

                                return new OkObjectResult(fineDtos);

                            }
                            else if (fineType == "paid")
                            {
                                var fines = await _fineService.GetFinesByStationIdAndStatusAsync(stationId, "paid");

                                var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                {

                                    FineId = f.FineId,

                                    OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                    IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                    BadgeNumber = f.Issuer?.BadgeNumber,
                                    VehicleNumber = f.Vehicle?.VehicleNumber,
                                    SectionOfAct = f.Violation?.SectionOfAct,
                                    Provision = f.Violation?.Provision,
                                    Amount = f.Violation?.FineAmount,
                                    DeductedPoints = f.Violation!.Points,
                                    StationName = f.Station?.StationName,
                                    CourtName = f.Court?.CourtName,
                                    ViolationDate = f.ViolationDate,
                                    DueDate = f.DueDate,
                                    Longitude = f.Longitude,
                                    Latitude = f.Latitude,
                                    Status = f.Status
                                }).ToList();

                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "get-fine-details",
                                    RequestType = "POST",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = requestBody,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);

                                return new OkObjectResult(fineDtos);
                            }
                            else if (fineType == "pending")
                            {
                                var fines = await _fineService.GetFinesByStationIdAndStatusAsync(stationId, "pending");

                                var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                {

                                    FineId = f.FineId,

                                    OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                    IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                    BadgeNumber = f.Issuer?.BadgeNumber,
                                    VehicleNumber = f.Vehicle?.VehicleNumber,
                                    SectionOfAct = f.Violation?.SectionOfAct,
                                    Provision = f.Violation?.Provision,
                                    Amount = f.Violation?.FineAmount,
                                    DeductedPoints = f.Violation!.Points,
                                    StationName = f.Station?.StationName,
                                    CourtName = f.Court?.CourtName,
                                    ViolationDate = f.ViolationDate,
                                    DueDate = f.DueDate,
                                    Longitude = f.Longitude,
                                    Latitude = f.Latitude,
                                    Status = f.Status
                                }).ToList();

                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "get-fine-details",
                                    RequestType = "POST",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = requestBody,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);

                                return new OkObjectResult(fineDtos);
                            }
                            else
                            {
                                var fines = await _fineService.GetFinesByStationIdAndStatusAsync(stationId, "disputed");

                                var fineDtos = fines.Select(f => new FineHistoryResponseDto
                                {

                                    FineId = f.FineId,

                                    OffenderName = f.Offender?.FirstName + " " + f.Offender?.LastName,
                                    IssuerName = f.Issuer?.FirstName + " " + f.Issuer?.LastName,
                                    BadgeNumber = f.Issuer?.BadgeNumber,
                                    VehicleNumber = f.Vehicle?.VehicleNumber,
                                    SectionOfAct = f.Violation?.SectionOfAct,
                                    Provision = f.Violation?.Provision,
                                    Amount = f.Violation?.FineAmount,
                                    DeductedPoints = f.Violation!.Points,
                                    StationName = f.Station?.StationName,
                                    CourtName = f.Court?.CourtName,
                                    ViolationDate = f.ViolationDate,
                                    DueDate = f.DueDate,
                                    Longitude = f.Longitude,
                                    Latitude = f.Latitude,
                                    Status = f.Status
                                }).ToList();

                                var auditEntry = new Audit
                                {
                                    UserId = user!.UserId,
                                    ApiEndPoint = "get-fine-details",
                                    RequestType = "POST",
                                    TimeStamp = DateTime.UtcNow,
                                    IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                    RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                    RequestBody = requestBody,
                                    QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                    UserAgent = req.Headers["User-Agent"].ToString()
                                };
                                await _auditService.LogAuditAsync(auditEntry);

                                return new OkObjectResult(fineDtos);
                            }


                        }
                        else
                        {
                            return new BadRequestObjectResult("User is not authorized for this action!");
                        }
                    }
                    else
                    {
                        return new BadRequestObjectResult("Token is invalid or expired!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("MakePayment")]
        public async Task<IActionResult> MakePayment([HttpTrigger(AuthorizationLevel.Function, "post", Route = "make-payment")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "PublicUser")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<FineRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body.");
                        }

                        int fineId = data?.FineId ?? 0;
                        decimal? amount = data?.Amount;
                        var fine = await _fineService.GetFineByFineIdAsync(fineId);

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        var sessionId = await _paymentService.CreateCheckoutSessionAsync(fineId, amount, fine?.Violation!.Provision + " (" + fine?.Violation!.SectionOfAct + ")");

                        var auditEntry = new Audit
                        {
                            UserId = user!.UserId,
                            ApiEndPoint = "make-payment",
                            RequestType = "POST",
                            TimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        };
                        await _auditService.LogAuditAsync(auditEntry);

                        return new OkObjectResult(new { sessionId = sessionId });

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("AddPayment")]
        public async Task<IActionResult> AddPayment([HttpTrigger(AuthorizationLevel.Function, "post", Route = "add-payment")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "PublicUser")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<FineRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body.");
                        }

                        int fineId = data?.FineId ?? 0;
                        string? sessionId = data?.SessionId;
                        decimal amount = data!.Amount;
                        DateTime paymentDate = DateTime.UtcNow;
                        string? paymentMethod = "Stripe Payment";

                        bool isValidSessionId = await _paymentService.ConfirmPaymentAsync(sessionId!);
                        if (isValidSessionId)
                        {
                            Payment newPayment = new Payment
                            {
                                FineId = fineId,
                                TransactionId = sessionId,
                                Amount = amount,
                                PaymentMethod = paymentMethod,
                                PaymentDate = paymentDate
                            };

                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);

                            bool isAdded = await _paymentService.AddPaymentAsync(newPayment);
                            if (isAdded)
                            {
                                var isUpdated = await _fineService.UpdateFineStatusAsync(fineId, "paid");
                                if (isUpdated)
                                {
                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "add-payment",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);


                                }
                                else
                                {
                                    return new BadRequestObjectResult("Failed to add payment!");
                                }

                                return new OkObjectResult("Payment successfully added!");

                            }
                            else
                            {
                                return new BadRequestObjectResult("Failed to add payment!");
                            }
                        }
                        else
                        {
                            return new BadRequestObjectResult("Session id is not valid!");
                        }
                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("AddDispute")]
        public async Task<IActionResult> AddDispute([HttpTrigger(AuthorizationLevel.Function, "post", Route = "add-dispute")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "PublicUser")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<FineRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body.");
                        }

                        int fineId = data?.FineId ?? 0;
                        string disputeReason = "Appeal to Court";

                        var fine = await _fineService.GetFineByFineIdAsync(fineId);


                        if (fine?.Status == "pending")
                        {
                            Models.Dispute newDispute = new Models.Dispute
                            {
                                FineId = fineId,
                                DisputeReason = disputeReason,
                                Status = "Escalated to court",
                                SubmissionDate = DateTime.UtcNow
                            };

                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);

                            int isAdded = await _disputeService.AddDisputeAsync(newDispute);
                            if (isAdded > 0)
                            {
                                var isUpdated = await _fineService.UpdateFineStatusAsync(fineId, "disputed");
                                if (isUpdated)
                                {
                                    var auditEntry = new Audit
                                    {
                                        UserId = user!.UserId,
                                        ApiEndPoint = "add-dispute",
                                        RequestType = "POST",
                                        TimeStamp = DateTime.UtcNow,
                                        IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                        RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                        RequestBody = requestBody,
                                        QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                        UserAgent = req.Headers["User-Agent"].ToString()
                                    };
                                    await _auditService.LogAuditAsync(auditEntry);


                                }
                                else
                                {
                                    return new BadRequestObjectResult("Failed to dispute the fine!");
                                }

                                return new OkObjectResult("Dispute successfully added!");

                            }
                            else
                            {
                                return new BadRequestObjectResult("Failed to dispute the fine!");
                            }
                        }
                        else
                        {
                            return new BadRequestObjectResult("Fine already disputed/paid!");
                        }
                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("GetFine")]
        public async Task<IActionResult> GetFine([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-fine")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "PublicUser")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<FineRequestDto>(requestBody);

                        int fineId = data!.FineId;



                        var existingFine = await _fineService.GetFineByFineIdAsync(fineId);

                        if (existingFine == null)
                        {
                            return new NotFoundObjectResult("Fine not found!");
                        }
                        else
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);

                            var fineDto = new FineResponseDto
                            {
                                FineId = existingFine.FineId,
                                OffenderName = existingFine.Offender!.FirstName + " " + existingFine.Offender.LastName,
                                IssuerName = existingFine.Issuer!.FirstName + " " + existingFine.Issuer.LastName,
                                VehicleNumber = existingFine.Vehicle!.VehicleNumber,
                                SectionOfAct = existingFine.Violation!.SectionOfAct,
                                Provision = existingFine.Violation.Provision,
                                StationName = existingFine.Station!.StationName,
                                CourtName = existingFine.Court!.CourtName,
                                ViolationDate = existingFine.ViolationDate,
                                DueDate = existingFine.DueDate,
                                District = existingFine.District,
                                Longitude = existingFine.Longitude,
                                Latitude = existingFine.Latitude,

                            };

                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-fine",
                                RequestType = "POST",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = requestBody,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);

                            return new OkObjectResult(fineDto);

                        }



                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("GetSystemAdminStatistics")]
        public async Task<IActionResult> GetSystemAdminStatistics([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-system-admin-statistics")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {

                        int totalTrafficViolations = await _trafficViolationService.GetTotalTrafficViolationsAsync();
                        int totalStationAdmins = await _userService.GetTotalUsersByUserTypeAsync("StationAdmin");
                        int totalTrafficPolices = await _userService.GetTotalUsersByUserTypeAsync("TrafficPolice");
                        int totalPublicUsers = await _userService.GetTotalUsersByUserTypeAsync("PublicUser");
                        decimal totalRevenueGenarated = await _paymentService.GetTotalRevenueAsync();
                        int totalStations = await _stationService.GetTotalStationsAsync();
                        int totalFines = await _fineService.GetTotalFinesAsync();
                        int pendingFines = await _fineService.GetTotalPendingFinesAsync();
                        int paidFines = await _fineService.GetTotalPaidFinesAsync();
                        int disputedFines = await _fineService.GetTotalDisputedFinesAsync();


                        StatisticsResponseDto statisticsResponseDto = new StatisticsResponseDto
                        {
                            TotalRegisteredTrafficViolations = totalTrafficViolations,
                            TotalRegisteredStationAdmins = totalStationAdmins,
                            TotalRegisteredTrafficPoliceOfficers = totalTrafficPolices,
                            TotalRegisteredPublicUsers = totalPublicUsers,
                            TotalRevenueGenarated = totalRevenueGenarated,
                            TotalRegisteredStations = totalStations,
                            TotalFinesIssued = totalFines,
                            PendingFines = pendingFines,
                            PaidFines = paidFines,
                            DisputedFines = disputedFines
                        };




                        if (statisticsResponseDto != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-system-admin-statistics",
                                RequestType = "GET",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(statisticsResponseDto);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No statistics found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetStationAdminStatistics")]
        public async Task<IActionResult> GetStationAdminStatistics([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-station-admin-statistics")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "StationAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        dynamic? data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        int stationId = (int)(data?.stationId ?? 0);


                        int totalTrafficPolices = await _userService.GetTotalUsersByUserTypeAndStationIdAsync("TrafficPolice", stationId);
                        int totalPublicUsers = await _userService.GetTotalUsersByUserTypeAndStationIdAsync("PublicUser", stationId);
                        decimal totalRevenueGenarated = await _paymentService.GetTotalRevenueByStationIdAsync(stationId);
                        int totalFines = await _fineService.GetTotalFinesByStationIdAsync(stationId);
                        int pendingFines = await _fineService.GetTotalPendingFinesByStationIdAsync(stationId);
                        int paidFines = await _fineService.GetTotalPaidFinesByStationIdAsync(stationId);
                        int disputedFines = await _fineService.GetTotalDisputedFinesByStationIdAsync(stationId);


                        StatisticsResponseDto statisticsResponseDto = new StatisticsResponseDto
                        {

                            TotalRegisteredTrafficPoliceOfficers = totalTrafficPolices,
                            TotalRegisteredPublicUsers = totalPublicUsers,
                            TotalRevenueGenarated = totalRevenueGenarated,
                            TotalFinesIssued = totalFines,
                            PendingFines = pendingFines,
                            PaidFines = paidFines,
                            DisputedFines = disputedFines
                        };




                        if (statisticsResponseDto != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-station-admin-statistics",
                                RequestType = "POST",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(statisticsResponseDto);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No statistics found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetTrafficPoliceStatistics")]
        public async Task<IActionResult> GetTrafficPoliceStatistics([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-traffic-police-statistics")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "TrafficPolice")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        dynamic? data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        string issuerEmail = data?.issuerEmail!;

                        var issuer = await _userService.GetUserByEmailAsync(issuerEmail);
                        int issuerId = issuer!.UserId;

                        decimal totalRevenueGenarated = await _paymentService.GetTotalRevenueByIssuerIdAsync(issuerId);
                        int totalFines = await _fineService.GetTotalFinesByIssuerIdAsync(issuerId);
                        int pendingFines = await _fineService.GetTotalPendingFinesByIssuerIdAsync(issuerId);
                        int paidFines = await _fineService.GetTotalPaidFinesByIssuerIdAsync(issuerId);
                        int disputedFines = await _fineService.GetTotalDisputedFinesByIssuerIdAsync(issuerId);


                        StatisticsResponseDto statisticsResponseDto = new StatisticsResponseDto
                        {

                            TotalRevenueGenarated = totalRevenueGenarated,
                            TotalFinesIssued = totalFines,
                            PendingFines = pendingFines,
                            PaidFines = paidFines,
                            DisputedFines = disputedFines
                        };




                        if (statisticsResponseDto != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-traffic-police-statistics",
                                RequestType = "POST",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(statisticsResponseDto);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No statistics found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetPublicUserStatistics")]
        public async Task<IActionResult> GetPublicUserStatistics([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-public-user-statistics")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "PublicUser")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        dynamic? data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        string offenderEmail = data?.offenderEmail!;

                        var offender = await _userService.GetUserByEmailAsync(offenderEmail);
                        int offenderId = offender!.UserId;

                        decimal totalRevenueGenarated = await _paymentService.GetTotalRevenueByOffenderIdAsync(offenderId);
                        int totalFines = await _fineService.GetTotalFinesByOffenderIdAsync(offenderId);
                        int pendingFines = await _fineService.GetTotalPendingFinesByOffenderIdAsync(offenderId);
                        int paidFines = await _fineService.GetTotalPaidFinesByOffenderIdAsync(offenderId);
                        int disputedFines = await _fineService.GetTotalDisputedFinesByOffenderIdAsync(offenderId);


                        StatisticsResponseDto statisticsResponseDto = new StatisticsResponseDto
                        {

                            TotalRevenueGenarated = totalRevenueGenarated,
                            TotalFinesIssued = totalFines,
                            PendingFines = pendingFines,
                            PaidFines = paidFines,
                            DisputedFines = disputedFines
                        };




                        if (statisticsResponseDto != null)
                        {
                            string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                            User? user = await _userService.GetUserByEmailAsync(userEmail!);
                            // Capture additional audit details
                            var auditEntry = new Audit
                            {
                                UserId = user!.UserId,
                                ApiEndPoint = "get-traffic-police-statistics",
                                RequestType = "POST",
                                TimeStamp = DateTime.UtcNow,
                                IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                                RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                                RequestBody = null,
                                QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                                UserAgent = req.Headers["User-Agent"].ToString()
                            };
                            await _auditService.LogAuditAsync(auditEntry);
                            return new OkObjectResult(statisticsResponseDto);
                        }
                        else
                        {
                            return new BadRequestObjectResult("No statistics found!");
                        }


                    }
                    else
                    {

                        return new BadRequestObjectResult("User is not authorized for this action!");

                    }

                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("GetAllFines")]
        public async Task<IActionResult> GetAllFines([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-all-fines")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);


                        var fines = await _fineService.GetAllFinesAsync();

                        var fineDtos = fines.Select(f => new FineResponseDto
                        {
                            FineId = f.FineId,
                            OffenderId = f.OffenderId,
                            IssuerId = f.IssuerId,
                            VehicleId = f.VehicleId,
                            ViolationId = f.ViolationId,
                            StationId = f.StationId,
                            CourtId = f.CourtId,
                            ViolationDate = f.ViolationDate,
                            DueDate = f.DueDate,
                            District = f.District,
                            Longitude = f.Longitude,
                            Latitude = f.Latitude,
                            Status = f.Status,
                            SectionOfAct = f.Violation?.SectionOfAct,
                            Provision = f.Violation?.Provision,
                            StationName = f.Station?.StationName,
                            FineAmount = f.Violation!.FineAmount
                        }).ToList();

                        var auditEntry = new Audit
                        {
                            UserId = user!.UserId,
                            ApiEndPoint = "get-all-fines",
                            RequestType = "GET",
                            TimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        };
                        await _auditService.LogAuditAsync(auditEntry);

                        return new OkObjectResult(fineDtos);

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetAllFinesToStationAdmin")]
        public async Task<IActionResult> GetAllFinesToStationAdmin([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-all-fines-to-station-admin")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "StationAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        dynamic? data = JsonConvert.DeserializeObject<dynamic>(requestBody);
                        int stationId = (int)(data?.stationId ?? 0);

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);


                        var fines = await _fineService.GetAllFinesByStationIdAsync(stationId);

                        var fineDtos = fines.Select(f => new FineResponseDto
                        {
                            FineId = f.FineId,
                            OffenderId = f.OffenderId,
                            IssuerId = f.IssuerId,
                            VehicleId = f.VehicleId,
                            ViolationId = f.ViolationId,
                            StationId = f.StationId,
                            CourtId = f.CourtId,
                            ViolationDate = f.ViolationDate,
                            DueDate = f.DueDate,
                            District = f.District,
                            Longitude = f.Longitude,
                            Latitude = f.Latitude,
                            Status = f.Status,
                            SectionOfAct = f.Violation?.SectionOfAct,
                            Provision = f.Violation?.Provision,
                            StationName = f.Station?.StationName,
                            FineAmount = f.Violation!.FineAmount
                        }).ToList();

                        var auditEntry = new Audit
                        {
                            UserId = user!.UserId,
                            ApiEndPoint = "get-all-fines-to-station-admin",
                            RequestType = "POST",
                            TimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        };
                        await _auditService.LogAuditAsync(auditEntry);

                        return new OkObjectResult(fineDtos);

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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
        [Function("GetAllFinesToTrafficPolice")]
        public async Task<IActionResult> GetAllFinesToTrafficPolice([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-all-fines-to-traffic-police")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "TrafficPolice")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        dynamic? data = JsonConvert.DeserializeObject<dynamic>(requestBody);

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        var fines = await _fineService.GetFinesByTrafficPoliceUserIdAsync(user!.UserId);

                        var fineDtos = fines.Select(f => new FineResponseDto
                        {
                            FineId = f.FineId,
                            OffenderId = f.OffenderId,
                            IssuerId = f.IssuerId,
                            VehicleId = f.VehicleId,
                            ViolationId = f.ViolationId,
                            StationId = f.StationId,
                            CourtId = f.CourtId,
                            ViolationDate = f.ViolationDate,
                            DueDate = f.DueDate,
                            District = f.District,
                            Longitude = f.Longitude,
                            Latitude = f.Latitude,
                            Status = f.Status,
                            SectionOfAct = f.Violation?.SectionOfAct,
                            Provision = f.Violation?.Provision,
                            StationName = f.Station?.StationName,
                            FineAmount = f.Violation!.FineAmount
                        }).ToList();

                        var auditEntry = new Audit
                        {
                            UserId = user!.UserId,
                            ApiEndPoint = "get-all-fines-to-station-admin",
                            RequestType = "POST",
                            TimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        };
                        await _auditService.LogAuditAsync(auditEntry);

                        return new OkObjectResult(fineDtos);

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetAllFinesToPublicUser")]
        public async Task<IActionResult> GetAllFinesToPublicUser([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-all-fines-to-public-user")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "PublicUser")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        dynamic? data = JsonConvert.DeserializeObject<dynamic>(requestBody);

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        var fines = await _fineService.GetFinesByPublicUserIdAsync(user!.UserId);

                        var fineDtos = fines.Select(f => new FineResponseDto
                        {
                            FineId = f.FineId,
                            OffenderId = f.OffenderId,
                            IssuerId = f.IssuerId,
                            VehicleId = f.VehicleId,
                            ViolationId = f.ViolationId,
                            StationId = f.StationId,
                            CourtId = f.CourtId,
                            ViolationDate = f.ViolationDate,
                            DueDate = f.DueDate,
                            District = f.District,
                            Longitude = f.Longitude,
                            Latitude = f.Latitude,
                            Status = f.Status,
                            SectionOfAct = f.Violation?.SectionOfAct,
                            Provision = f.Violation?.Provision,
                            StationName = f.Station?.StationName,
                            FineAmount = f.Violation!.FineAmount
                        }).ToList();

                        var auditEntry = new Audit
                        {
                            UserId = user!.UserId,
                            ApiEndPoint = "get-all-fines-to-public-user",
                            RequestType = "POST",
                            TimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        };
                        await _auditService.LogAuditAsync(auditEntry);

                        return new OkObjectResult(fineDtos);

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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

        [Function("GetTrafficViolationsToHomePage")]
        public async Task<IActionResult> GetTrafficViolationsToHomePage([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-traffic-violations-to-homepage")] HttpRequest req)
        {
            try
            {



                var trafficViolations = await _trafficViolationService.GetAllTrafficViolationsAsync();


                if (trafficViolations != null)
                {
                    var trafficViolationsDto = trafficViolations.Select(tv => new TrafficViolationResponseDto
                    {
                        ViolationId = tv.ViolationId,
                        SectionOfAct = tv.SectionOfAct,
                        ViolationType = tv.ViolationType,
                        Provision = tv.Provision,
                        FineAmount = tv.FineAmount,
                        DueDays = tv.DueDays,
                        Points = tv.Points
                    }).ToList();

                    return new OkObjectResult(trafficViolationsDto);
                }
                else
                {
                    return new BadRequestObjectResult("No traffic violations found!");
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
        [Function("GetMachineLearningDataset")]
        public async Task<IActionResult> GetMachineLearningDataset([HttpTrigger(AuthorizationLevel.Function, "post", Route = "get-machine-learning-dataset")] HttpRequest req)
        {
            try
            {
                if (!req.Headers.TryGetValue("Authorization", out var token))
                {
                    return new BadRequestObjectResult("Missing Authorization token!");
                }
                token = token.ToString().Replace("Bearer ", "");

                var principal = _jwtService.ValidateJwtToken(token!);

                if (principal != null)
                {
                    var claims = principal.Claims;
                    var userRole = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                    if (userRole == "SystemAdmin")
                    {
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        dynamic? data = JsonConvert.DeserializeObject<dynamic>(requestBody);

                        string? userEmail = _jwtService.GetUserEmailFromToken(token!);
                        User? user = await _userService.GetUserByEmailAsync(userEmail!);

                        // Fetch all fines with related data
                        var fines = await _fineService.GetAllFinesWithAllRelatedDataAsync(); // You must implement this

                        var dataset = fines.Select(f => new MachineLearningDatasetDto
                        {
                            FineId = f.FineId,
                            ViolationDate = f.ViolationDate,
                            DueDate = f.DueDate,
                            FineStatus = f.Status,
                            District = f.District,
                            Longitude = f.Longitude,
                            Latitude = f.Latitude,

                            // Offender Info
                            OffenderId = f.Offender?.UserId,
                            OffenderFirstName = f.Offender?.FirstName,
                            OffenderLastName = f.Offender?.LastName,
                            OffenderGender = f.Offender?.Gender,
                            OffenderDOB = f.Offender?.DateOfBirth,
                            OffenderAddress = f.Offender?.Address,
                            OffenderEmail = f.Offender?.Email,
                            OffenderContactNumber = f.Offender?.ContactNumber,
                            OffenderNicNumber = f.Offender?.NicNumber,
                            OffenderLicenseNumber = f.Offender?.LicenseNumber,
                            OffenderLicenseIssueDate = f.Offender?.LicenseIssueDate,
                            OffenderLicenseExpiryDate = f.Offender?.LicenseExpiryDate,
                            OffenderAvailablePoints = f.Offender?.AvailablePoints,
                            OffenderEligibleVehicleCategories = f.Offender?.User_EligibleVehicleCategories != null
                                                                ? string.Join(", ", f.Offender.User_EligibleVehicleCategories
                                                                    .Select(c => c.EligibleVehicleCategory?.CategoryName)
                                                                    .Where(name => !string.IsNullOrEmpty(name)))
                                                                : string.Empty,


                            // Issuer Info
                            IssuerId = f.Issuer?.UserId,
                            IssuerFirstName = f.Issuer?.FirstName,
                            IssuerLastName = f.Issuer?.LastName,
                            IssuerGender = f.Issuer?.Gender,
                            IssuerNicNumber = f.Issuer?.NicNumber,
                            IssuerLicenseNumber = f.Issuer?.LicenseNumber,
                            IssuerBadgeNumber = f.Issuer?.BadgeNumber,

                            // Violation Info
                            ViolationId = f.Violation?.ViolationId ?? 0,
                            SectionOfAct = f.Violation?.SectionOfAct,
                            ViolationType = f.Violation?.ViolationType,
                            ViolationProvision = f.Violation?.Provision,
                            ViolationFineAmount = f.Violation?.FineAmount ?? 0,
                            ViolationPoints = f.Violation?.Points ?? 0,
                            ViolationDueDays = f.Violation?.DueDays ?? 0,

                            // Vehicle Info
                            VehicleId = f.Vehicle?.VehicleId ?? 0,
                            VehicleNumber = f.Vehicle?.VehicleNumber,
                            VehicleCategory = f.Vehicle?.VehicleCategory,
                            VehicleMake = f.Vehicle?.Make,
                            VehicleModel = f.Vehicle?.Model,
                            VehicleYear = f.Vehicle?.Year.Year ?? 0,
                            VehicleColor = f.Vehicle?.Color,
                            VehicleRegistrationNo = f.Vehicle?.RegistrationNo,
                            VehicleRegistrationDate = f.Vehicle?.RegistrationDate,
                            IsRoadTaxPaid = f.Vehicle?.IsRoadTaxPaid ?? false,
                            IsInsuranced = f.Vehicle?.IsInsuranced ?? false,

                            // Court Info
                            CourtId = f.Court?.CourtId ?? 0,
                            CourtName = f.Court?.CourtName,
                            CourtType = f.Court?.CourtType,
                            CourtLocation = f.Court?.Location,
                            CourtJurisdiction = f.Court?.Jurisdiction,
                            CourtContactNumber = f.Court?.ContactNumber,
                            CourtEstablishedDate = f.Court?.EstablishedDate,

                            // Station Info
                            StationId = f.Station?.StationId ?? 0,
                            StationCode = f.Station?.StationCode,
                            StationName = f.Station?.StationName,
                            StationAddress = f.Station?.Address,
                            StationDistrict = f.Station?.District,
                            StationContactNumber = f.Station?.ContactNumber,
                            StationEmail = f.Station?.Email,

                            // Payment Info
                            PaymentId = f.Payment?.PaymentId,
                            PaymentAmount = f.Payment?.Amount,
                            PaymentDate = f.Payment?.PaymentDate,
                            PaymentMethod = f.Payment?.PaymentMethod,
                            TransactionId = f.Payment?.TransactionId,

                            // Dispute Info
                            DisputeId = f.Dispute?.DisputeId,
                            DisputeReason = f.Dispute?.DisputeReason,
                            DisputeStatus = f.Dispute?.Status,
                            DisputeSubmissionDate = f.Dispute?.SubmissionDate,

                            // Audit Info
                            ApiEndPoint = "get-machine-learning-dataset",
                            AuditId = null,
                            RequestType = "POST",
                            AuditTimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        }).ToList();

                        // Audit log
                        var auditEntry = new Audit
                        {
                            UserId = user!.UserId,
                            ApiEndPoint = "get-machine-learning-dataset",
                            RequestType = "POST",
                            TimeStamp = DateTime.UtcNow,
                            IpAddress = req.HttpContext.Connection.RemoteIpAddress?.ToString(),
                            RequestHeader = JsonConvert.SerializeObject(req.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())),
                            RequestBody = requestBody,
                            QueryParams = JsonConvert.SerializeObject(req.Query.ToDictionary(q => q.Key, q => q.Value.ToString())),
                            UserAgent = req.Headers["User-Agent"].ToString()
                        };
                        await _auditService.LogAuditAsync(auditEntry);

                        return new OkObjectResult(dataset);

                    }
                    else
                    {
                        return new BadRequestObjectResult("User is not authorized for this action!");
                    }
                }
                else
                {
                    return new BadRequestObjectResult("Token is invalid or expired!");
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


    }





}
