using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("ClienteTutor")]
    public class ClienteTutor
    {
        [Column("id_tutor")]
        public int IdTutor { get; set; }

        [Column("id_cliente")]
        public int IdCliente { get; set; }

        // Relaciones
        [ForeignKey("IdTutor")]
        public virtual Tutor Tutor { get; set; } = null!;

        [ForeignKey("IdCliente")]
        public virtual Cliente Cliente { get; set; } = null!;
    }
}
