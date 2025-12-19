using Backend.Context;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.FormularioService
{
    public class FormularioService : IFormularioService
    {
        private readonly TattooDbContext _context;

        public FormularioService(TattooDbContext context)
        {
            _context = context;
        }

        public List<Formulario> GetAllFormularios()
        {
            try
            {
                return _context.Formularios
                    .Include(f => f.EventoFormularios)
                    .OrderBy(f => f.IdFormulario)
                    .ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los formularios", ex);
            }
        }

        public Formulario GetFormularioById(int id)
        {
            try
            {
                var formulario = _context.Formularios
                    .Include(f => f.EventoFormularios)
                    .FirstOrDefault(f => f.IdFormulario == id);

                if (formulario == null)
                {
                    throw new KeyNotFoundException($"El formulario con ID {id} no existe");
                }

                return formulario;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el formulario", ex);
            }
        }

        public Formulario? GetFormularioPorEvento(string evento)
        {
            try
            {
                var eventoFormulario = _context.EventoFormularios
                    .Include(ef => ef.Formulario)
                    .FirstOrDefault(ef => ef.Evento == evento && ef.IdFormulario != null);

                if (eventoFormulario?.Formulario?.Activo == true)
                {
                    return eventoFormulario.Formulario;
                }

                return null;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener el formulario para el evento '{evento}'", ex);
            }
        }

        public Formulario CrearFormulario(Formulario formulario)
        {
            try
            {
                var nuevoFormulario = new Formulario
                {
                    NombreFormulario = formulario.NombreFormulario,
                    CuerpoHtml = formulario.CuerpoHtml,
                    Descripcion = formulario.Descripcion,
                    Activo = formulario.Activo
                };

                _context.Formularios.Add(nuevoFormulario);
                _context.SaveChanges();

                return nuevoFormulario;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear el formulario", ex);
            }
        }

        public Formulario ActualizarFormulario(int id, Formulario formulario)
        {
            try
            {
                var formularioExistente = _context.Formularios.Find(id);

                if (formularioExistente == null)
                {
                    throw new KeyNotFoundException($"El formulario con ID {id} no existe");
                }

                formularioExistente.NombreFormulario = formulario.NombreFormulario;
                formularioExistente.CuerpoHtml = formulario.CuerpoHtml;
                formularioExistente.Descripcion = formulario.Descripcion;
                formularioExistente.Activo = formulario.Activo;
                formularioExistente.FechaActualizacion = DateTime.Now;

                _context.Formularios.Update(formularioExistente);
                _context.SaveChanges();

                return formularioExistente;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al actualizar el formulario con ID {id}", ex);
            }
        }

        public bool EliminarFormulario(int id)
        {
            try
            {
                var formulario = _context.Formularios.Find(id);

                if (formulario == null)
                {
                    throw new KeyNotFoundException($"El formulario con ID {id} no existe");
                }

                _context.Formularios.Remove(formulario);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al eliminar el formulario con ID {id}", ex);
            }
        }

        public List<EventoFormulario> GetAllEventos()
        {
            try
            {
                return _context.EventoFormularios
                    .Include(ef => ef.Formulario)
                    .OrderBy(ef => ef.IdEvento)
                    .ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los eventos", ex);
            }
        }

        public EventoFormulario AsignarFormularioAEvento(int idEvento, int idFormulario)
        {
            try
            {
                var evento = _context.EventoFormularios.Find(idEvento);
                if (evento == null)
                {
                    throw new KeyNotFoundException($"El evento con ID {idEvento} no existe");
                }

                var formulario = _context.Formularios.Find(idFormulario);
                if (formulario == null)
                {
                    throw new KeyNotFoundException($"El formulario con ID {idFormulario} no existe");
                }

                // REGLA 1: Un formulario solo puede estar asignado a un evento
                // Verificar si el formulario ya está asignado a otro evento
                var formularioYaAsignado = _context.EventoFormularios
                    .Any(ef => ef.IdFormulario == idFormulario && ef.IdEvento != idEvento);

                if (formularioYaAsignado)
                {
                    throw new InvalidOperationException("El formulario ya está asignado a otro evento. Un formulario solo puede estar asignado a un evento a la vez.");
                }

                // REGLA 2: Si el evento ya tiene un formulario asignado, desactivarlo primero
                if (evento.IdFormulario != null && evento.IdFormulario != idFormulario)
                {
                    var formularioAnterior = _context.Formularios.Find(evento.IdFormulario);
                    if (formularioAnterior != null)
                    {
                        formularioAnterior.Activo = false;
                        formularioAnterior.FechaActualizacion = DateTime.Now;
                        _context.Formularios.Update(formularioAnterior);
                    }
                }

                // Asignar el nuevo formulario al evento
                evento.IdFormulario = idFormulario;
                _context.EventoFormularios.Update(evento);

                // REGLA 3: Activar el formulario cuando se asigna a un evento
                formulario.Activo = true;
                formulario.FechaActualizacion = DateTime.Now;
                _context.Formularios.Update(formulario);

                _context.SaveChanges();

                return evento;
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
                throw new Exception($"Error al asignar el formulario {idFormulario} al evento {idEvento}", ex);
            }
        }

        public bool DesasignarFormularioDeEvento(int idEvento)
        {
            try
            {
                var evento = _context.EventoFormularios.Find(idEvento);
                if (evento == null)
                {
                    throw new KeyNotFoundException($"El evento con ID {idEvento} no existe");
                }

                // Si el evento tiene un formulario asignado, desactivarlo
                if (evento.IdFormulario != null)
                {
                    var formulario = _context.Formularios.Find(evento.IdFormulario);
                    if (formulario != null)
                    {
                        formulario.Activo = false;
                        formulario.FechaActualizacion = DateTime.Now;
                        _context.Formularios.Update(formulario);
                    }
                }

                evento.IdFormulario = null;
                _context.EventoFormularios.Update(evento);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al desasignar el formulario del evento {idEvento}", ex);
            }
        }
    }
}
