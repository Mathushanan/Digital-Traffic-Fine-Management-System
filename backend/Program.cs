using backend.Data;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.ComponentModel;
using Microsoft.Extensions.Logging;
using backend.Interfaces;
using backend.Services;

var builder = FunctionsApplication.CreateBuilder(args);

var configuration = new ConfigurationBuilder()
    .AddJsonFile("local.settings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .Build();

var AllowedOrigin = Environment.GetEnvironmentVariable("JWT_AUDIENCE");

// Configure CORS to allow a single client URL
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(AllowedOrigin!) 
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Get connection strings
var licenseDbConnection = configuration.GetConnectionString("LICENSE_DATABASE_CONNECTION_STRING");
var trafficDbConnection = configuration.GetConnectionString("TRRAFIC_POLICE_DATABASE_CONNECTION_STRING");
var systemDbConnection = configuration.GetConnectionString("SYSTEM_DATABASE_CONNECTION_STRING");






// Register LicenseDbContext
builder.Services.AddDbContext<LicenseHolderDbContext>(options =>
    options.UseSqlServer(licenseDbConnection).UseLazyLoadingProxies());

// Register TrafficPoliceDbContext
builder.Services.AddDbContext<TrafficPoliceOfficerDbContext>(options =>
    options.UseSqlServer(trafficDbConnection).UseLazyLoadingProxies());

// Register SystemDbContext
builder.Services.AddDbContext<SystemDbContext>(options =>
    options.UseSqlServer(systemDbConnection).UseLazyLoadingProxies());

// Register Services
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IStationService, StationService>();
builder.Services.AddScoped<ITrafficPoliceService, TrafficPoliceService>();
builder.Services.AddScoped<ILicenseHolderService, LicenseHolderService>();
builder.Services.AddScoped<ITrafficViolationService, TrafficViolationService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IUserEligibleVehicleCategoryService, UserEligibleVehicleCategoryService>();
builder.Services.AddScoped<IVehicleRegistrationService, VehicleRegistrationService>();

builder.ConfigureFunctionsWebApplication();

builder.Build().Run();
