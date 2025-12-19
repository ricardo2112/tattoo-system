using Backend.Authentication;
using Backend.Context;
using Backend.Models;
using Backend.Services.AuthenticationService;
using Backend.Services.CatalogoService;
using Backend.Services.CitaService;
using Backend.Services.ClienteService;
using Backend.Services.CountryService;
using Backend.Services.FormularioService;
using Backend.Services.GoogleCalendarService;
using Backend.Services.LoggingService;
using Backend.Services.PagoService;
using Backend.Services.TatuajeService;
using Backend.Services.TutorService;
using Backend.Services.UsuarioService;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "TattooSystem")
    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss}] [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/tattoo-system-.log",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss}] [{Level:u3}] [{SourceContext}] {Message:lj}{NewLine}{Exception}",
        retainedFileCountLimit: 30,
        fileSizeLimitBytes: 10_000_000,
        rollOnFileSizeLimit: true)
    .CreateLogger();

builder.Host.UseSerilog();

// Google Calendar
builder.Services.Configure<GoogleCalendarSettings>(
    builder.Configuration.GetSection("GoogleCalendar"));

// Base de datos
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<TattooDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

//Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });

    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });

});

// Servicios
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IJWTAuthentication, JWTAuthentication>();
builder.Services.AddScoped<ICatalogoService, CatalogoService>();
builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<ITutorService, TutorService>();
builder.Services.AddScoped<ITatuajeService, TatuajeService>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<IGoogleCalendarService, GoogleCalendarService>();
builder.Services.AddScoped<ICitaService, CitaService>();
builder.Services.AddScoped<IFormularioService, FormularioService>();
builder.Services.AddScoped<ILoggingService, LoggingService>();

// Servicios externos
builder.Services.AddHttpClient<ICountryService, CountryService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

try
{
    Log.Information("Aplicación iniciada correctamente");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "La aplicación terminó inesperadamente");
}
finally
{
    Log.CloseAndFlush();
}
