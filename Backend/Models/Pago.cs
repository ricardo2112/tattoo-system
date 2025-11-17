using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Pago")]
    public class Pago
    {
        [Key]
        [Column("id_pago")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdPago { get; set; }

        [Column("monto")]
        [Required]
        public double Monto { get; set; }

        [Column("forma_pago")]
        [StringLength(20)]
        public string? FormaPago { get; set; }

        [Column("fecha_pago")]
        public DateTime? FechaPago { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        // Relaciones
        public virtual ICollection<PagoTatuaje> PagoTatuajes { get; set; } = new List<PagoTatuaje>();
    }
}
