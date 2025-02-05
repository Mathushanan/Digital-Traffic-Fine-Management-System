using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = FunctionsApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// Register MyService
//builder.Services.AddSingleton<IMyService, MyService>();

// Register MyDbContext with SQL Server, using the connection string from configuration
//var connectionString = configuration.GetConnectionString("SqlConnectionString");
//builder.Services.AddDbContext<MyDbContext>(options =>
  //  options.UseSqlServer(connectionString));

builder.ConfigureFunctionsWebApplication();


builder.Build().Run();
