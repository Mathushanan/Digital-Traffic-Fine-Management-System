using Azure.Core;
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

        public Functions(ILogger<Functions> logger, IPasswordService passwordService, IUserService userService, IJwtService jwtService, IStationService stationService, ITrafficPoliceService trafficPoliceService, ILicenseHolderService licenseHolderService, ITrafficViolationService trafficViolationService)
        {
            _logger = logger;
            this._passwordService = passwordService;
            this._userService = userService;
            this._jwtService = jwtService;
            this._stationService = stationService;
            this._trafficPoliceService = trafficPoliceService;
            this._licenseHolderService = licenseHolderService;
            this._trafficViolationService = trafficViolationService;

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
                                if (stationId > 0)
                                {
                                    return new OkObjectResult("Station registered successfully!");

                                }
                                else
                                {
                                    return new BadRequestObjectResult("Failed to update the station admin's registered station!");
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
                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                            MaxDepth = 32
                        };

                        // Serialize the stations with the custom options
                        var jsonData = System.Text.Json.JsonSerializer.Serialize(stations, jsonOptions);
                        return new OkObjectResult(jsonData);

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
                                if (stationWithRegisteredSationAdmin != null)
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

                        return new OkObjectResult("Station updated successfully!");

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
                        var isUpdated = await _userService.SetRegisteredStationIdToNull(existingStation.StationAdminId!.Value);
                        if (!isUpdated)
                        {
                            return new BadRequestObjectResult("Failed to delete the station!");
                        }

                        bool isDeleted = await _stationService.DeleteStationAsync(existingStation);
                        if (!isDeleted)
                        {
                            return new StatusCodeResult(StatusCodes.Status500InternalServerError);
                        }

                        return new OkObjectResult("Station deleted successfully!");

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
                    if (userRole == "SystemAdmin")
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
                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                            MaxDepth = 32
                        };

                        // Serialize the station admins with the custom options
                        var jsonData = System.Text.Json.JsonSerializer.Serialize(stationAdmins, jsonOptions);
                        return new OkObjectResult(jsonData);

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
                            if (isUpdated==null)
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
                                    return new OkObjectResult("Station deleted successfully!");

                                }

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
                    if (userRole == "SystemAdmin")
                    {
                        // Read and deserialize the JSON request body
                        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                        var data = JsonConvert.DeserializeObject<UserRequestDto>(requestBody);

                        if (data == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body!");
                        }

                        // Accessing deserialized parameters
                        int  userId = data.UserId;
                        string? address = data.Address;
                        string? contactNumber = data.ContactNumber;
                        string? email = data.Email;
                        

                        // Check if the station exists
                        var existingUser = await _userService.GetUserByUserIdAsync(userId);
                        if (existingUser == null)
                        {
                            return new NotFoundObjectResult("User not found!");
                        }

                        if (existingUser.UserType == "StationAdmin")
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

                            return new OkObjectResult("User updated successfully!");
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

                        if (sectionOfAct == null || violationType== null || provision== null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing!");
                        }
                        else
                        {

                            var existingTrafficViolation = await _trafficViolationService.GetTrafficViolationByParametersAsync(sectionOfAct,provision);
                            if (existingTrafficViolation != null)
                            {
                                return new ConflictObjectResult("Traffic Violation already registered with provided parameters!");
                            }
                            else
                            {

                                var newTrafficViolation = new TrafficViolation
                                {
                                    SectionOfAct= sectionOfAct,
                                    ViolationType= violationType,
                                    Provision= provision,
                                    FineAmount= fineAmount,
                                    Points= points,
                                    DueDays= dueDays

                                };
                                int trafficViolationId = await _trafficViolationService.AddTrafficViolationAsync(newTrafficViolation);
                                if (trafficViolationId > 0)
                                {
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
                    if (userRole == "SystemAdmin")
                    {
                        var trafficViolations = await _trafficViolationService.GetAllTrafficViolationsAsync();
                        var jsonOptions = new JsonSerializerOptions
                        {
                            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                            MaxDepth = 32
                        };

                        // Serialize the stations with the custom options
                        var jsonData = System.Text.Json.JsonSerializer.Serialize(trafficViolations, jsonOptions);
                        return new OkObjectResult(jsonData);

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
                            existingTrafficViolation.Provision = provision?? existingTrafficViolation.Provision;
                            existingTrafficViolation.Points = points??existingTrafficViolation.Points;
                            existingTrafficViolation.DueDays = dueDays??existingTrafficViolation.DueDays;
                            existingTrafficViolation.FineAmount = fineAmount??existingTrafficViolation.FineAmount;


                            // Update user in the database
                            var updateResult = await _trafficViolationService.UpdateTrafficViolationAsync(existingTrafficViolation);
                            if (!updateResult)
                            {
                                return new BadRequestObjectResult("Failed to update the traffic violation!");
                            }

                            return new OkObjectResult("Traffic Violation updated successfully!");
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




    }

}
