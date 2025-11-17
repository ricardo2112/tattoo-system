using Backend.Models;

namespace Backend.Services.ClienteService
{
    public interface IClienteService
    {
        List<Cliente> GetAllClientes();
        Cliente GetClienteById(int id);
        Cliente CrearCliente(Cliente cliente);
        Cliente ActualizarCliente(int id, Cliente cliente);
        bool EliminarCliente(int id);
        ClienteTutor AsignarTutorACliente(int idCliente, int idTutor);
        bool DesasignarTutorDeCliente(int idCliente, int idTutor);
        List<Tutor> GetTutoresByClienteId(int idCliente);
    }
}
