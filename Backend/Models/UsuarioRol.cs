using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("UsuarioRol")]
    public class UsuarioRol
    {
        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Column("id_rol")]
        public int IdRol { get; set; }

        [Required]
        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        [Required]
        [Column("activo")]
        public bool Activo { get; set; } = true;

        // Relaciones
        [ForeignKey("IdUsuario")]
        public virtual Usuario Usuario { get; set; } = null!;

        [ForeignKey("IdRol")]
        public virtual Rol Rol { get; set; } = null!;
    }
}
