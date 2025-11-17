using Backend.DTOs;
using Backend.Models;
using Backend.Services.UsuarioService;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuarioController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        public ActionResult<List<UsuarioResponse>> GetAllUsuarios()
        {
            try
            {
                var usuarios = _usuarioService.GetAllUsuarios();
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los usuarios", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<UsuarioResponse> GetUsuarioById(int id)
        {
            // Validación de datos: verificar que el ID sea válido
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del usuario debe ser un número positivo" });
            }

            try
            {
                var usuario = _usuarioService.GetUsuarioById(id);
                return Ok(usuario);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el usuario", error = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult<UsuarioResponse> CrearUsuario([FromBody] UsuarioRequest request)
        {
            // Validación de datos: ModelState
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validación de datos: Username (validación adicional de formato)
            if (!Regex.IsMatch(request.Username, @"^[a-zA-Z0-9-_]+$"))
            {
                return BadRequest(new { message = "El username solo puede contener letras, números y guiones" });
            }

            // Validación de datos: Nombre (validación adicional de formato)
            if (!string.IsNullOrWhiteSpace(request.Nombre))
            {
                if (!Regex.IsMatch(request.Nombre, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                {
                    return BadRequest(new { message = "El nombre solo puede contener letras y espacios" });
                }
            }

            // Validación de datos: Apellido (validación adicional de formato)
            if (!string.IsNullOrWhiteSpace(request.Apellido))
            {
                if (!Regex.IsMatch(request.Apellido, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                {
                    return BadRequest(new { message = "El apellido solo puede contener letras y espacios" });
                }
            }

            try
            {
                var nuevoUsuario = _usuarioService.CrearUsuario(request);
                return CreatedAtAction(nameof(GetUsuarioById), new { id = nuevoUsuario.Usuario.IdUsuario }, nuevoUsuario);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el usuario", error = ex.Message });
            }
        }

        [HttpPut("{id}/cambiar-password")]
        public ActionResult CambiarPassword(int id, [FromBody] string newPassword)
        {
            // Validación de datos: verificar que el ID sea válido
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del usuario debe ser un número positivo" });
            }

            // Validación de datos: verificar que la contraseña no sea vacía
            if (string.IsNullOrWhiteSpace(newPassword))
            {
                return BadRequest(new { message = "La nueva contraseña es requerida" });
            }

            // Validación de datos: verificar longitud de la contraseña
            if (newPassword.Length < 4 || newPassword.Length > 16)
            {
                return BadRequest(new { message = "La nueva contraseña debe tener entre 4 y 16 caracteres" });
            }

            try
            {
                _usuarioService.CambiarPassword(id, newPassword);
                return Ok(new { message = "Contraseña actualizada exitosamente" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar la contraseña", error = ex.Message });
            }
        }

        [HttpPut("{id}/activar")]
        public ActionResult Activar(int id, [FromBody] bool activo)
        {
            // Validación de datos: verificar que el ID sea válido
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del usuario debe ser un número positivo" });
            }

            try
            {
                _usuarioService.Activar(id, activo);
                var mensaje = activo ? "Usuario activado exitosamente" : "Usuario desactivado exitosamente";
                return Ok(new { message = mensaje });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar el estado del usuario", error = ex.Message });
            }
        }

        [HttpPost("{idUsuario}/roles/{idRol}")]
        public ActionResult AsignarRol(int idUsuario, int idRol)
        {
            // Validación de datos: verificar que los IDs sean válidos
            if (idUsuario <= 0)
            {
                return BadRequest(new { message = "El ID del usuario debe ser un número positivo" });
            }

            if (idRol <= 0)
            {
                return BadRequest(new { message = "El ID del rol debe ser un número positivo" });
            }

            try
            {
                _usuarioService.AsignarRol(idUsuario, idRol);
                return Ok(new { message = "Rol asignado exitosamente al usuario" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al asignar el rol al usuario", error = ex.Message });
            }
        }

        [HttpDelete("{idUsuario}/roles/{idRol}")]
        public ActionResult QuitarRol(int idUsuario, int idRol)
        {
            // Validación de datos: verificar que los IDs sean válidos
            if (idUsuario <= 0)
            {
                return BadRequest(new { message = "El ID del usuario debe ser un número positivo" });
            }

            if (idRol <= 0)
            {
                return BadRequest(new { message = "El ID del rol debe ser un número positivo" });
            }

            try
            {
                _usuarioService.QuitarRol(idUsuario, idRol);
                return Ok(new { message = "Rol removido exitosamente del usuario" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al quitar el rol del usuario", error = ex.Message });
            }
        }

        [HttpGet("{idUsuario}/roles")]
        public ActionResult<List<UsuarioRol>> GetRolesActivosPorUsuario(int idUsuario)
        {
            // Validación de datos: verificar que el ID sea válido
            if (idUsuario <= 0)
            {
                return BadRequest(new { message = "El ID del usuario debe ser un número positivo" });
            }

            try
            {
                var roles = _usuarioService.GetRolesActivosPorUsuario(idUsuario);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los roles del usuario", error = ex.Message });
            }
        }

        [HttpGet("{idUsuario}/roles/historial")]
        public ActionResult<List<UsuarioRol>> GetHistorialRolesPorUsuario(int idUsuario)
        {
            // Validación de datos: verificar que el ID sea válido
            if (idUsuario <= 0)
            {
                return BadRequest(new { message = "El ID del usuario debe ser un número positivo" });
            }

            try
            {
                var historial = _usuarioService.GetHistorialRolesPorUsuario(idUsuario);
                return Ok(historial);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el historial de roles del usuario", error = ex.Message });
            }
        }

    }
}
