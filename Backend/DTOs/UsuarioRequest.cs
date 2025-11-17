using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class UsuarioRequest
    {
        [Required(ErrorMessage = "El username es requerido")]
        [StringLength(20, MinimumLength = 3, ErrorMessage = "El username debe tener entre 3 y 20 caracteres")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida")]
        [StringLength(16, MinimumLength = 4, ErrorMessage = "La contraseña debe tener entre 4 y 16 caracteres")]
        public string Password { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "El nombre no puede superar los 50 caracteres")]
        public string? Nombre { get; set; }

        [StringLength(50, ErrorMessage = "El apellido no puede superar los 50 caracteres")]
        public string? Apellido { get; set; }

        public List<int> RolesIds { get; set; } = new List<int>();
    }
}
