using Backend.Context;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.TatuajeService
{
    public class TatuajeService : ITatuajeService
    {
        private readonly TattooDbContext _context;

        public TatuajeService(TattooDbContext context)
        {
            _context = context;
        }

        public List<Tatuaje> GetAllTatuajes()
        {
            try
            {
                var tatuajes = _context.Tatuajes
                    .OrderBy(t => t.IdTatuaje)
                    .Include(t => t.Cliente)
                    .Include(t => t.Usuario)
                    .Include(t => t.PagoTatuajes)
                        .ThenInclude(pt => pt.Pago)
                    .Include(t => t.CitaTatuajes)
                        .ThenInclude(ct => ct.CitaServicio)
                    .ToList();
                return tatuajes;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los tatuajes", ex);
            }
        }

        public Tatuaje GetTatuajeById(int id)
        {
            try
            {
                var tatuaje = _context.Tatuajes
                    .Include(t => t.Cliente)
                    .Include(t => t.Usuario)
                    .Include(t => t.PagoTatuajes)
                        .ThenInclude(pt => pt.Pago)
                    .Include(t => t.CitaTatuajes)
                        .ThenInclude(ct => ct.CitaServicio)
                    .FirstOrDefault(t => t.IdTatuaje == id);

                if (tatuaje == null)
                {
                    throw new KeyNotFoundException($"El tatuaje con ID {id} no existe");
                }

                return tatuaje;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el tatuaje", ex);
            }
        }

        public List<Tatuaje> GetTatuajesByClienteId(int idCliente)
        {
            try
            {
                var clienteExiste = _context.Clientes.Any(c => c.IdCliente == idCliente);
                if (!clienteExiste)
                {
                    throw new KeyNotFoundException($"El cliente con ID {idCliente} no existe");
                }

                var tatuajes = _context.Tatuajes
                    .Where(t => t.IdCliente == idCliente)
                    .Include(t => t.Cliente)
                    .Include(t => t.Usuario)
                    .Include(t => t.PagoTatuajes)
                        .ThenInclude(pt => pt.Pago)
                    .Include(t => t.CitaTatuajes)
                        .ThenInclude(ct => ct.CitaServicio)
                    .ToList();

                return tatuajes;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener los tatuajes del cliente {idCliente}", ex);
            }
        }

        public Tatuaje CrearTatuaje(Tatuaje tatuaje)
        {
            try
            {
                // Validar que el cliente exista
                var clienteExiste = _context.Clientes.Any(c => c.IdCliente == tatuaje.IdCliente);
                if (!clienteExiste)
                {
                    throw new KeyNotFoundException($"El cliente con ID {tatuaje.IdCliente} no existe");
                }

                // Validar que el usuario exista
                var usuarioExiste = _context.Usuarios.Any(u => u.IdUsuario == tatuaje.RegistradoPor);
                if (!usuarioExiste)
                {
                    throw new KeyNotFoundException($"El usuario con ID {tatuaje.RegistradoPor} no existe");
                }

                var nuevoTatuaje = new Tatuaje
                {
                    IdCliente = tatuaje.IdCliente,
                    Artista = tatuaje.Artista,
                    Detalle = tatuaje.Detalle,
                    Precio = tatuaje.Precio,
                    ZonaTatuaje = tatuaje.ZonaTatuaje,
                    Imagen = tatuaje.Imagen,
                    EstadoPago = tatuaje.EstadoPago ?? "parcial",
                    RegistradoPor = tatuaje.RegistradoPor
                };

                _context.Tatuajes.Add(nuevoTatuaje);
                _context.SaveChanges();

                return nuevoTatuaje;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear el tatuaje", ex);
            }
        }

        public Tatuaje ActualizarTatuaje(int id, Tatuaje tatuaje)
        {
            try
            {
                var tatuajeExistente = _context.Tatuajes.Find(id);

                if (tatuajeExistente == null)
                {
                    throw new KeyNotFoundException($"El tatuaje con ID {id} no existe");
                }

                // Actualizar los campos
                tatuajeExistente.Artista = tatuaje.Artista;
                tatuajeExistente.Detalle = tatuaje.Detalle;
                tatuajeExistente.Precio = tatuaje.Precio;
                tatuajeExistente.ZonaTatuaje = tatuaje.ZonaTatuaje;
                tatuajeExistente.Imagen = tatuaje.Imagen;
                tatuajeExistente.EstadoPago = tatuaje.EstadoPago ?? tatuajeExistente.EstadoPago;
                tatuajeExistente.FechaActualizacion = DateTime.Now;

                _context.Tatuajes.Update(tatuajeExistente);
                _context.SaveChanges();

                return tatuajeExistente;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al actualizar el tatuaje con ID {id}", ex);
            }
        }

        public bool EliminarTatuaje(int id)
        {
            try
            {
                var tatuaje = _context.Tatuajes.Find(id);

                if (tatuaje == null)
                {
                    throw new KeyNotFoundException($"El tatuaje con ID {id} no existe");
                }

                _context.Tatuajes.Remove(tatuaje);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al eliminar el tatuaje con ID {id}", ex);
            }
        }

        public PagoTatuaje RegistrarPagoTatuaje(int idTatuaje, int idPago)
        {
            try
            {
                // Validar que el tatuaje exista
                var tatuajeExiste = _context.Tatuajes.Any(t => t.IdTatuaje == idTatuaje);
                if (!tatuajeExiste)
                {
                    throw new KeyNotFoundException($"El tatuaje con ID {idTatuaje} no existe");
                }

                // Validar que el pago exista
                var pagoExiste = _context.Pagos.Any(p => p.IdPago == idPago);
                if (!pagoExiste)
                {
                    throw new KeyNotFoundException($"El pago con ID {idPago} no existe");
                }

                // Validar que la relación no exista ya
                var relacionExiste = _context.PagoTatuajes
                    .Any(pt => pt.IdTatuaje == idTatuaje && pt.IdPago == idPago);
                if (relacionExiste)
                {
                    throw new InvalidOperationException($"El pago {idPago} ya está registrado para el tatuaje {idTatuaje}");
                }

                // Crear la relación
                var pagoTatuaje = new PagoTatuaje
                {
                    IdTatuaje = idTatuaje,
                    IdPago = idPago
                };

                _context.PagoTatuajes.Add(pagoTatuaje);
                _context.SaveChanges();

                // Actualizar estado de pago del tatuaje
                ActualizarEstadoPagoTatuaje(idTatuaje);

                return pagoTatuaje;
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
                throw new Exception($"Error al registrar el pago {idPago} para el tatuaje {idTatuaje}", ex);
            }
        }

        public bool EliminarPagoTatuaje(int idTatuaje, int idPago)
        {
            try
            {
                var pagoTatuaje = _context.PagoTatuajes
                    .FirstOrDefault(pt => pt.IdTatuaje == idTatuaje && pt.IdPago == idPago);

                if (pagoTatuaje == null)
                {
                    throw new KeyNotFoundException($"No existe una relación entre el tatuaje {idTatuaje} y el pago {idPago}");
                }

                _context.PagoTatuajes.Remove(pagoTatuaje);
                _context.SaveChanges();

                // Actualizar estado de pago del tatuaje
                ActualizarEstadoPagoTatuaje(idTatuaje);

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al eliminar el pago {idPago} del tatuaje {idTatuaje}", ex);
            }
        }

        public List<Pago> GetPagosByTatuajeId(int idTatuaje)
        {
            try
            {
                var tatuajeExiste = _context.Tatuajes.Any(t => t.IdTatuaje == idTatuaje);
                if (!tatuajeExiste)
                {
                    throw new KeyNotFoundException($"El tatuaje con ID {idTatuaje} no existe");
                }

                var pagos = _context.PagoTatuajes
                    .Where(pt => pt.IdTatuaje == idTatuaje)
                    .Include(pt => pt.Pago)
                    .Select(pt => pt.Pago)
                    .ToList();

                return pagos;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener los pagos del tatuaje {idTatuaje}", ex);
            }
        }

        public CitaTatuaje AsignarCitaATatuaje(int idTatuaje, int idCita)
        {
            try
            {
                // Validar que el tatuaje exista
                var tatuajeExiste = _context.Tatuajes.Any(t => t.IdTatuaje == idTatuaje);
                if (!tatuajeExiste)
                {
                    throw new KeyNotFoundException($"El tatuaje con ID {idTatuaje} no existe");
                }

                // Validar que la cita exista
                var citaExiste = _context.CitaServicios.Any(c => c.IdCita == idCita);
                if (!citaExiste)
                {
                    throw new KeyNotFoundException($"La cita con ID {idCita} no existe");
                }

                // Validar que no exista ya esta relación específica
                var relacionExiste = _context.CitaTatuajes
                    .Any(ct => ct.IdTatuaje == idTatuaje && ct.IdCita == idCita);
                if (relacionExiste)
                {
                    throw new InvalidOperationException($"La cita {idCita} ya está asignada al tatuaje {idTatuaje}");
                }

                // Crear la relación
                var citaTatuaje = new CitaTatuaje
                {
                    IdTatuaje = idTatuaje,
                    IdCita = idCita
                };

                _context.CitaTatuajes.Add(citaTatuaje);
                _context.SaveChanges();

                return citaTatuaje;
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
                throw new Exception($"Error al asignar la cita {idCita} al tatuaje {idTatuaje}", ex);
            }
        }

        public bool DesasignarCitaDeTatuaje(int idTatuaje, int idCita)
        {
            try
            {
                var citaTatuaje = _context.CitaTatuajes
                    .FirstOrDefault(ct => ct.IdTatuaje == idTatuaje && ct.IdCita == idCita);

                if (citaTatuaje == null)
                {
                    throw new KeyNotFoundException($"No existe una relación entre el tatuaje {idTatuaje} y la cita {idCita}");
                }

                _context.CitaTatuajes.Remove(citaTatuaje);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al desasignar la cita {idCita} del tatuaje {idTatuaje}", ex);
            }
        }

        public List<CitaServicio> GetCitasByTatuajeId(int idTatuaje)
        {
            try
            {
                var tatuajeExiste = _context.Tatuajes.Any(t => t.IdTatuaje == idTatuaje);
                if (!tatuajeExiste)
                {
                    throw new KeyNotFoundException($"El tatuaje con ID {idTatuaje} no existe");
                }

                var citas = _context.CitaTatuajes
                    .Where(ct => ct.IdTatuaje == idTatuaje)
                    .Include(ct => ct.CitaServicio)
                    .Select(ct => ct.CitaServicio)
                    .OrderBy(c => c.FechaInicio)
                    .ToList();

                return citas;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener las citas del tatuaje {idTatuaje}", ex);
            }
        }

        private void ActualizarEstadoPagoTatuaje(int idTatuaje)
        {
            try
            {
                var tatuaje = _context.Tatuajes.Find(idTatuaje);
                if (tatuaje == null || tatuaje.Precio == null) return;

                var totalPagado = _context.PagoTatuajes
                    .Where(pt => pt.IdTatuaje == idTatuaje)
                    .Include(pt => pt.Pago)
                    .Sum(pt => pt.Pago.Monto);

                if (totalPagado == 0)
                {
                    tatuaje.EstadoPago = "pendiente";
                }
                else if (totalPagado >= tatuaje.Precio)
                {
                    tatuaje.EstadoPago = "pagado";
                }
                else
                {
                    tatuaje.EstadoPago = "parcial";
                }

                _context.SaveChanges();
            }
            catch (Exception)
            {
                // Si falla la actualización del estado, no lanzamos excepción
                // para no interrumpir la operación principal
            }
        }
    }
}
