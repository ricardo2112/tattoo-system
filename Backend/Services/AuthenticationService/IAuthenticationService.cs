using Backend.DTOs;
using Backend.Models;

namespace Backend.Services.AuthenticationService
{
    public interface IAuthenticationService
    {
        AuthResponse? Login(Usuario request);
        bool ValidateUser(string username, string password);
    }
}
