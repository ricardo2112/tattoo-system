using Backend.Models;
using Backend.Services.CatalogoService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogoController : ControllerBase
    {
        private readonly ICatalogoService _catalogoService;

        public CatalogoController(ICatalogoService service)
        {
            _catalogoService = service;
        }

        [HttpGet]
        public ActionResult<List<Catalogo>> GetAllCatalogos()
        {
            try
            {
                var catalogos = _catalogoService.GetAllCatalogos();
                return Ok(catalogos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los catalogos", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<List<Catalogo>> GetCatalogoById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del catalogo debe ser un número positivo" });
            }

            try
            {
                var catalogo = _catalogoService.GetCatalogoById(id);
                return Ok(catalogo);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los catalogos", error = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult<List<Catalogo>> CrearCatalogo([FromBody] Catalogo catalogo)
        {
            try
            {
                var nuevoCatalogo = _catalogoService.CrearCatalogo(catalogo);
                return CreatedAtAction(nameof(GetCatalogoById), new { id = nuevoCatalogo.IdCatalogo }, nuevoCatalogo);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el catálogo", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<Catalogo> ActualizarCatalogo(int id, [FromBody] Catalogo catalogo)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del catálogo debe ser un número positivo" });
            }

            try
            {
                var catalogoActualizado = _catalogoService.ActualizarCatalogo(id, catalogo);
                return Ok(catalogoActualizado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el catálogo", error = ex.Message });
            }
        }
    }
}
