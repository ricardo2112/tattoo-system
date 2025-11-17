using Backend.Authentication;
using Backend.Context;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.AuthenticationService
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly TattooDbContext _context;
        private readonly IJWTAuthentication _jwtAuthentication;

        public AuthenticationService(TattooDbContext context, IJWTAuthentication jwtAuthentication)
        {
            _context = context;
            _jwtAuthentication = jwtAuthentication;
        }

        public AuthResponse? Login(Usuario request)
        {
            // Buscar usuario por username
            var usuario = _context.Set<Usuario>()
                .FirstOrDefault(u => u.Username == request.Username && u.Activo);

            if (usuario == null)
            {
                throw new UnauthorizedAccessException("No existe el usuario");
            }


            // Verificar contraseña
            if (!BCrypt.Net.BCrypt.Verify(request.PasswordHash, usuario.PasswordHash))
            {
                throw new UnauthorizedAccessException("Credenciales inválidas");
            }

            // Obtener roles del usuario
            var roles = _context.Set<UsuarioRol>()
                .Where(ur => ur.IdUsuario == usuario.IdUsuario && ur.Activo)
                .Include(ur => ur.Rol)
                .Select(ur => ur.Rol.NombreRol)
                .ToList();

            // Generar token JWT
            var token = _jwtAuthentication.GenerarAccessToken(
                usuario.IdUsuario,
                usuario.Username,
                roles
            );

            // Crear respuesta
            return new AuthResponse
            {
                IdUsuario = usuario.IdUsuario,
                Username = usuario.Username,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Roles = roles
            };
        }

        public bool ValidateUser(string username, string password)
        {
            var usuario = _context.Set<Usuario>()
                .FirstOrDefault(u => u.Username == username && u.Activo);

            if (usuario == null)
            {
                return false;
            }

            return BCrypt.Net.BCrypt.Verify(password, usuario.PasswordHash);
        }
    }
}
