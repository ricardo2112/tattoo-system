using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "El username es requerido")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida")]
        public string Password { get; set; } = string.Empty;
    }
}
