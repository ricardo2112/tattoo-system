using Backend.Context;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.PagoService
{
    public class PagoService : IPagoService
    {
        private readonly TattooDbContext _context;

        public PagoService(TattooDbContext context)
        {
            _context = context;
        }

        public List<Pago> GetAllPagos()
        {
            try
            {
                var pagos = _context.Pagos
                    .OrderBy(p => p.IdPago)
                    .Include(p => p.PagoTatuajes)
                        .ThenInclude(pt => pt.Tatuaje)
                    .ToList();
                return pagos;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los pagos", ex);
            }
        }

        public Pago GetPagoById(int id)
        {
            try
            {
                var pago = _context.Pagos
                    .Include(p => p.PagoTatuajes)
                        .ThenInclude(pt => pt.Tatuaje)
                    .FirstOrDefault(p => p.IdPago == id);

                if (pago == null)
                {
                    throw new KeyNotFoundException($"El pago con ID {id} no existe");
                }

                return pago;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el pago", ex);
            }
        }

        public Pago CrearPago(Pago pago)
        {
            try
            {
                // Validar que el monto sea positivo
                if (pago.Monto <= 0)
                {
                    throw new InvalidOperationException("El monto del pago debe ser mayor a cero");
                }

                var nuevoPago = new Pago
                {
                    Monto = pago.Monto,
                    FormaPago = pago.FormaPago,
                    FechaPago = pago.FechaPago ?? DateTime.Now
                };

                _context.Pagos.Add(nuevoPago);
                _context.SaveChanges();

                return nuevoPago;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear el pago", ex);
            }
        }

        public Pago ActualizarPago(int id, Pago pago)
        {
            try
            {
                var pagoExistente = _context.Pagos.Find(id);

                if (pagoExistente == null)
                {
                    throw new KeyNotFoundException($"El pago con ID {id} no existe");
                }

                // Validar que el monto sea positivo
                if (pago.Monto <= 0)
                {
                    throw new InvalidOperationException("El monto del pago debe ser mayor a cero");
                }

                // Actualizar los campos
                pagoExistente.Monto = pago.Monto;
                pagoExistente.FormaPago = pago.FormaPago;
                pagoExistente.FechaPago = pago.FechaPago;

                _context.Pagos.Update(pagoExistente);
                _context.SaveChanges();

                return pagoExistente;
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
                throw new Exception($"Error al actualizar el pago con ID {id}", ex);
            }
        }

        public bool EliminarPago(int id)
        {
            try
            {
                var pago = _context.Pagos.Find(id);

                if (pago == null)
                {
                    throw new KeyNotFoundException($"El pago con ID {id} no existe");
                }

                _context.Pagos.Remove(pago);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al eliminar el pago con ID {id}", ex);
            }
        }

        public List<Tatuaje> GetTatuajesByPagoId(int idPago)
        {
            try
            {
                var pagoExiste = _context.Pagos.Any(p => p.IdPago == idPago);
                if (!pagoExiste)
                {
                    throw new KeyNotFoundException($"El pago con ID {idPago} no existe");
                }

                var tatuajes = _context.PagoTatuajes
                    .Where(pt => pt.IdPago == idPago)
                    .Include(pt => pt.Tatuaje)
                        .ThenInclude(t => t.Cliente)
                    .Select(pt => pt.Tatuaje)
                    .ToList();

                return tatuajes;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener los tatuajes del pago {idPago}", ex);
            }
        }
    }
}
