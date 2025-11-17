using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("TipoCatalogo")]
    public class TipoCatalogo
    {
        [Key]
        [Column("id_tipo_catalogo")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdTipoCatalogo { get; set; }

        [Required]
        [Column("nombre_tipo_catalogo")]
        [StringLength(30)]
        public string NombreTipoCatalogo { get; set; } = string.Empty;

        // Relaciones
        public virtual ICollection<Catalogo> Catalogos { get; set; } = new List<Catalogo>();
    }
}
