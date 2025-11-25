using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Cliente")]
    public class Cliente
    {
        [Key]
        [Column("id_cliente")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdCliente { get; set; }

        [Column("identificacion")]
        [StringLength(30)]
        public string? Identificacion { get; set; }

        [Column("nombre")]
        [StringLength(30)]
        public string? Nombre { get; set; }

        [Column("apellido")]
        [StringLength(30)]
        public string? Apellido { get; set; }

        [Column("fecha_nacimiento")]
        public DateTime? FechaNacimiento { get; set; }

        [Column("nacionalidad")]
        public string? Nacionalidad { get; set; }

        [Column("telefono")]
        [StringLength(20)]
        public string? Telefono { get; set; }

        [Column("email")]
        [StringLength(60)]
        public string? Email { get; set; }

        [Column("redes")]
        [StringLength(20)]
        public string? Redes { get; set; }

        [Column("condicion_medica")]
        [StringLength(100)]
        public string? CondicionMedica { get; set; }

        [Column("enfermedad_piel")]
        [StringLength(100)]
        public string? EnfermedadPiel { get; set; }

        [Column("deporte")]
        [StringLength(100)]
        public string? Deporte { get; set; }

        [Column("referencia")]
        [StringLength(20)]
        public string? Referencia { get; set; }

        [Column("observaciones")]
        [StringLength(200)]
        public string? Observaciones { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        // Relaciones
        public virtual ICollection<ClienteTutor> ClienteTutores { get; set; } = new List<ClienteTutor>();
    }
}
