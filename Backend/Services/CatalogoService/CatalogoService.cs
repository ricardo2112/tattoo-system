using Backend.Context;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.CatalogoService
{
    public class CatalogoService : ICatalogoService
    {
        private readonly TattooDbContext _context;
        public CatalogoService(TattooDbContext context)
        {
            _context = context;
        }
        public List<TipoCatalogo> GetAllCatalogos()
        {
            try
            {
                var catalogo = _context.TipoCatalogos
                    .OrderBy(tc => tc.IdTipoCatalogo)
                    .Include(c => c.Catalogos)
                    .ToList();
                return catalogo;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los catalogos", ex);
            }
        }

        public Catalogo GetCatalogoById(int id)
        {
            try
            {
                var catalogo = _context.Catalogos.Find(id);

                if (catalogo == null)
                {
                    throw new KeyNotFoundException($"El catalogo con ID {id} no existe");
                }

                return catalogo;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex) 
            {
                throw new Exception("Error al obtener los catalogos", ex);
            }
        }

        public Catalogo CrearCatalogo(Catalogo catalogo)
        {
            try
            {
                var catalogoExists = _context.Catalogos.Any(c => c.NombreCatalogo == catalogo.NombreCatalogo);
                if (catalogoExists)
                {
                    throw new InvalidOperationException($"{catalogo.NombreCatalogo} ya está en uso");
                }

                // Validar que el tipo de catálogo exista
                var tipoCatalogoExists = _context.TipoCatalogos.Any(tc => tc.IdTipoCatalogo == catalogo.IdTipoCatalogo);
                if (!tipoCatalogoExists)
                {
                    throw new KeyNotFoundException($"El tipo de catálogo con ID {catalogo.IdTipoCatalogo} no existe");
                }

                var nuevoCatalogo = new Catalogo
                {
                    NombreCatalogo = catalogo.NombreCatalogo,
                    IdTipoCatalogo = catalogo.IdTipoCatalogo
                };

                _context.Catalogos.Add(nuevoCatalogo);
                _context.SaveChanges();

                return nuevoCatalogo;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear un catálogo", ex);
            }
        }

        public Catalogo ActualizarCatalogo(int id, Catalogo catalogo)
        {
            try
            {
                var catalogoExistente = _context.Catalogos.Find(id);

                if (catalogoExistente == null)
                {
                    throw new KeyNotFoundException($"El catálogo con ID {id} no existe");
                }

                // Validar que no exista otro catálogo con el mismo nombre
                var catalogoConMismoNombre = _context.Catalogos
                    .Any(c => c.NombreCatalogo == catalogo.NombreCatalogo && c.IdCatalogo != id);
                if (catalogoConMismoNombre)
                {
                    throw new InvalidOperationException($"Ya existe otro catálogo con el nombre '{catalogo.NombreCatalogo}'");
                }

                // Validar que el tipo de catálogo exista
                var tipoCatalogoExists = _context.TipoCatalogos.Any(tc => tc.IdTipoCatalogo == catalogo.IdTipoCatalogo);
                if (!tipoCatalogoExists)
                {
                    throw new KeyNotFoundException($"El tipo de catálogo con ID {catalogo.IdTipoCatalogo} no existe");
                }

                // Actualizar los campos
                catalogoExistente.NombreCatalogo = catalogo.NombreCatalogo;
                catalogoExistente.IdTipoCatalogo = catalogo.IdTipoCatalogo;

                _context.Catalogos.Update(catalogoExistente);
                _context.SaveChanges();

                return catalogoExistente;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al actualizar el catálogo con ID {id}", ex);
            }
        }

        public List<string> GetCatalogoByTipo(int idTipo)
        {
            try
            {
                var catalogos = _context.TipoCatalogos
                    .Include(c => c.Catalogos)
                    .Where(tc => tc.IdTipoCatalogo == idTipo)
                    .SelectMany(tc => tc.Catalogos.Select(c => c.NombreCatalogo))
                    .ToList();

                if (!catalogos.Any())
                {
                    throw new KeyNotFoundException($"No se encontraron catálogos para el tipo con ID {idTipo}");
                }

                return catalogos;
            }
            catch (KeyNotFoundException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener los catálogos del tipo {idTipo}", ex);
            }
        }
    }
}
