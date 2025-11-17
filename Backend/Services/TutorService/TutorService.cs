using Backend.Context;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.TutorService
{
    public class TutorService : ITutorService
    {
        private readonly TattooDbContext _context;
        private const int MAX_TUTORES_POR_CLIENTE = 3;

        public TutorService(TattooDbContext context)
        {
            _context = context;
        }

        public List<Tutor> GetAllTutores()
        {
            try
            {
                var tutores = _context.Tutores
                    .OrderBy(t => t.IdTutor)
                    .Include(t => t.ClienteTutores)
                        .ThenInclude(ct => ct.Cliente)
                    .ToList();
                return tutores;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los tutores", ex);
            }
        }

        public Tutor GetTutorById(int id)
        {
            try
            {
                var tutor = _context.Tutores
                    .Include(t => t.ClienteTutores)
                        .ThenInclude(ct => ct.Cliente)
                    .FirstOrDefault(t => t.IdTutor == id);

                if (tutor == null)
                {
                    throw new KeyNotFoundException($"El tutor con ID {id} no existe");
                }

                return tutor;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el tutor", ex);
            }
        }

        public Tutor CrearTutor(Tutor tutor)
        {
            try
            {
                // Validar que no exista un tutor con la misma identificación (si se proporciona)
                if (!string.IsNullOrEmpty(tutor.Identificacion))
                {
                    var tutorExists = _context.Tutores
                        .Any(t => t.Identificacion == tutor.Identificacion);
                    if (tutorExists)
                    {
                        throw new InvalidOperationException($"Ya existe un tutor con la identificación {tutor.Identificacion}");
                    }
                }

                var nuevoTutor = new Tutor
                {
                    Identificacion = tutor.Identificacion,
                    Nombre = tutor.Nombre,
                    Apellido = tutor.Apellido,
                    Parentezco = tutor.Parentezco
                };

                _context.Tutores.Add(nuevoTutor);
                _context.SaveChanges();

                return nuevoTutor;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear el tutor", ex);
            }
        }

        public Tutor ActualizarTutor(int id, Tutor tutor)
        {
            try
            {
                var tutorExistente = _context.Tutores.Find(id);

                if (tutorExistente == null)
                {
                    throw new KeyNotFoundException($"El tutor con ID {id} no existe");
                }

                // Validar que no exista otro tutor con la misma identificación
                if (!string.IsNullOrEmpty(tutor.Identificacion))
                {
                    var tutorConMismaIdentificacion = _context.Tutores
                        .Any(t => t.Identificacion == tutor.Identificacion && t.IdTutor != id);
                    if (tutorConMismaIdentificacion)
                    {
                        throw new InvalidOperationException($"Ya existe otro tutor con la identificación '{tutor.Identificacion}'");
                    }
                }

                // Actualizar los campos
                tutorExistente.Identificacion = tutor.Identificacion;
                tutorExistente.Nombre = tutor.Nombre;
                tutorExistente.Apellido = tutor.Apellido;
                tutorExistente.Parentezco = tutor.Parentezco;

                _context.Tutores.Update(tutorExistente);
                _context.SaveChanges();

                return tutorExistente;
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
                throw new Exception($"Error al actualizar el tutor con ID {id}", ex);
            }
        }

        public bool EliminarTutor(int id)
        {
            try
            {
                var tutor = _context.Tutores.Find(id);

                if (tutor == null)
                {
                    throw new KeyNotFoundException($"El tutor con ID {id} no existe");
                }

                _context.Tutores.Remove(tutor);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al eliminar el tutor con ID {id}", ex);
            }
        }

        public ClienteTutor AsignarClienteATutor(int idTutor, int idCliente)
        {
            try
            {
                // Validar que el tutor exista
                var tutorExiste = _context.Tutores.Any(t => t.IdTutor == idTutor);
                if (!tutorExiste)
                {
                    throw new KeyNotFoundException($"El tutor con ID {idTutor} no existe");
                }

                // Validar que el cliente exista
                var clienteExiste = _context.Clientes.Any(c => c.IdCliente == idCliente);
                if (!clienteExiste)
                {
                    throw new KeyNotFoundException($"El cliente con ID {idCliente} no existe");
                }

                // Validar que la relación no exista ya
                var relacionExiste = _context.ClienteTutores
                    .Any(ct => ct.IdTutor == idTutor && ct.IdCliente == idCliente);
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
                    IdTutor = idTutor,
                    IdCliente = idCliente
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
                throw new Exception($"Error al asignar el cliente {idCliente} al tutor {idTutor}", ex);
            }
        }

        public bool DesasignarClienteDeTutor(int idTutor, int idCliente)
        {
            try
            {
                var clienteTutor = _context.ClienteTutores
                    .FirstOrDefault(ct => ct.IdTutor == idTutor && ct.IdCliente == idCliente);

                if (clienteTutor == null)
                {
                    throw new KeyNotFoundException($"No existe una relación entre el tutor {idTutor} y el cliente {idCliente}");
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
                throw new Exception($"Error al desasignar el cliente {idCliente} del tutor {idTutor}", ex);
            }
        }

        public List<Cliente> GetClientesByTutorId(int idTutor)
        {
            try
            {
                var tutorExiste = _context.Tutores.Any(t => t.IdTutor == idTutor);
                if (!tutorExiste)
                {
                    throw new KeyNotFoundException($"El tutor con ID {idTutor} no existe");
                }

                var clientes = _context.ClienteTutores
                    .Where(ct => ct.IdTutor == idTutor)
                    .Include(ct => ct.Cliente)
                    .Select(ct => ct.Cliente)
                    .ToList();

                return clientes;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener los clientes del tutor {idTutor}", ex);
            }
        }
    }
}
