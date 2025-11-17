using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Menu")]
    public class Menu
    {
        [Key]
        [Column("id_menu")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdMenu { get; set; }

        [Required]
        [Column("nombre_menu")]
        [StringLength(100)]
        public string NombreMenu { get; set; } = string.Empty;

        [Column("ruta")]
        [StringLength(200)]
        public string? Ruta { get; set; }

        [Column("activo")]
        public bool Activo { get; set; } = true;

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        // Relaciones
        public virtual ICollection<MenuRol> MenuRoles { get; set; } = new List<MenuRol>();
    }
}
