using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Rol")]
    public class Rol
    {
        [Key]
        [Column("id_rol")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdRol { get; set; }

        [Required]
        [Column("nombre_rol")]
        [StringLength(30)]
        public string NombreRol { get; set; } = string.Empty;

        // Relaciones
        public virtual ICollection<MenuRol> MenuRoles { get; set; } = new List<MenuRol>();
    }
}
