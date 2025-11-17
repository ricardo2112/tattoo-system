using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("PagoTatuaje")]
    public class PagoTatuaje
    {
        [Column("id_tatuaje")]
        public int IdTatuaje { get; set; }

        [Column("id_pago")]
        public int IdPago { get; set; }

        // Relaciones
        [ForeignKey("IdTatuaje")]
        public virtual Tatuaje Tatuaje { get; set; } = null!;

        [ForeignKey("IdPago")]
        public virtual Pago Pago { get; set; } = null!;
    }
}
