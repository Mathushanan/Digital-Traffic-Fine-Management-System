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
        [Function("ValidateJwtToken")]
        public Task<IActionResult> ValidateJwtToken([HttpTrigger(AuthorizationLevel.Function, "post", Route = "validate-jwt-token")] HttpRequest req)
        {


            if (!req.Headers.TryGetValue("Authorization", out var token))
            {
                return Task.FromResult<IActionResult>(new BadRequestObjectResult("Missing Authorization token!"));
            }
            token = token.ToString().Replace("Bearer ", "");

            var principal = _jwtService.ValidateJwtToken(token!);

            if (principal != null)
            {
                Console.WriteLine("Token is valid.");
                var claims = principal.Claims;
                var userType = claims.FirstOrDefault(c => c.Type == "UserType")?.Value;

                return Task.FromResult<IActionResult>(new OkObjectResult(new
                {
                    Message = "Token is valid!",
                    UserType = userType
                }));
            }
            else
            {
                return Task.FromResult<IActionResult>(new BadRequestObjectResult("Token is invalid or expired!"));
            }


        }
        [Function("RegisterStation")]
        public async Task<IActionResult> RegisterStation([HttpTrigger(AuthorizationLevel.Function, "post", Route = "register-station")] HttpRequest req)
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
                if (isValidStationAdmin ==null)
                {
                    return new BadRequestObjectResult("Station Admin not registered yet!");
                }
                else
                {
                    var existingStation = await _stationService.GetStationByParameters(stationCode!, stationName!, contactNumber!, email!,isValidStationAdmin.UserId);
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
                        int stationId=await _stationService.AddStationAsync(newStation);
                        var updatedUser = await _userService.UpdateStationAdminRegisteredStaionId(isValidStationAdmin.UserId, stationId);
                        if (updatedUser==null)
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
        [Function("GetAllStations")]
        public async Task<IActionResult> GetAllStations([HttpTrigger(AuthorizationLevel.Function, "get", Route = "get-all-stations")] HttpRequest req)
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
        }
}
