using Backend.Context;
using Backend.DTOs;
using Backend.Models;
using Backend.Services.ClienteService;
using Backend.Services.CitaService;
using Backend.Services.FormularioService;
using Backend.Services.TutorService;
using Backend.Services.PagoService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.TatuajeService
{
    public class TatuajeService : ITatuajeService
    {
        private readonly TattooDbContext _context;
        private readonly IClienteService _clienteService;
        private readonly ICitaService _citaService;
        private readonly ITutorService _tutorService;
        private readonly IFormularioService _formularioService;
        private readonly IPagoService _pagoService;
        private const int EDAD_MAYORIA = 18;

        public TatuajeService(
            TattooDbContext context,
            IClienteService clienteService,
            ICitaService citaService,
            ITutorService tutorService,
            IFormularioService formularioService,
            IPagoService pagoService)
        {
            _context = context;
            _clienteService = clienteService;
            _citaService = citaService;
            _tutorService = tutorService;
            _formularioService = formularioService;
            _pagoService = pagoService;
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
                Console.WriteLine($"CrearTatuaje - IdCliente: {tatuaje.IdCliente}, RegistradoPor: {tatuaje.RegistradoPor}");

                // Validar que el cliente exista
                var clienteExiste = _context.Clientes.Any(c => c.IdCliente == tatuaje.IdCliente);
                if (!clienteExiste)
                {
                    Console.WriteLine($"ERROR: El cliente con ID {tatuaje.IdCliente} no existe");
                    throw new KeyNotFoundException($"El cliente con ID {tatuaje.IdCliente} no existe");
                }

                // Validar que el usuario exista
                var usuarioExiste = _context.Usuarios.Any(u => u.IdUsuario == tatuaje.RegistradoPor);
                if (!usuarioExiste)
                {
                    Console.WriteLine($"ERROR: El usuario con ID {tatuaje.RegistradoPor} no existe");
                    Console.WriteLine($"Usuarios disponibles: {string.Join(", ", _context.Usuarios.Select(u => u.IdUsuario).ToList())}");
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

        /// <summary>
        /// Método principal para registrar un tatuaje completo con cliente, tutor (si es menor), cita y formulario
        /// </summary>
        public async Task<RegistroTatuajeResponseDto> RegistrarTatuajeCompletoAsync(RegistroTatuajeDto dto)
        {
            Console.WriteLine("=== SERVICE: RegistrarTatuajeCompletoAsync ===");
            Console.WriteLine($"DTO.RegistradoPor: {dto.RegistradoPor}");
            Console.WriteLine($"DTO.Cliente.IdCliente: {dto.Cliente.IdCliente}");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. GESTIÓN DEL CLIENTE (existente o nuevo)
                Cliente cliente;
                if (dto.Cliente.IdCliente.HasValue && dto.Cliente.IdCliente.Value > 0)
                {
                    Console.WriteLine($"Buscando cliente existente con ID: {dto.Cliente.IdCliente.Value}");
                    // Cliente existente
                    cliente = _clienteService.GetClienteById(dto.Cliente.IdCliente.Value);
                    Console.WriteLine($"Cliente encontrado: {cliente.Nombre} {cliente.Apellido}");
                }
                else
                {
                    Console.WriteLine("Creando nuevo cliente...");
                    // Crear nuevo cliente
                    var nuevoCliente = new Cliente
                    {
                        Identificacion = dto.Cliente.Identificacion,
                        Nombre = dto.Cliente.Nombre,
                        Apellido = dto.Cliente.Apellido,
                        FechaNacimiento = dto.Cliente.FechaNacimiento,
                        Nacionalidad = dto.Cliente.Nacionalidad,
                        Telefono = dto.Cliente.Telefono,
                        Email = dto.Cliente.Email,
                        Redes = dto.Cliente.Redes,
                        CondicionMedica = dto.Cliente.CondicionMedica,
                        EnfermedadPiel = dto.Cliente.EnfermedadPiel,
                        Deporte = dto.Cliente.Deporte,
                        Referencia = dto.Cliente.Referencia,
                        Observaciones = dto.Cliente.Observaciones
                    };
                    cliente = _clienteService.CrearCliente(nuevoCliente);
                    Console.WriteLine($"Nuevo cliente creado con ID: {cliente.IdCliente}");
                }

                // 2. VERIFICAR EDAD Y GESTIONAR TUTOR SI ES NECESARIO
                bool esMenorDeEdad = false;
                Tutor? tutor = null;

                if (cliente.FechaNacimiento.HasValue)
                {
                    int edad = CalcularEdad(cliente.FechaNacimiento.Value);
                    esMenorDeEdad = edad < EDAD_MAYORIA;

                    if (esMenorDeEdad)
                    {
                        if (dto.Tutor == null)
                        {
                            throw new InvalidOperationException(
                                $"El cliente es menor de edad ({edad} años). Se requiere un tutor."
                            );
                        }

                        // Gestionar tutor (existente o nuevo)
                        if (dto.Tutor.IdTutor.HasValue && dto.Tutor.IdTutor.Value > 0)
                        {
                            tutor = _tutorService.GetTutorById(dto.Tutor.IdTutor.Value);
                        }
                        else
                        {
                            var nuevoTutor = new Tutor
                            {
                                Identificacion = dto.Tutor.Identificacion,
                                Nombre = dto.Tutor.Nombre,
                                Apellido = dto.Tutor.Apellido,
                                Parentezco = dto.Tutor.Parentezco
                            };
                            tutor = _tutorService.CrearTutor(nuevoTutor);
                        }

                        // Asignar tutor al cliente si no está ya asignado
                        var tutoresCliente = _clienteService.GetTutoresByClienteId(cliente.IdCliente);
                        if (!tutoresCliente.Any(t => t.IdTutor == tutor.IdTutor))
                        {
                            _clienteService.AsignarTutorACliente(cliente.IdCliente, tutor.IdTutor);
                        }
                    }
                }

                // 3. CREAR EL TATUAJE
                Console.WriteLine($"Creando tatuaje con RegistradoPor: {dto.RegistradoPor}");
                var tatuaje = new Tatuaje
                {
                    IdCliente = cliente.IdCliente,
                    Artista = dto.Tatuaje.Artista,
                    Detalle = dto.Tatuaje.Detalle,
                    Precio = dto.Tatuaje.Precio,
                    ZonaTatuaje = dto.Tatuaje.ZonaTatuaje,
                    Imagen = dto.Tatuaje.Imagen,
                    EstadoPago = dto.Tatuaje.EstadoPago,
                    RegistradoPor = dto.RegistradoPor
                };
                Console.WriteLine($"Tatuaje.RegistradoPor antes de crear: {tatuaje.RegistradoPor}");
                var tatuajeCreado = CrearTatuaje(tatuaje);
                Console.WriteLine($"Tatuaje creado con ID: {tatuajeCreado.IdTatuaje}");

                // 4. CREAR LA CITA
                var cita = new CitaServicio
                {
                    Titulo = dto.Cita.Titulo ?? $"Tatuaje - {cliente.Nombre} {cliente.Apellido}",
                    Descripcion = dto.Cita.Descripcion ?? dto.Tatuaje.Detalle,
                    FechaInicio = dto.Cita.FechaInicio,
                    FechaFin = dto.Cita.FechaFin,
                    DuracionMinutos = dto.Cita.DuracionMinutos,
                    Zona = dto.Cita.Zona ?? dto.Tatuaje.ZonaTatuaje,
                    Estado = "Confirmada"
                };

                // Crear la cita (puede incluir sincronización con Google Calendar)
                var citaCreada = await _citaService.CrearCitaAsync(
                    cita,
                    cliente.Email,
                    $"{cliente.Nombre} {cliente.Apellido}"
                );

                // 5. ASOCIAR CITA AL TATUAJE
                AsignarCitaATatuaje(tatuajeCreado.IdTatuaje, citaCreada.IdCita);

                // 6. CREAR Y ASOCIAR PAGO SI HAY ABONO
                Pago? pagoCreado = null;
                if (dto.Pago != null && dto.Pago.Monto > 0)
                {
                    var pago = new Pago
                    {
                        Monto = dto.Pago.Monto,
                        FormaPago = dto.Pago.FormaPago ?? "Efectivo",
                        FechaPago = dto.Pago.FechaPago ?? DateTime.Now
                    };

                    pagoCreado = _pagoService.CrearPago(pago);

                    // Asociar el pago al tatuaje mediante PagoTatuaje
                    RegistrarPagoTatuaje(tatuajeCreado.IdTatuaje, pagoCreado.IdPago);
                }

                // 7. OBTENER EL FORMULARIO SEGÚN LA EDAD
                string eventoFormulario = esMenorDeEdad ? "tatuaje_menor_edad" : "tatuaje_mayor_edad";
                var formulario = _formularioService.GetFormularioPorEvento(eventoFormulario);

                // 8. PREPARAR LA RESPUESTA
                string mensajePago = pagoCreado != null
                    ? $" Se registró un abono de ${pagoCreado.Monto:F2} USD."
                    : "";

                var response = new RegistroTatuajeResponseDto
                {
                    Cliente = cliente,
                    Tutor = tutor,
                    Tatuaje = tatuajeCreado,
                    Pago = pagoCreado,
                    Cita = citaCreada,
                    EsMenorDeEdad = esMenorDeEdad,
                    Formulario = formulario,
                    FormularioHtml = formulario?.CuerpoHtml,
                    Mensaje = esMenorDeEdad
                        ? $"Tatuaje registrado exitosamente. Cliente menor de edad - Se requiere consentimiento del tutor.{mensajePago}"
                        : $"Tatuaje registrado exitosamente. Cliente mayor de edad.{mensajePago}"
                };

                await transaction.CommitAsync();
                return response;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Error al registrar el tatuaje completo: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Calcula la edad basada en la fecha de nacimiento
        /// </summary>
        private int CalcularEdad(DateTime fechaNacimiento)
        {
            var hoy = DateTime.Today;
            var edad = hoy.Year - fechaNacimiento.Year;

            if (fechaNacimiento.Date > hoy.AddYears(-edad))
            {
                edad--;
            }

            return edad;
        }
    }
}
