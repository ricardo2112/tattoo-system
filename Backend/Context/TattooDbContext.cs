using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Context
{
    public class TattooDbContext : DbContext
    {
        public TattooDbContext(DbContextOptions<TattooDbContext> options) : base(options){}

        public virtual DbSet<Usuario> Usuarios { get; set; }
        public virtual DbSet<Rol> Roles { get; set; }
        public virtual DbSet<Menu> Menus { get; set; }
        public virtual DbSet<UsuarioRol> UsuarioRoles { get; set; }
        public virtual DbSet<MenuRol> MenuRoles { get; set; }
        public virtual DbSet<TipoCatalogo> TipoCatalogos { get; set; }
        public virtual DbSet<Catalogo> Catalogos { get; set; }
        public virtual DbSet<Cliente> Clientes { get; set; }
        public virtual DbSet<Tutor> Tutores { get; set; }
        public virtual DbSet<ClienteTutor> ClienteTutores { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasKey(e => e.IdUsuario);
                entity.HasIndex(e => e.Username).IsUnique();

                entity.Property(e => e.FechaCreacion)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Rol>(entity =>
            {
                entity.HasKey(e => e.IdRol);
            });

            modelBuilder.Entity<Menu>(entity =>
            {
                entity.HasKey(e => e.IdMenu);

                entity.Property(e => e.FechaCreacion)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<UsuarioRol>(entity =>
            {
                entity.HasKey(e => new { e.IdUsuario, e.IdRol });

                entity.HasOne(e => e.Usuario)
                    .WithMany()
                    .HasForeignKey(e => e.IdUsuario)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Rol)
                    .WithMany()
                    .HasForeignKey(e => e.IdRol)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.FechaCreacion)
                    .HasDefaultValueSql("NOW()");

                entity.Property(e => e.Activo)
                    .HasDefaultValue(true);
            });

            modelBuilder.Entity<MenuRol>(entity =>
            {
                entity.HasKey(e => new { e.IdMenu, e.IdRol });

                entity.HasOne(e => e.Menu)
                    .WithMany(m => m.MenuRoles)
                    .HasForeignKey(e => e.IdMenu)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Rol)
                    .WithMany(r => r.MenuRoles)
                    .HasForeignKey(e => e.IdRol)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TipoCatalogo>(entity =>
            {
                entity.HasKey(e => e.IdTipoCatalogo);
            });

            modelBuilder.Entity<Catalogo>(entity =>
            {
                entity.HasKey(e => e.IdCatalogo);

                entity.HasOne(e => e.TipoCatalogo)
                    .WithMany(tc => tc.Catalogos)
                    .HasForeignKey(e => e.IdTipoCatalogo)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.HasKey(e => e.IdCliente);

                entity.Property(e => e.FechaCreacion)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Tutor>(entity =>
            {
                entity.HasKey(e => e.IdTutor);
            });

            modelBuilder.Entity<ClienteTutor>(entity =>
            {
                entity.HasKey(e => new { e.IdTutor, e.IdCliente });

                entity.HasOne(e => e.Tutor)
                    .WithMany(t => t.ClienteTutores)
                    .HasForeignKey(e => e.IdTutor)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Cliente)
                    .WithMany(c => c.ClienteTutores)
                    .HasForeignKey(e => e.IdCliente)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
