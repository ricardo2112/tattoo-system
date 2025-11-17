using Backend.Models;

namespace Backend.DTOs
{
    public class UsuarioResponse
    {
        public Usuario Usuario { get; set; } = null!;
        public List<Rol> Roles { get; set; } = new List<Rol>();
    }
}
