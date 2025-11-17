using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("CitaTatuaje")]
    public class CitaTatuaje
    {
        [Column("id_tatuaje")]
        public int IdTatuaje { get; set; }

        [Column("id_cita")]
        public int IdCita { get; set; }

        // Relaciones
        [ForeignKey("IdTatuaje")]
        public virtual Tatuaje Tatuaje { get; set; } = null!;

        [ForeignKey("IdCita")]
        public virtual CitaServicio CitaServicio { get; set; } = null!;
    }
}
