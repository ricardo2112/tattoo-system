using Backend.Models;

namespace Backend.DTOs
{
    public class AuthResponse
    {
        public int IdUsuario { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new List<string>();
    }
}
