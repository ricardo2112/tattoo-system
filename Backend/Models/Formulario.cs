using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Formulario")]
    public class Formulario
    {
        [Key]
        [Column("id_formulario")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdFormulario { get; set; }

        [Required]
        [Column("nombre_formulario")]
        [StringLength(20)]
        public string NombreFormulario { get; set; } = string.Empty;

        [Column("cuerpo_html")]
        public string? CuerpoHtml { get; set; }

        [Column("descripcion")]
        [StringLength(50)]
        public string? Descripcion { get; set; }

        [Column("activo")]
        public bool Activo { get; set; } = true;

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        [Column("fecha_actualizacion")]
        public DateTime FechaActualizacion { get; set; } = DateTime.Now;

        // Relaciones
        public virtual ICollection<EventoFormulario> EventoFormularios { get; set; } = new List<EventoFormulario>();
    }
}
