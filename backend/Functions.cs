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

        public Functions(ILogger<Functions> logger, IPasswordService passwordService, IUserService userService, IJwtService jwtService, IStationService stationService)
        {
            _logger = logger;
            this._passwordService = passwordService;
            this._userService = userService;
            this._jwtService = jwtService;
            this._stationService = stationService;
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
                            var existingUser = await _userService.GetUserByParameters(email!, nicNumber!, licenseNumber!, badgeNumber ?? 0);

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

            var existingUser = await _userService.GetUserByEmail(email!);
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
                        int? stationAdminBadgeNumber = data.StationAdminBadgeNumber;

                        if (stationCode == null || stationName == null || address == null || district == null || contactNumber == null || email == null || stationAdminBadgeNumber == null)
                        {
                            return new BadRequestObjectResult("Invalid JSON request body. Required fields are missing!");
                        }
                        else
                        {
                            var isValidStationAdmin = await _userService.GetStationAdminByBadgeNumber(stationAdminBadgeNumber.Value);
                            if (isValidStationAdmin == null)
                            {
                                return new BadRequestObjectResult("Station Admin not registered yet!");
                            }
                            else
                            {
                                var existingStation = await _stationService.GetStationByParameters(stationCode!, stationName!, contactNumber!, email!, isValidStationAdmin.UserId);
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
                                        StationAdminId = isValidStationAdmin.UserId
                                    };
                                    int stationId = await _stationService.AddStationAsync(newStation);
                                    var updatedUser = await _userService.UpdateStationAdminRegisteredStaionId(isValidStationAdmin.UserId, stationId);
                                    if (updatedUser == null)
                                    {
                                        return new BadRequestObjectResult("Failed to update the station admin's registered station!");
                                    }
                                    else
                                    {
                                        return new OkObjectResult("Station registered successfully!");
                                    }

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
                        var existingStation = await _stationService.GetStationByCode(stationCode);
                        if (existingStation == null)
                        {
                            return new NotFoundObjectResult("Station not found!");
                        }

                        // If a new StationAdminBadgeNumber is provided, verify its validity
                        if (stationAdminBadgeNumber.HasValue)
                        {
                            var isValidStationAdmin = await _userService.GetStationAdminByBadgeNumber(stationAdminBadgeNumber.Value);
                            if (isValidStationAdmin == null)
                            {
                                return new BadRequestObjectResult("Station Admin not registered yet!");
                            }
                            existingStation.StationAdminId = isValidStationAdmin.UserId;
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

                        var existingStation = await _stationService.GetStationByCode(stationCode);
                        if (existingStation == null)
                        {
                            return new NotFoundObjectResult("Station not found!");
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

    }

}
