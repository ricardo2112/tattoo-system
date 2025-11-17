using Backend.Context;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.ClienteService
{
    public class ClienteService : IClienteService
    {
        private readonly TattooDbContext _context;
        private const int MAX_TUTORES_POR_CLIENTE = 4;

        public ClienteService(TattooDbContext context)
        {
            _context = context;
        }

        public List<Cliente> GetAllClientes()
        {
            try
            {
                var clientes = _context.Clientes
                    .OrderBy(c => c.IdCliente)
                    .Include(c => c.ClienteTutores)
                        .ThenInclude(ct => ct.Tutor)
                    .ToList();
                return clientes;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los clientes", ex);
            }
        }

        public Cliente GetClienteById(int id)
        {
            try
            {
                var cliente = _context.Clientes
                    .Include(c => c.ClienteTutores)
                        .ThenInclude(ct => ct.Tutor)
                    .FirstOrDefault(c => c.IdCliente == id);

                if (cliente == null)
                {
                    throw new KeyNotFoundException($"El cliente con ID {id} no existe");
                }

                return cliente;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el cliente", ex);
            }
        }

        public Cliente CrearCliente(Cliente cliente)
        {
            try
            {
                // Validar que no exista un cliente con la misma identificación (si se proporciona)
                if (!string.IsNullOrEmpty(cliente.Identificacion))
                {
                    var clienteExists = _context.Clientes
                        .Any(c => c.Identificacion == cliente.Identificacion);
                    if (clienteExists)
                    {
                        throw new InvalidOperationException($"Ya existe un cliente con la identificación {cliente.Identificacion}");
                    }
                }

                var nuevoCliente = new Cliente
                {
                    Identificacion = cliente.Identificacion,
                    Nombre = cliente.Nombre,
                    Apellido = cliente.Apellido,
                    FechaNacimiento = cliente.FechaNacimiento,
                    Telefono = cliente.Telefono,
                    Email = cliente.Email,
                    Redes = cliente.Redes,
                    CondicionMedica = cliente.CondicionMedica,
                    EnfermedadPiel = cliente.EnfermedadPiel,
                    Deporte = cliente.Deporte,
                    Referencia = cliente.Referencia,
                    Observaciones = cliente.Observaciones
                };

                _context.Clientes.Add(nuevoCliente);
                _context.SaveChanges();

                return nuevoCliente;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear el cliente", ex);
            }
        }

        public Cliente ActualizarCliente(int id, Cliente cliente)
        {
            try
            {
                var clienteExistente = _context.Clientes.Find(id);

                if (clienteExistente == null)
                {
                    throw new KeyNotFoundException($"El cliente con ID {id} no existe");
                }

                // Validar que no exista otro cliente con la misma identificación
                if (!string.IsNullOrEmpty(cliente.Identificacion))
                {
                    var clienteConMismaIdentificacion = _context.Clientes
                        .Any(c => c.Identificacion == cliente.Identificacion && c.IdCliente != id);
                    if (clienteConMismaIdentificacion)
                    {
                        throw new InvalidOperationException($"Ya existe otro cliente con la identificación '{cliente.Identificacion}'");
                    }
                }

                // Actualizar los campos
                clienteExistente.Identificacion = cliente.Identificacion;
                clienteExistente.Nombre = cliente.Nombre;
                clienteExistente.Apellido = cliente.Apellido;
                clienteExistente.FechaNacimiento = cliente.FechaNacimiento;
                clienteExistente.Telefono = cliente.Telefono;
                clienteExistente.Email = cliente.Email;
                clienteExistente.Redes = cliente.Redes;
                clienteExistente.CondicionMedica = cliente.CondicionMedica;
                clienteExistente.EnfermedadPiel = cliente.EnfermedadPiel;
                clienteExistente.Deporte = cliente.Deporte;
                clienteExistente.Referencia = cliente.Referencia;
                clienteExistente.Observaciones = cliente.Observaciones;

                _context.Clientes.Update(clienteExistente);
                _context.SaveChanges();

                return clienteExistente;
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
                throw new Exception($"Error al actualizar el cliente con ID {id}", ex);
            }
        }

        public bool EliminarCliente(int id)
        {
            try
            {
                var cliente = _context.Clientes.Find(id);

                if (cliente == null)
                {
                    throw new KeyNotFoundException($"El cliente con ID {id} no existe");
                }

                _context.Clientes.Remove(cliente);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al eliminar el cliente con ID {id}", ex);
            }
        }

        public ClienteTutor AsignarTutorACliente(int idCliente, int idTutor)
        {
            try
            {
                // Validar que el cliente exista
                var clienteExiste = _context.Clientes.Any(c => c.IdCliente == idCliente);
                if (!clienteExiste)
                {
                    throw new KeyNotFoundException($"El cliente con ID {idCliente} no existe");
                }

                // Validar que el tutor exista
                var tutorExiste = _context.Tutores.Any(t => t.IdTutor == idTutor);
                if (!tutorExiste)
                {
                    throw new KeyNotFoundException($"El tutor con ID {idTutor} no existe");
                }

                // Validar que la relación no exista ya
                var relacionExiste = _context.ClienteTutores
                    .Any(ct => ct.IdCliente == idCliente && ct.IdTutor == idTutor);
                if (relacionExiste)
                {
                    throw new InvalidOperationException($"El cliente {idCliente} ya tiene asignado el tutor {idTutor}");
                }

                // VALIDACIÓN IMPORTANTE: Verificar que el cliente no tenga más de 3 tutores
                var cantidadTutores = _context.ClienteTutores
                    .Count(ct => ct.IdCliente == idCliente);
                if (cantidadTutores >= MAX_TUTORES_POR_CLIENTE)
                {
                    throw new InvalidOperationException($"El cliente {idCliente} ya tiene el máximo de {MAX_TUTORES_POR_CLIENTE} tutores asignados");
                }

                // Crear la relación
                var clienteTutor = new ClienteTutor
                {
                    IdCliente = idCliente,
                    IdTutor = idTutor
                };

                _context.ClienteTutores.Add(clienteTutor);
                _context.SaveChanges();

                return clienteTutor;
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
                throw new Exception($"Error al asignar el tutor {idTutor} al cliente {idCliente}", ex);
            }
        }

        public bool DesasignarTutorDeCliente(int idCliente, int idTutor)
        {
            try
            {
                var clienteTutor = _context.ClienteTutores
                    .FirstOrDefault(ct => ct.IdCliente == idCliente && ct.IdTutor == idTutor);

                if (clienteTutor == null)
                {
                    throw new KeyNotFoundException($"No existe una relación entre el cliente {idCliente} y el tutor {idTutor}");
                }

                _context.ClienteTutores.Remove(clienteTutor);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al desasignar el tutor {idTutor} del cliente {idCliente}", ex);
            }
        }

        public List<Tutor> GetTutoresByClienteId(int idCliente)
        {
            try
            {
                var clienteExiste = _context.Clientes.Any(c => c.IdCliente == idCliente);
                if (!clienteExiste)
                {
                    throw new KeyNotFoundException($"El cliente con ID {idCliente} no existe");
                }

                var tutores = _context.ClienteTutores
                    .Where(ct => ct.IdCliente == idCliente)
                    .Include(ct => ct.Tutor)
                    .Select(ct => ct.Tutor)
                    .ToList();

                return tutores;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener los tutores del cliente {idCliente}", ex);
            }
        }
    }
}
