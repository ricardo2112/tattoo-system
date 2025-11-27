using Backend.Models;
using Backend.Services.LoggingService;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using Microsoft.Extensions.Options;

namespace Backend.Services.GoogleCalendarService
{
    public class GoogleCalendarService : IGoogleCalendarService
    {
        private readonly GoogleCalendarSettings _settings;
        private readonly ILogger<GoogleCalendarService> _systemLogger;
        private readonly ILoggingService _logger;
        private readonly string[] _scopes = { CalendarService.Scope.Calendar };

        public GoogleCalendarService(IOptions<GoogleCalendarSettings> settings, ILogger<GoogleCalendarService> systemLogger, ILoggingService logger)
        {
            _settings = settings.Value;
            _systemLogger = systemLogger;
            _logger = logger;
        }

        private async Task<CalendarService?> GetCalendarServiceAsync()
        {
            try
            {
                if (!_settings.Enabled)
                {
                    _logger.LogInformation("Google Calendar está deshabilitado en la configuración");
                    return null;
                }

                _logger.LogDebug($"Inicializando servicio de Google Calendar. UseServiceAccount: {_settings.UseServiceAccount}");

                // Usar Service Account (recomendado para producción)
                if (_settings.UseServiceAccount)
                {
                    return GetCalendarServiceWithServiceAccount();
                }

                // Usar OAuth2 (para desarrollo local)
                return await GetCalendarServiceWithOAuth2Async();
            }
            catch (Exception ex)
            {
                _logger.LogError("Error al inicializar el servicio de Google Calendar", ex);
                return null;
            }
        }

        private CalendarService? GetCalendarServiceWithServiceAccount()
        {
            try
            {
                _logger.LogInformation("Intentando autenticación con Service Account");
                if (!File.Exists(_settings.ServiceAccountKeyPath))
                {
                    _logger.LogWarning($"No se encuentra el archivo de Service Account en: {_settings.ServiceAccountKeyPath}");
                    return null;
                }

                GoogleCredential credential;
                using (var stream = new FileStream(_settings.ServiceAccountKeyPath, FileMode.Open, FileAccess.Read))
                {
                    credential = GoogleCredential.FromStream(stream)
                        .CreateScoped(_scopes);
                }

                _logger.LogInformation("Autenticación con Service Account exitosa");
                return new CalendarService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = _settings.ApplicationName,
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error al inicializar con Service Account", ex);
                return null;
            }
        }

        private async Task<CalendarService?> GetCalendarServiceWithOAuth2Async()
        {
            try
            {
                _logger.LogInformation("Intentando autenticación con OAuth2");
                if (!File.Exists(_settings.CredentialsPath))
                {
                    _logger.LogWarning($"No se encuentra el archivo de credenciales OAuth2 en: {_settings.CredentialsPath}");
                    return null;
                }

                _logger.LogInformation($"Archivo de credenciales encontrado: {_settings.CredentialsPath}");
                UserCredential credential;
                using (var stream = new FileStream(_settings.CredentialsPath, FileMode.Open, FileAccess.Read))
                {
                    var clientSecrets = GoogleClientSecrets.FromStream(stream).Secrets;
                    _logger.LogInformation($"Client ID cargado: {clientSecrets.ClientId}");

                    credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
                        clientSecrets,
                        _scopes,
                        "user",
                        CancellationToken.None,
                        new FileDataStore(_settings.TokenPath, true));
                }

                _logger.LogInformation("Autenticación OAuth2 exitosa");

                return new CalendarService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = _settings.ApplicationName,
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error al inicializar con OAuth2", ex);
                return null;
            }
        }

