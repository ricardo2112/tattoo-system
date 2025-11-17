using Backend.Context;
using Backend.Services.CatalogoService;
using Backend.Services.CitaService;
using Backend.Services.ClienteService;
using Backend.Services.PagoService;
using Backend.Services.TatuajeService;
using Backend.Services.TutorService;
using Backend.Services.UsuarioService;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Base de datos
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<TattooDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Servicios
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<ICatalogoService, CatalogoService>();
builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<ITutorService, TutorService>();
builder.Services.AddScoped<ITatuajeService, TatuajeService>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<ICitaService, CitaService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
