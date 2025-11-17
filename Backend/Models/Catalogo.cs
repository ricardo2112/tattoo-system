using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Catalogo")]
    public class Catalogo
    {
        [Key]
        [Column("id_catalogo")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdCatalogo { get; set; }

        [Required]
        [Column("id_tipo_catalogo")]
        public int IdTipoCatalogo { get; set; }

        [Required]
        [Column("nombre_catalogo")]
        [StringLength(30)]
        public string NombreCatalogo { get; set; } = string.Empty;

        // Relaciones
        [ForeignKey("IdTipoCatalogo")]
        public virtual TipoCatalogo TipoCatalogo { get; set; } = null!;
    }
}
