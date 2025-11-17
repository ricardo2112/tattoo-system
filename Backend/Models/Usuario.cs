using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Usuario")]
    public class Usuario
    {
        [Key]
        [Column("id_usuario")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdUsuario { get; set; }

        [Required]
        [Column("username")]
        [StringLength(20)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [Column("password_hash")]
        [StringLength(100)]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("nombre")]
        [StringLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [Column("apellido")]
        [StringLength(50)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        [Column("activo")]
        public Boolean Activo { get; set; } = true;

        [Required]
        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;
    }
}
