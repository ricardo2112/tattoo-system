using Backend.Models;

namespace Backend.Services.PagoService
{
    public interface IPagoService
    {
        List<Pago> GetAllPagos();
        Pago GetPagoById(int id);
        Pago CrearPago(Pago pago);
        Pago ActualizarPago(int id, Pago pago);
        bool EliminarPago(int id);
        List<Tatuaje> GetTatuajesByPagoId(int idPago);
    }
}
