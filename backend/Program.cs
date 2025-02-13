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

// Get connection strings
var licenseDbConnection = configuration.GetConnectionString("LICENSE_DATABASE_CONNECTION_STRING");
var trafficDbConnection = configuration.GetConnectionString("TRRAFIC_POLICE_DATABASE_CONNECTION_STRING");
var systemDbConnection = configuration.GetConnectionString("SYSTEM_DATABASE_CONNECTION_STRING");

// Register LicenseDbContext
builder.Services.AddDbContext<LicenseHolderDbContext>(options =>
    options.UseSqlServer(licenseDbConnection));

// Register TrafficPoliceDbContext
builder.Services.AddDbContext<TrafficPoliceOfficerDbContext>(options =>
    options.UseSqlServer(trafficDbConnection));

// Register SystemDbContext
builder.Services.AddDbContext<SystemDbContext>(options =>
    options.UseSqlServer(systemDbConnection));

// Register Services
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.ConfigureFunctionsWebApplication();

builder.Build().Run();
