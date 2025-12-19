using Backend.Context;
using Backend.Models;
using Backend.Services.GoogleCalendarService;
using Backend.Services.LoggingService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.CitaService
{
    public class CitaService : ICitaService
    {
        private readonly TattooDbContext _context;
        private readonly IGoogleCalendarService _googleCalendarService;
        private readonly ILoggingService _logger;

        public CitaService(TattooDbContext context, IGoogleCalendarService googleCalendarService, ILoggingService logger)
        {
            _context = context;
            _googleCalendarService = googleCalendarService;
            _logger = logger;
        }

        public List<CitaServicio> GetAllCitas()
        {
            try
            {
                _logger.LogInformation("Obteniendo todas las citas");
                var citas = _context.CitaServicios
                    .OrderBy(c => c.FechaInicio)
                    .Include(c => c.CitaTatuajes)
                        .ThenInclude(ct => ct.Tatuaje)
                            .ThenInclude(t => t.Cliente)
                    .ToList();
                _logger.LogInformation($"Se obtuvieron {citas.Count} citas exitosamente");
                return citas;
            }
            catch (Exception ex)
            {
                _logger.LogError("Error al obtener las citas", ex);
                throw new Exception("Error al obtener las citas", ex);
            }
        }

        public CitaServicio GetCitaById(int id)
        {
            try
            {
                _logger.LogInformation($"Buscando cita con ID: {id}");
                var cita = _context.CitaServicios
                    .Include(c => c.CitaTatuajes)
                        .ThenInclude(ct => ct.Tatuaje)
                            .ThenInclude(t => t.Cliente)
                    .FirstOrDefault(c => c.IdCita == id);

                if (cita == null)
                {
                    _logger.LogWarning($"No se encontró la cita con ID: {id}");
                    throw new KeyNotFoundException($"La cita con ID {id} no existe");
                }

                _logger.LogInformation($"Cita encontrada: {cita.Titulo} (ID: {id})");
                return cita;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener la cita con ID {id}", ex);
                throw new Exception("Error al obtener la cita", ex);
            }
        }

        public async Task<CitaServicio> CrearCitaAsync(CitaServicio cita, string? clienteEmail = null, string? clienteNombre = null)
        {
            try
            {
                _logger.LogInformation($"Creando nueva cita: {cita.Titulo}", new {
                    FechaInicio = cita.FechaInicio,
                    FechaFin = cita.FechaFin,
                    ClienteEmail = clienteEmail
                });

                // Validar que fecha_inicio sea menor a fecha_fin
                if (cita.FechaInicio >= cita.FechaFin)
                {
                    _logger.LogWarning("Intento de crear cita con fecha de inicio posterior a fecha de fin");
                    throw new InvalidOperationException("La fecha de inicio debe ser anterior a la fecha de fin");
                }

                // Validar que ambas fechas sean del mismo día
                if (cita.FechaInicio.Date != cita.FechaFin.Date)
                {
                    _logger.LogWarning("Intento de crear cita con fechas en días diferentes");
                    throw new InvalidOperationException("Una cita debe realizarse el mismo día. La fecha de inicio y fin deben ser del mismo día.");
                }

                // Calcular duración en minutos automáticamente
                var duracionCalculada = (int)(cita.FechaFin - cita.FechaInicio).TotalMinutes;

                var nuevaCita = new CitaServicio
                {
                    Titulo = cita.Titulo,
                    Descripcion = cita.Descripcion,
                    FechaInicio = cita.FechaInicio,
                    FechaFin = cita.FechaFin,
                    DuracionMinutos = duracionCalculada, // Se calcula automáticamente
                    Zona = string.IsNullOrWhiteSpace(cita.Zona) ? CitaServicio.NOMBRE_ESTUDIO : cita.Zona,
                    Estado = cita.Estado ?? "Confirmada"
                };

                // Guardar primero en la base de datos
                _context.CitaServicios.Add(nuevaCita);
                _context.SaveChanges();
                _logger.LogInformation($"Cita guardada en base de datos con ID: {nuevaCita.IdCita}");

                // Intentar crear evento en Google Calendar
                try
                {
                    _logger.LogInformation($"Sincronizando cita {nuevaCita.IdCita} con Google Calendar");
                    var googleEventId = await _googleCalendarService.CreateEventAsync(nuevaCita, clienteEmail, clienteNombre);
                    if (!string.IsNullOrWhiteSpace(googleEventId))
                    {
                        nuevaCita.GoogleEventId = googleEventId;
                        _context.SaveChanges();
                        _logger.LogInformation($"Cita {nuevaCita.IdCita} sincronizada con Google Calendar. Event ID: {googleEventId}");
                    }
                    else
                    {
                        _logger.LogWarning($"Google Calendar no devolvió un Event ID para la cita {nuevaCita.IdCita}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"No se pudo sincronizar la cita {nuevaCita.IdCita} con Google Calendar: {ex.Message}", ex);
                }

                return nuevaCita;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError("Error al crear la cita", ex, new { Titulo = cita.Titulo, FechaInicio = cita.FechaInicio });
                throw new Exception("Error al crear la cita", ex);
            }
        }

        public async Task<CitaServicio> ActualizarCitaAsync(int id, CitaServicio cita, string? clienteEmail = null, string? clienteNombre = null)
        {
            try
            {
                _logger.LogInformation($"Actualizando cita con ID: {id}");
                var citaExistente = _context.CitaServicios.Find(id);

                if (citaExistente == null)
                {
                    _logger.LogWarning($"Intento de actualizar cita inexistente con ID: {id}");
                    throw new KeyNotFoundException($"La cita con ID {id} no existe");
                }

                // Validar que fecha_inicio sea menor a fecha_fin
                if (cita.FechaInicio >= cita.FechaFin)
                {
                    _logger.LogWarning($"Intento de actualizar cita {id} con fecha de inicio posterior a fecha de fin");
                    throw new InvalidOperationException("La fecha de inicio debe ser anterior a la fecha de fin");
                }

                // Validar que ambas fechas sean del mismo día
                if (cita.FechaInicio.Date != cita.FechaFin.Date)
                {
                    _logger.LogWarning($"Intento de actualizar cita {id} con fechas en días diferentes");
                    throw new InvalidOperationException("Una cita debe realizarse el mismo día. La fecha de inicio y fin deben ser del mismo día.");
                }

                // Calcular duración en minutos automáticamente
                var duracionCalculada = (int)(cita.FechaFin - cita.FechaInicio).TotalMinutes;

                // Actualizar los campos
                citaExistente.Titulo = cita.Titulo;
                citaExistente.Descripcion = cita.Descripcion;
                citaExistente.FechaInicio = cita.FechaInicio;
                citaExistente.FechaFin = cita.FechaFin;
                citaExistente.DuracionMinutos = duracionCalculada; // Se calcula automáticamente
                citaExistente.Zona = string.IsNullOrWhiteSpace(cita.Zona) ? CitaServicio.NOMBRE_ESTUDIO : cita.Zona;
                citaExistente.Estado = cita.Estado ?? citaExistente.Estado;
                citaExistente.FechaActualizacion = DateTime.Now;

                _context.CitaServicios.Update(citaExistente);
                _context.SaveChanges();
                _logger.LogInformation($"Cita {id} actualizada en base de datos");

                // Sincronizar con Google Calendar
                try
                {
                    // Si la cita está cancelada, eliminar del Google Calendar pero mantener en BD
                    if (citaExistente.Estado.ToLower() == "cancelada")
                    {
                        if (!string.IsNullOrWhiteSpace(citaExistente.GoogleEventId))
                        {
                            _logger.LogInformation($"Eliminando evento de Google Calendar para cita cancelada {id}. Event ID: {citaExistente.GoogleEventId}");
                            await _googleCalendarService.DeleteEventAsync(citaExistente.GoogleEventId);
                            // Limpiar el GoogleEventId ya que fue eliminado del calendario
                            citaExistente.GoogleEventId = null;
                            _context.SaveChanges();
                            _logger.LogInformation($"Evento eliminado de Google Calendar para cita {id}. La cita se mantiene en BD para registro.");
                        }
                    }
                    else
                    {
                        // Para estados que no sean cancelada, sincronizar normalmente
                        if (!string.IsNullOrWhiteSpace(citaExistente.GoogleEventId))
                        {
                            _logger.LogInformation($"Actualizando evento de Google Calendar para cita {id}. Event ID: {citaExistente.GoogleEventId}");
                            await _googleCalendarService.UpdateEventAsync(citaExistente.GoogleEventId, citaExistente, clienteEmail, clienteNombre);
                            _logger.LogInformation($"Evento de Google Calendar actualizado para cita {id}");
                        }
                        else
                        {
                            _logger.LogInformation($"Creando nuevo evento de Google Calendar para cita {id}");
                            var googleEventId = await _googleCalendarService.CreateEventAsync(citaExistente, clienteEmail, clienteNombre);
                            if (!string.IsNullOrWhiteSpace(googleEventId))
                            {
                                citaExistente.GoogleEventId = googleEventId;
                                _context.SaveChanges();
                                _logger.LogInformation($"Evento creado en Google Calendar para cita {id}. Event ID: {googleEventId}");
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"No se pudo sincronizar la cita {id} con Google Calendar: {ex.Message}", ex);
                }

                return citaExistente;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al actualizar la cita con ID {id}", ex);
                throw new Exception($"Error al actualizar la cita con ID {id}", ex);
            }
        }


        public List<CitaServicio> GetCitasByEstado(string estado)
        {
            try
            {
                var estadosValidos = new[] { "confirmada", "cancelada" };
                if (!estadosValidos.Contains(estado.ToLower()))
                {
                    throw new InvalidOperationException($"El estado '{estado}' no es válido. Estados válidos: {string.Join(", ", estadosValidos)}");
                }

                var citas = _context.CitaServicios
                    .Where(c => c.Estado.ToLower() == estado.ToLower())
                    .Include(c => c.CitaTatuajes)
                        .ThenInclude(ct => ct.Tatuaje)
                            .ThenInclude(t => t.Cliente)
                    .OrderBy(c => c.FechaInicio)
                    .ToList();

                return citas;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener las citas con estado {estado}", ex);
            }
        }

        public List<CitaServicio> GetCitasByFecha(DateTime fecha)
        {
            try
            {
                var citas = _context.CitaServicios
                    .Where(c => c.FechaInicio.Date == fecha.Date)
                    .Include(c => c.CitaTatuajes)
                        .ThenInclude(ct => ct.Tatuaje)
                            .ThenInclude(t => t.Cliente)
                    .OrderBy(c => c.FechaInicio)
                    .ToList();

                return citas;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener las citas de la fecha {fecha.ToShortDateString()}", ex);
            }
        }

        public List<Tatuaje> GetTatuajesByCitaId(int idCita)
        {
            try
            {
                var citaExiste = _context.CitaServicios.Any(c => c.IdCita == idCita);
                if (!citaExiste)
                {
                    throw new KeyNotFoundException($"La cita con ID {idCita} no existe");
                }

                var tatuajes = _context.CitaTatuajes
                    .Where(ct => ct.IdCita == idCita)
                    .Include(ct => ct.Tatuaje)
                        .ThenInclude(t => t.Cliente)
                    .Select(ct => ct.Tatuaje)
                    .ToList();

                return tatuajes;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener los tatuajes de la cita {idCita}", ex);
            }
        }
    }
}
