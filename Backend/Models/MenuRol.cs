using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("MenuRol")]
    public class MenuRol
    {
        [Column("id_menu")]
        public int IdMenu { get; set; }

        [Column("id_rol")]
        public int IdRol { get; set; }

        // Relaciones
        [ForeignKey("IdMenu")]
        public virtual Menu Menu { get; set; } = null!;

        [ForeignKey("IdRol")]
        public virtual Rol Rol { get; set; } = null!;
    }
}
