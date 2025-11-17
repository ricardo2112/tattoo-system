using Backend.Authentication;
using Backend.DTOs;
using Backend.Models;
using Backend.Services.AuthenticationService;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.RegularExpressions;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authService;
        private readonly IJWTAuthentication _jwtAuth;

        public AuthController(IAuthenticationService authService, IJWTAuthentication jwtAuth)
        {
            _authService = authService;
            _jwtAuth = jwtAuth;
        }

        [HttpPost("login")]
        public ActionResult<AuthResponse> Login([FromBody] Usuario request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { message = "Los datos de login son requeridos" });
                }

                var authResponse = _authService.Login(request);

                if (authResponse == null)
                {
                    return Unauthorized(new { message = "Credenciales inválidas" });
                }


                var accessToken = _jwtAuth.GenerarAccessToken(
                    authResponse.IdUsuario,
                    authResponse.Username,
                    authResponse.Roles
                );

                Response.Cookies.Append("AuthToken", accessToken, _jwtAuth.ObtenerAccessToken());

                return Ok(authResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al iniciar sesión", error = ex.Message });
            }
        }

        [HttpPost("validate")]
        public ActionResult<bool> ValidateUser([FromBody] LoginRequest request)
        {
            // Validación de datos: ModelState
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var isValid = _authService.ValidateUser(request.Username, request.Password);
                return Ok(new { isValid });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al validar usuario", error = ex.Message });
            }
        }

        [HttpPost("logout")]
        public ActionResult Logout()
        {
            try
            {
                Response.Cookies.Delete("AuthToken");
                return Ok(new { message = "Sesión cerrada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cerrar sesión", error = ex.Message });
            }
        }
    }
}
