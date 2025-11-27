using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("EventoFormulario")]
    public class EventoFormulario
    {
        [Key]
        [Column("id_evento")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdEvento { get; set; }

        [Column("id_formulario")]
        public int? IdFormulario { get; set; }

        [Required]
        [Column("evento")]
        [StringLength(20)]
        public string Evento { get; set; } = string.Empty;

        // Relaciones
        [ForeignKey("IdFormulario")]
        public virtual Formulario? Formulario { get; set; }
    }
}