        public async Task<string?> CreateEventAsync(CitaServicio cita, string? clienteEmail = null, string? clienteNombre = null)
        {
            try
            {
                _logger.LogInformation($"Creando evento en Google Calendar para cita: {cita.Titulo}", new {
                    CitaId = cita.IdCita,
                    FechaInicio = cita.FechaInicio,
                    ClienteEmail = clienteEmail
                });

                var service = await GetCalendarServiceAsync();
                if (service == null)
                {
                    _logger.LogWarning("No se pudo crear el evento: servicio no disponible");
                    return null;
                }

                var newEvent = new Event
                {
                    Summary = cita.Titulo ?? "Cita en estudio de tatuajes",
                    Description = cita.Descripcion,
                    Start = new EventDateTime
                    {
                        DateTime = cita.FechaInicio,
                        TimeZone = CitaServicio.ZONA_HORARIA_ESTUDIO,
                    },
                    End = new EventDateTime
                    {
                        DateTime = cita.FechaFin,
                        TimeZone = CitaServicio.ZONA_HORARIA_ESTUDIO,
                    },
                    Reminders = new Event.RemindersData
                    {
                        UseDefault = false,
                        Overrides = new[]
                        {
                            // NOTIFICACIONES POR EMAIL COMENTADAS - No enviar emails a clientes
                            // new EventReminder { Method = "email", Minutes = 24 * 60 },
                            new EventReminder { Method = "popup", Minutes = 30 },
                        }
                    }
                };

                // Agregar ubicación si está disponible
                if (!string.IsNullOrWhiteSpace(cita.Zona))
                {
                    newEvent.Location = cita.Zona;
                }

                // CÓDIGO COMENTADO - No agregar invitados para evitar envío de emails automáticos
                // Agregar invitado si se proporciona email
                // if (!string.IsNullOrWhiteSpace(clienteEmail))
                // {
                //     newEvent.Attendees = new[]
                //     {
                //         new EventAttendee
                //         {
                //             Email = clienteEmail,
                //             DisplayName = clienteNombre,
                //             ResponseStatus = "needsAction"
                //         }
                //     };
                // }

                // Agregar color según el tipo de cita
                // Citas de consulta (20 minutos) en azul, citas de servicio en verde
                if (cita.DuracionMinutos > 59)
                {
                    newEvent.ColorId = "9"; // Azul
                }
                else
                {
                    newEvent.ColorId = "10"; // Verde
                }

                var request = service.Events.Insert(newEvent, _settings.CalendarId);
                // NOTIFICACIONES COMENTADAS - No enviar actualizaciones por email a clientes
                // request.SendUpdates = EventsResource.InsertRequest.SendUpdatesEnum.All;
                request.SendUpdates = EventsResource.InsertRequest.SendUpdatesEnum.None;

                _logger.LogDebug($"Enviando petición a Google Calendar API para crear evento");
                var createdEvent = await request.ExecuteAsync();

                _logger.LogInformation($"Evento creado exitosamente en Google Calendar. Event ID: {createdEvent.Id}", new {
                    CitaId = cita.IdCita,
                    GoogleEventId = createdEvent.Id,
                    HtmlLink = createdEvent.HtmlLink
                });
                return createdEvent.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear evento en Google Calendar para cita ID {cita.IdCita}", ex, new {
                    CitaId = cita.IdCita,
                    Titulo = cita.Titulo
                });
                return null;
            }
        }

        public async Task<bool> UpdateEventAsync(string eventId, CitaServicio cita, string? clienteEmail = null, string? clienteNombre = null)
        {
            try
            {
                _logger.LogInformation($"Actualizando evento en Google Calendar. Event ID: {eventId}", new {
                    CitaId = cita.IdCita,
                    Titulo = cita.Titulo
                });

                var service = await GetCalendarServiceAsync();
                if (service == null)
                {
                    _logger.LogWarning("No se pudo actualizar el evento: servicio no disponible");
                    return false;
                }

                if (string.IsNullOrWhiteSpace(eventId))
                {
                    _logger.LogWarning("No se puede actualizar: ID de evento de Google Calendar no proporcionado");
                    return false;
                }

                var existingEvent = await service.Events.Get(_settings.CalendarId, eventId).ExecuteAsync();
                if (existingEvent == null)
                {
                    _logger.LogWarning($"No se encontró el evento con ID: {eventId}");
                    return false;
                }

                existingEvent.Summary = cita.Titulo ?? "Cita en estudio de tatuajes";
                existingEvent.Description = cita.Descripcion;
                existingEvent.Start = new EventDateTime
                {
                    DateTime = cita.FechaInicio,
                    TimeZone = CitaServicio.ZONA_HORARIA_ESTUDIO,
                };
                existingEvent.End = new EventDateTime
                {
                    DateTime = cita.FechaFin,
                    TimeZone = CitaServicio.ZONA_HORARIA_ESTUDIO,
                };

                // Actualizar ubicación
                existingEvent.Location = !string.IsNullOrWhiteSpace(cita.Zona) ? cita.Zona : null;

                // CÓDIGO COMENTADO - No actualizar invitados para evitar envío de emails automáticos
                // Actualizar invitado
                // if (!string.IsNullOrWhiteSpace(clienteEmail))
                // {
                //     existingEvent.Attendees = new[]
                //     {
                //         new EventAttendee
                //         {
                //             Email = clienteEmail,
                //             DisplayName = clienteNombre,
                //             ResponseStatus = "needsAction"
                //         }
                //     };
                // }

                // Actualizar color según duración
                if (cita.DuracionMinutos > 59)
                {
                    existingEvent.ColorId = "9"; // Azul
                }
                else
                {
                    existingEvent.ColorId = "10"; // Verde
                }

                var request = service.Events.Update(existingEvent, _settings.CalendarId, eventId);
                // NOTIFICACIONES COMENTADAS - No enviar actualizaciones por email a clientes
                // request.SendUpdates = EventsResource.UpdateRequest.SendUpdatesEnum.All;
                request.SendUpdates = EventsResource.UpdateRequest.SendUpdatesEnum.None;
                await request.ExecuteAsync();

                _logger.LogInformation($"Evento actualizado exitosamente en Google Calendar. Event ID: {eventId}", new {
                    CitaId = cita.IdCita,
                    GoogleEventId = eventId
                });
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al actualizar evento {eventId} en Google Calendar", ex, new {
                    CitaId = cita.IdCita,
                    GoogleEventId = eventId
                });
                return false;
            }
        }

        public async Task<bool> DeleteEventAsync(string eventId)
        {
            try
            {
                _logger.LogInformation($"Eliminando evento en Google Calendar. Event ID: {eventId}");

                var service = await GetCalendarServiceAsync();
                if (service == null)
                {
                    _logger.LogWarning("No se pudo eliminar el evento: servicio no disponible");
                    return false;
                }

                if (string.IsNullOrWhiteSpace(eventId))
                {
                    _logger.LogWarning("No se puede eliminar: ID de evento de Google Calendar no proporcionado");
                    return false;
                }

                var request = service.Events.Delete(_settings.CalendarId, eventId);
                // NOTIFICACIONES COMENTADAS - No enviar notificaciones de cancelación por email a clientes
                // request.SendUpdates = EventsResource.DeleteRequest.SendUpdatesEnum.All;
                request.SendUpdates = EventsResource.DeleteRequest.SendUpdatesEnum.None;
                await request.ExecuteAsync();

                _logger.LogInformation($"Evento eliminado exitosamente en Google Calendar. Event ID: {eventId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al eliminar evento {eventId} en Google Calendar", ex, new {
                    GoogleEventId = eventId
                });
                return false;
            }
        }

        public Task<bool> IsEnabledAsync()
        {
            return Task.FromResult(_settings.Enabled && File.Exists(_settings.CredentialsPath));
        }
    }
}
