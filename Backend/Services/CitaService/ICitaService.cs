using Backend.Models;

namespace Backend.Services.CitaService
{
    public interface ICitaService
    {
        List<CitaServicio> GetAllCitas();
        CitaServicio GetCitaById(int id);
        Task<CitaServicio> CrearCitaAsync(CitaServicio cita, string? clienteEmail = null, string? clienteNombre = null);
        Task<CitaServicio> ActualizarCitaAsync(int id, CitaServicio cita, string? clienteEmail = null, string? clienteNombre = null);
        List<CitaServicio> GetCitasByEstado(string estado);
        List<CitaServicio> GetCitasByFecha(DateTime fecha);
        List<Tatuaje> GetTatuajesByCitaId(int idCita);
    }
}
