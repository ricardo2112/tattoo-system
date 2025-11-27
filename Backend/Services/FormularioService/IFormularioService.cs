using Backend.Models;

namespace Backend.Services.FormularioService
{
    public interface IFormularioService
    {
        List<Formulario> GetAllFormularios();
        Formulario GetFormularioById(int id);
        Formulario? GetFormularioPorEvento(string evento);
        Formulario CrearFormulario(Formulario formulario);
        Formulario ActualizarFormulario(int id, Formulario formulario);
        bool EliminarFormulario(int id);

        // Gestión de eventos
        List<EventoFormulario> GetAllEventos();
        EventoFormulario AsignarFormularioAEvento(int idEvento, int idFormulario);
        bool DesasignarFormularioDeEvento(int idEvento);
    }
}
