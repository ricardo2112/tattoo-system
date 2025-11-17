using Backend.DTOs;
using Backend.Models;

namespace Backend.Services.UsuarioService
{
    public interface IUsuarioService
    {

        List<UsuarioResponse> GetAllUsuarios();
        UsuarioResponse? GetUsuarioById(int id);
        UsuarioResponse CrearUsuario(UsuarioRequest request);
        bool CambiarPassword(int id, string newPassword);
        bool Activar(int id, bool activo);
        bool AsignarRol(int idUsuario, int idRol);
        bool QuitarRol(int idUsuario, int idRol);
        List<UsuarioRol> GetRolesActivosPorUsuario(int idUsuario);
        List<UsuarioRol> GetHistorialRolesPorUsuario(int idUsuario);

    }
}
