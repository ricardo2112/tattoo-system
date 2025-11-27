using Backend.DTOs;
using Backend.Models;

namespace Backend.Services.TatuajeService
{
    public interface ITatuajeService
    {
        List<Tatuaje> GetAllTatuajes();
        Tatuaje GetTatuajeById(int id);
        List<Tatuaje> GetTatuajesByClienteId(int idCliente);
        Tatuaje CrearTatuaje(Tatuaje tatuaje);
        Tatuaje ActualizarTatuaje(int id, Tatuaje tatuaje);
        bool EliminarTatuaje(int id);
        PagoTatuaje RegistrarPagoTatuaje(int idTatuaje, int idPago);
        bool EliminarPagoTatuaje(int idTatuaje, int idPago);
        List<Pago> GetPagosByTatuajeId(int idTatuaje);
        CitaTatuaje AsignarCitaATatuaje(int idTatuaje, int idCita);
        bool DesasignarCitaDeTatuaje(int idTatuaje, int idCita);
        List<CitaServicio> GetCitasByTatuajeId(int idTatuaje);

        // Nuevo método para registro completo de tatuaje
        Task<RegistroTatuajeResponseDto> RegistrarTatuajeCompletoAsync(RegistroTatuajeDto dto);
    }
}
