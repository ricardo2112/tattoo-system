using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("CitaServicio")]
    public class CitaServicio
    {
        // Constante para la zona horaria del estudio
        public const string ZONA_HORARIA_ESTUDIO = "America/Bogota";
        public const string NOMBRE_ESTUDIO = "Tattoo Z Studio";

        [Key]
        [Column("id_cita")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdCita { get; set; }

        [Column("titulo")]
        [StringLength(60)]
        public string? Titulo { get; set; }

        [Column("descripcion")]
        [StringLength(200)]
        public string? Descripcion { get; set; }

        // Fecha de la cita (solo la fecha del día)
        [Column("fecha_inicio")]
        [Required]
        public DateTime FechaInicio { get; set; }

        // Hora de inicio de la cita (usa la fecha solo para extraer la hora)
        [Column("fecha_fin")]
        [Required]
        public DateTime FechaFin { get; set; }

        // Duración de la cita en minutos (calculada automáticamente entre fecha_inicio y fecha_fin)
        // Este campo es redundante pero se mantiene por compatibilidad con la base de datos
        [Column("duracion_minutos")]
        public int? DuracionMinutos { get; set; }

        [Column("zona")]
        [StringLength(30)]
        public string? Zona { get; set; }

        [Column("google_event_id")]
        [StringLength(200)]
        public string? GoogleEventId { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        [Column("fecha_actualizacion")]
        public DateTime FechaActualizacion { get; set; } = DateTime.Now;

        [Column("estado")]
        [StringLength(20)]
        public string Estado { get; set; } = "pendiente";

        // Relaciones
        public virtual ICollection<CitaTatuaje> CitaTatuajes { get; set; } = new List<CitaTatuaje>();
    }
}
