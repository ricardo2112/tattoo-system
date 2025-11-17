using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Tatuaje")]
    public class Tatuaje
    {
        [Key]
        [Column("id_tatuaje")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdTatuaje { get; set; }

        [Column("id_cliente")]
        public int IdCliente { get; set; }

        [Column("artista")]
        [StringLength(30)]
        public string? Artista { get; set; }

        [Column("detalle")]
        [StringLength(50)]
        public string? Detalle { get; set; }

        [Column("precio")]
        public double? Precio { get; set; }

        [Column("zona_tatuaje")]
        [StringLength(20)]
        public string? ZonaTatuaje { get; set; }

        [Column("imagen")]
        [StringLength(300)]
        public string? Imagen { get; set; }

        [Column("estado_pago")]
        [StringLength(20)]
        public string EstadoPago { get; set; } = "parcial";

        [Column("registrado_por")]
        public int RegistradoPor { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        [Column("fecha_actualizacion")]
        public DateTime FechaActualizacion { get; set; } = DateTime.Now;

        // Relaciones
        [ForeignKey("IdCliente")]
        public virtual Cliente Cliente { get; set; } = null!;

        [ForeignKey("RegistradoPor")]
        public virtual Usuario Usuario { get; set; } = null!;

        public virtual ICollection<PagoTatuaje> PagoTatuajes { get; set; } = new List<PagoTatuaje>();
        public virtual ICollection<CitaTatuaje> CitaTatuajes { get; set; } = new List<CitaTatuaje>();
    }
}
