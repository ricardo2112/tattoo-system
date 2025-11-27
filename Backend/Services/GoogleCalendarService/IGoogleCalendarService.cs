using Backend.Models;

namespace Backend.Services.GoogleCalendarService
{
    public interface IGoogleCalendarService
    {
        Task<string?> CreateEventAsync(CitaServicio cita, string? clienteEmail = null, string? clienteNombre = null);
        Task<bool> UpdateEventAsync(string eventId, CitaServicio cita, string? clienteEmail = null, string? clienteNombre = null);
        Task<bool> DeleteEventAsync(string eventId);
        Task<bool> IsEnabledAsync();
    }
}
