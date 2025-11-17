using Backend.Context;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.CitaService
{
    public class CitaService : ICitaService
    {
        private readonly TattooDbContext _context;

        public CitaService(TattooDbContext context)
        {
            _context = context;
        }

        public List<CitaServicio> GetAllCitas()
        {
            try
            {
                var citas = _context.CitaServicios
                    .OrderBy(c => c.FechaInicio)
                    .Include(c => c.CitaTatuajes)
                        .ThenInclude(ct => ct.Tatuaje)
                            .ThenInclude(t => t.Cliente)
                    .ToList();
                return citas;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener las citas", ex);
            }
        }

        public CitaServicio GetCitaById(int id)
        {
            try
            {
                var cita = _context.CitaServicios
                    .Include(c => c.CitaTatuajes)
                        .ThenInclude(ct => ct.Tatuaje)
                            .ThenInclude(t => t.Cliente)
                    .FirstOrDefault(c => c.IdCita == id);

                if (cita == null)
                {
                    throw new KeyNotFoundException($"La cita con ID {id} no existe");
                }

                return cita;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener la cita", ex);
            }
        }

        public CitaServicio CrearCita(CitaServicio cita)
        {
            try
            {
                // Validar que fecha_inicio sea menor a fecha_fin
                if (cita.FechaInicio >= cita.FechaFin)
                {
                    throw new InvalidOperationException("La fecha de inicio debe ser anterior a la fecha de fin");
                }

                var nuevaCita = new CitaServicio
                {
                    Titulo = cita.Titulo,
                    Descripcion = cita.Descripcion,
                    FechaInicio = cita.FechaInicio,
                    FechaFin = cita.FechaFin,
                    DuracionMinutos = cita.DuracionMinutos,
                    Zona = cita.Zona,
                    GoogleEventId = cita.GoogleEventId,
                    Estado = cita.Estado ?? "pendiente"
                };

                _context.CitaServicios.Add(nuevaCita);
                _context.SaveChanges();

                return nuevaCita;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear la cita", ex);
            }
        }

        public CitaServicio ActualizarCita(int id, CitaServicio cita)
        {
            try
            {
                var citaExistente = _context.CitaServicios.Find(id);

                if (citaExistente == null)
                {
                    throw new KeyNotFoundException($"La cita con ID {id} no existe");
                }

                // Validar que fecha_inicio sea menor a fecha_fin
                if (cita.FechaInicio >= cita.FechaFin)
                {
                    throw new InvalidOperationException("La fecha de inicio debe ser anterior a la fecha de fin");
                }

                // Actualizar los campos
                citaExistente.Titulo = cita.Titulo;
                citaExistente.Descripcion = cita.Descripcion;
                citaExistente.FechaInicio = cita.FechaInicio;
                citaExistente.FechaFin = cita.FechaFin;
                citaExistente.DuracionMinutos = cita.DuracionMinutos;
                citaExistente.Zona = cita.Zona;
                citaExistente.GoogleEventId = cita.GoogleEventId;
                citaExistente.Estado = cita.Estado ?? citaExistente.Estado;
                citaExistente.FechaActualizacion = DateTime.Now;

                _context.CitaServicios.Update(citaExistente);
                _context.SaveChanges();

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
                throw new Exception($"Error al actualizar la cita con ID {id}", ex);
            }
        }

        public bool EliminarCita(int id)
        {
            try
            {
                var cita = _context.CitaServicios.Find(id);

                if (cita == null)
                {
                    throw new KeyNotFoundException($"La cita con ID {id} no existe");
                }

                _context.CitaServicios.Remove(cita);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al eliminar la cita con ID {id}", ex);
            }
        }

        public List<CitaServicio> GetCitasByEstado(string estado)
        {
            try
            {
                var estadosValidos = new[] { "pendiente", "confirmada", "realizada", "cancelada" };
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
