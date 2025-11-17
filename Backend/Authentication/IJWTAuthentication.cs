using System.Security.Claims;

namespace Backend.Authentication
{
    public interface IJWTAuthentication
    {
        string GenerarAccessToken(int idUsuario, string username, List<string> roles);
        ClaimsPrincipal? ValidarToken(string token);
        CookieOptions ObtenerAccessToken();
    }
}
