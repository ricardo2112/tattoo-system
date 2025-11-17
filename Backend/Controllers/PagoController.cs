using Backend.Models;
using Backend.Services.PagoService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagoController : ControllerBase
    {
        private readonly IPagoService _pagoService;

        public PagoController(IPagoService pagoService)
        {
            _pagoService = pagoService;
        }

        [HttpGet]
        public ActionResult<List<Pago>> GetAllPagos()
        {
            try
            {
                var pagos = _pagoService.GetAllPagos();
                return Ok(pagos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los pagos", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Pago> GetPagoById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del pago debe ser un número positivo" });
            }

            try
            {
                var pago = _pagoService.GetPagoById(id);
                return Ok(pago);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el pago", error = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult<Pago> CrearPago([FromBody] Pago pago)
        {
            try
            {
                var nuevoPago = _pagoService.CrearPago(pago);
                return CreatedAtAction(nameof(GetPagoById), new { id = nuevoPago.IdPago }, nuevoPago);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el pago", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<Pago> ActualizarPago(int id, [FromBody] Pago pago)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del pago debe ser un número positivo" });
            }

            try
            {
                var pagoActualizado = _pagoService.ActualizarPago(id, pago);
                return Ok(pagoActualizado);
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
                return StatusCode(500, new { message = "Error al actualizar el pago", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public ActionResult EliminarPago(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del pago debe ser un número positivo" });
            }

            try
            {
                var resultado = _pagoService.EliminarPago(id);
                return Ok(new { message = "Pago eliminado exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el pago", error = ex.Message });
            }
        }

        [HttpGet("{idPago}/tatuajes")]
        public ActionResult<List<Tatuaje>> GetTatuajesByPagoId(int idPago)
        {
            if (idPago <= 0)
            {
                return BadRequest(new { message = "El ID del pago debe ser un número positivo" });
            }

            try
            {
                var tatuajes = _pagoService.GetTatuajesByPagoId(idPago);
                return Ok(tatuajes);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los tatuajes del pago", error = ex.Message });
            }
        }
    }
}
