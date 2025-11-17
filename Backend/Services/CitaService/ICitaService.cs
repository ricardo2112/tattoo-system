using Backend.Models;

namespace Backend.Services.CitaService
{
    public interface ICitaService
    {
        List<CitaServicio> GetAllCitas();
        CitaServicio GetCitaById(int id);
        CitaServicio CrearCita(CitaServicio cita);
        CitaServicio ActualizarCita(int id, CitaServicio cita);
        bool EliminarCita(int id);
        List<CitaServicio> GetCitasByEstado(string estado);
        List<CitaServicio> GetCitasByFecha(DateTime fecha);
        List<Tatuaje> GetTatuajesByCitaId(int idCita);
    }
}
