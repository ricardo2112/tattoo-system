using Backend.Models;

namespace Backend.DTOs
{
    /// <summary>
    /// DTO para el registro completo de un tatuaje con cliente, tutor (si es menor), cita y formulario
    /// </summary>
    public class RegistroTatuajeDto
    {
        // Información del cliente (puede ser existente o nuevo)
        public ClienteDto Cliente { get; set; } = new ClienteDto();

        // Información del tutor (solo si el cliente es menor de edad)
        public TutorDto? Tutor { get; set; }

        // Información del tatuaje
        public TatuajeDto Tatuaje { get; set; } = new TatuajeDto();

        // Información de la cita
        public CitaDto Cita { get; set; } = new CitaDto();

        // Usuario que registra
        public int RegistradoPor { get; set; }
    }

    public class ClienteDto
    {
        /// <summary>
        /// Si se proporciona, se buscará el cliente existente. Si es null, se creará uno nuevo
        /// </summary>
        public int? IdCliente { get; set; }

        // Campos para crear un nuevo cliente
        public string? Identificacion { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Nacionalidad { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public string? Redes { get; set; }
        public string? CondicionMedica { get; set; }
        public string? EnfermedadPiel { get; set; }
        public string? Deporte { get; set; }
        public string? Referencia { get; set; }
        public string? Observaciones { get; set; }
    }

    public class TutorDto
    {
        /// <summary>
        /// Si se proporciona, se buscará el tutor existente. Si es null, se creará uno nuevo
        /// </summary>
        public int? IdTutor { get; set; }

        // Campos para crear un nuevo tutor
        public string? Identificacion { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string? Parentezco { get; set; }
    }

    public class TatuajeDto
    {
        public string? Artista { get; set; }
        public string? Detalle { get; set; }
        public double? Precio { get; set; }
        public string? ZonaTatuaje { get; set; }
        public string? Imagen { get; set; }
        public string EstadoPago { get; set; } = "parcial";
    }

    public class CitaDto
    {
        public string? Titulo { get; set; }
        public string? Descripcion { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public int? DuracionMinutos { get; set; }
        public string? Zona { get; set; }
    }

    /// <summary>
    /// DTO de respuesta que incluye toda la información del registro completo
    /// </summary>
    public class RegistroTatuajeResponseDto
    {
        public Cliente Cliente { get; set; } = null!;
        public Tutor? Tutor { get; set; }
        public Tatuaje Tatuaje { get; set; } = null!;
        public CitaServicio Cita { get; set; } = null!;
        public bool EsMenorDeEdad { get; set; }
        public Formulario? Formulario { get; set; }
        public string? FormularioHtml { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}
