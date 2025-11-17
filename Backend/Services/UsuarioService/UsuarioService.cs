using Backend.Context;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Services.UsuarioService
{
    public class UsuarioService : IUsuarioService
    {
        private readonly TattooDbContext _context;

        public UsuarioService(TattooDbContext context)
        {
            _context = context;
        }

        public List<UsuarioResponse> GetAllUsuarios()
        {
            try
            {
                var usuarios = _context.Usuarios.ToList();
                var usuariosConRoles = new List<UsuarioResponse>();

                foreach (var usuario in usuarios)
                {
                    var rolesActivos = _context.UsuarioRoles
                        .Where(ur => ur.IdUsuario == usuario.IdUsuario && ur.Activo)
                        .Include(ur => ur.Rol)
                        .Select(ur => ur.Rol)
                        .ToList();

                    usuariosConRoles.Add(new UsuarioResponse
                    {
                        Usuario = usuario,
                        Roles = rolesActivos
                    });
                }

                return usuariosConRoles;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los usuarios con roles de la base de datos", ex);
            }
        }

        public UsuarioResponse? GetUsuarioById(int id)
        {
            try
            {
                var usuario = _context.Usuarios.Find(id);

                if (usuario == null)
                {
                    throw new KeyNotFoundException($"El usuario con ID {id} no existe");
                }

                var rolesActivos = _context.UsuarioRoles
                    .Where(ur => ur.IdUsuario == id && ur.Activo)
                    .Include(ur => ur.Rol)
                    .Select(ur => ur.Rol)
                    .ToList();

                return new UsuarioResponse
                {
                    Usuario = usuario,
                    Roles = rolesActivos
                };
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener el usuario con roles con ID {id}", ex);
            }
        }

        public UsuarioResponse CrearUsuario(UsuarioRequest request)
        {
            try
            {
                // Validación de negocio: verificar si el username ya existe
                var usernameExists = _context.Usuarios.Any(u => u.Username == request.Username);
                if (usernameExists)
                {
                    throw new InvalidOperationException($"El username '{request.Username}' ya está en uso");
                }

                // Validar que los roles existan
                if (request.RolesIds.Any())
                {
                    foreach (var rolId in request.RolesIds)
                    {
                        var rolExists = _context.Roles.Any(r => r.IdRol == rolId);
                        if (!rolExists)
                        {
                            throw new KeyNotFoundException($"El rol con ID {rolId} no existe");
                        }
                    }
                }

                // Crear el usuario
                var nuevoUsuario = new Usuario
                {
                    Username = request.Username,
                    PasswordHash = HashPassword(request.Password),
                    Nombre = request.Nombre ?? string.Empty,
                    Apellido = request.Apellido ?? string.Empty,
                    Activo = true,
                    FechaCreacion = DateTime.Now
                };

                _context.Usuarios.Add(nuevoUsuario);
                _context.SaveChanges();

                // Asignar roles
                var rolesAsignados = new List<Rol>();
                foreach (var rolId in request.RolesIds)
                {
                    var usuarioRol = new UsuarioRol
                    {
                        IdUsuario = nuevoUsuario.IdUsuario,
                        IdRol = rolId,
                        Activo = true,
                        FechaCreacion = DateTime.Now
                    };

                    _context.UsuarioRoles.Add(usuarioRol);

                    var rol = _context.Roles.Find(rolId);
                    if (rol != null)
                    {
                        rolesAsignados.Add(rol);
                    }
                }

                _context.SaveChanges();

                return new UsuarioResponse
                {
                    Usuario = nuevoUsuario,
                    Roles = rolesAsignados
                };
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear el usuario con roles en la base de datos", ex);
            }
        }

        public bool CambiarPassword(int id, string newPassword)
        {
            try
            {
                var usuario = _context.Usuarios.Find(id);

                // Validación de negocio: verificar que el usuario exista
                if (usuario == null)
                {
                    throw new KeyNotFoundException($"El usuario con ID {id} no existe");
                }

                usuario.PasswordHash = HashPassword(newPassword);
                _context.Usuarios.Update(usuario);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al cambiar la contraseña del usuario con ID {id}", ex);
            }
        }

        public bool Activar(int id, bool activo)
        {
            try
            {
                var usuario = _context.Usuarios.Find(id);

                // Validación de negocio: verificar que el usuario exista
                if (usuario == null)
                {
                    throw new KeyNotFoundException($"El usuario con ID {id} no existe");
                }

                usuario.Activo = activo;
                _context.Usuarios.Update(usuario);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al cambiar el estado del usuario con ID {id}", ex);
            }
        }

        public bool AsignarRol(int idUsuario, int idRol)
        {
            try
            {
                // Validación: verificar que el usuario exista
                var usuario = _context.Usuarios.Find(idUsuario);
                if (usuario == null)
                {
                    throw new KeyNotFoundException($"El usuario con ID {idUsuario} no existe");
                }

                // Validación: verificar que el rol exista
                var rol = _context.Roles.Find(idRol);
                if (rol == null)
                {
                    throw new KeyNotFoundException($"El rol con ID {idRol} no existe");
                }

                // Buscar si ya existe el registro de usuario-rol usando la clave primaria compuesta
                var usuarioRol = _context.UsuarioRoles.Find(idUsuario, idRol);

                if (usuarioRol != null)
                {
                    // Si ya existe y está activo, lanzar error
                    if (usuarioRol.Activo)
                    {
                        throw new InvalidOperationException($"El usuario ya tiene el rol '{rol.NombreRol}' asignado y activo");
                    }

                    // Si existe pero está inactivo, reactivarlo
                    usuarioRol.Activo = true;
                    _context.UsuarioRoles.Update(usuarioRol);
                }
                else
                {
                    // Si no existe, crear nuevo registro de asignación de rol
                    usuarioRol = new UsuarioRol
                    {
                        IdUsuario = idUsuario,
                        IdRol = idRol,
                        Activo = true,
                        FechaCreacion = DateTime.Now
                    };

                    _context.UsuarioRoles.Add(usuarioRol);
                }

                _context.SaveChanges();

                return true;
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
                throw new Exception($"Error al asignar el rol al usuario con ID {idUsuario}", ex);
            }
        }

        public bool QuitarRol(int idUsuario, int idRol)
        {
            try
            {
                // Buscar el registro del usuario-rol usando la clave primaria compuesta
                var usuarioRol = _context.UsuarioRoles.Find(idUsuario, idRol);

                if (usuarioRol == null || !usuarioRol.Activo)
                {
                    throw new KeyNotFoundException($"El usuario no tiene el rol con ID {idRol} asignado o ya está inactivo");
                }

                // Marcar como inactivo en lugar de eliminar
                usuarioRol.Activo = false;
                _context.UsuarioRoles.Update(usuarioRol);
                _context.SaveChanges();

                return true;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al quitar el rol del usuario con ID {idUsuario}", ex);
            }
        }

        public List<UsuarioRol> GetRolesActivosPorUsuario(int idUsuario)
        {
            try
            {
                return _context.UsuarioRoles
                    .Where(ur => ur.IdUsuario == idUsuario && ur.Activo)
                    .ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener los roles activos del usuario con ID {idUsuario}", ex);
            }
        }

        public List<UsuarioRol> GetHistorialRolesPorUsuario(int idUsuario)
        {
            try
            {
                return _context.UsuarioRoles
                    .Where(ur => ur.IdUsuario == idUsuario)
                    .OrderByDescending(ur => ur.FechaCreacion)
                    .ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener el historial de roles del usuario con ID {idUsuario}", ex);
            }
        }

        // Métodos privados auxiliares
        private static string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
}
