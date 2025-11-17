using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Tutor")]
    public class Tutor
    {
        [Key]
        [Column("id_tutor")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdTutor { get; set; }

        [Column("identificacion")]
        [StringLength(30)]
        public string? Identificacion { get; set; }

        [Required]
        [Column("nombre")]
        [StringLength(20)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Column("apellido")]
        [StringLength(20)]
        public string Apellido { get; set; } = string.Empty;

        [Column("parentezco")]
        [StringLength(20)]
        public string? Parentezco { get; set; }

        // Relaciones
        public virtual ICollection<ClienteTutor> ClienteTutores { get; set; } = new List<ClienteTutor>();
    }
}
