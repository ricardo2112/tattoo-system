using Backend.Models;
using Backend.Services.TatuajeService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TatuajeController : ControllerBase
    {
        private readonly ITatuajeService _tatuajeService;

        public TatuajeController(ITatuajeService tatuajeService)
        {
            _tatuajeService = tatuajeService;
        }

        [HttpGet]
        public ActionResult<List<Tatuaje>> GetAllTatuajes()
        {
            try
            {
                var tatuajes = _tatuajeService.GetAllTatuajes();
                return Ok(tatuajes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los tatuajes", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Tatuaje> GetTatuajeById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del tatuaje debe ser un número positivo" });
            }

            try
            {
                var tatuaje = _tatuajeService.GetTatuajeById(id);
                return Ok(tatuaje);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el tatuaje", error = ex.Message });
            }
        }

        [HttpGet("cliente/{idCliente}")]
        public ActionResult<List<Tatuaje>> GetTatuajesByClienteId(int idCliente)
        {
            if (idCliente <= 0)
            {
                return BadRequest(new { message = "El ID del cliente debe ser un número positivo" });
            }

            try
            {
                var tatuajes = _tatuajeService.GetTatuajesByClienteId(idCliente);
                return Ok(tatuajes);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los tatuajes del cliente", error = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult<Tatuaje> CrearTatuaje([FromBody] Tatuaje tatuaje)
        {
            try
            {
                var nuevoTatuaje = _tatuajeService.CrearTatuaje(tatuaje);
                return CreatedAtAction(nameof(GetTatuajeById), new { id = nuevoTatuaje.IdTatuaje }, nuevoTatuaje);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el tatuaje", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<Tatuaje> ActualizarTatuaje(int id, [FromBody] Tatuaje tatuaje)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del tatuaje debe ser un número positivo" });
            }

            try
            {
                var tatuajeActualizado = _tatuajeService.ActualizarTatuaje(id, tatuaje);
                return Ok(tatuajeActualizado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el tatuaje", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public ActionResult EliminarTatuaje(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del tatuaje debe ser un número positivo" });
            }

            try
            {
                var resultado = _tatuajeService.EliminarTatuaje(id);
                return Ok(new { message = "Tatuaje eliminado exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el tatuaje", error = ex.Message });
            }
        }

        [HttpPost("{idTatuaje}/pagos/{idPago}")]
        public ActionResult<PagoTatuaje> RegistrarPagoTatuaje(int idTatuaje, int idPago)
        {
            if (idTatuaje <= 0 || idPago <= 0)
            {
                return BadRequest(new { message = "Los IDs deben ser números positivos" });
            }

            try
            {
                var pagoTatuaje = _tatuajeService.RegistrarPagoTatuaje(idTatuaje, idPago);
                return Ok(new
                {
                    message = "Pago registrado para el tatuaje exitosamente",
                    data = pagoTatuaje
                });
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
                return StatusCode(500, new { message = "Error al registrar el pago para el tatuaje", error = ex.Message });
            }
        }

        [HttpDelete("{idTatuaje}/pagos/{idPago}")]
        public ActionResult EliminarPagoTatuaje(int idTatuaje, int idPago)
        {
            if (idTatuaje <= 0 || idPago <= 0)
            {
                return BadRequest(new { message = "Los IDs deben ser números positivos" });
            }

            try
            {
                var resultado = _tatuajeService.EliminarPagoTatuaje(idTatuaje, idPago);
                return Ok(new { message = "Pago eliminado del tatuaje exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el pago del tatuaje", error = ex.Message });
            }
        }

        [HttpGet("{idTatuaje}/pagos")]
        public ActionResult<List<Pago>> GetPagosByTatuajeId(int idTatuaje)
        {
            if (idTatuaje <= 0)
            {
                return BadRequest(new { message = "El ID del tatuaje debe ser un número positivo" });
            }

            try
            {
                var pagos = _tatuajeService.GetPagosByTatuajeId(idTatuaje);
                return Ok(pagos);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los pagos del tatuaje", error = ex.Message });
            }
        }

        [HttpPost("{idTatuaje}/citas/{idCita}")]
        public ActionResult<CitaTatuaje> AsignarCitaATatuaje(int idTatuaje, int idCita)
        {
            if (idTatuaje <= 0 || idCita <= 0)
            {
                return BadRequest(new { message = "Los IDs deben ser números positivos" });
            }

            try
            {
                var citaTatuaje = _tatuajeService.AsignarCitaATatuaje(idTatuaje, idCita);
                return Ok(new
                {
                    message = "Cita asignada al tatuaje exitosamente",
                    data = citaTatuaje
                });
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
                return StatusCode(500, new { message = "Error al asignar la cita al tatuaje", error = ex.Message });
            }
        }

        [HttpDelete("{idTatuaje}/citas/{idCita}")]
        public ActionResult DesasignarCitaDeTatuaje(int idTatuaje, int idCita)
        {
            if (idTatuaje <= 0 || idCita <= 0)
            {
                return BadRequest(new { message = "Los IDs deben ser números positivos" });
            }

            try
            {
                var resultado = _tatuajeService.DesasignarCitaDeTatuaje(idTatuaje, idCita);
                return Ok(new { message = "Cita desasignada del tatuaje exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al desasignar la cita del tatuaje", error = ex.Message });
            }
        }

        [HttpGet("{idTatuaje}/citas")]
        public ActionResult<List<CitaServicio>> GetCitasByTatuajeId(int idTatuaje)
        {
            if (idTatuaje <= 0)
            {
                return BadRequest(new { message = "El ID del tatuaje debe ser un número positivo" });
            }

            try
            {
                var citas = _tatuajeService.GetCitasByTatuajeId(idTatuaje);
                return Ok(citas);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener las citas del tatuaje", error = ex.Message });
            }
        }
    }
}
