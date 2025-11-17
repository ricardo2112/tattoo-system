using Backend.Models;

namespace Backend.Services.TutorService
{
    public interface ITutorService
    {
        List<Tutor> GetAllTutores();
        Tutor GetTutorById(int id);
        Tutor CrearTutor(Tutor tutor);
        Tutor ActualizarTutor(int id, Tutor tutor);
        bool EliminarTutor(int id);
        ClienteTutor AsignarClienteATutor(int idTutor, int idCliente);
        bool DesasignarClienteDeTutor(int idTutor, int idCliente);
        List<Cliente> GetClientesByTutorId(int idTutor);
    }
}
