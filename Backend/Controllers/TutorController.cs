using Backend.Models;
using Backend.Services.TutorService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TutorController : ControllerBase
    {
        private readonly ITutorService _tutorService;

        public TutorController(ITutorService tutorService)
        {
            _tutorService = tutorService;
        }

        [HttpGet]
        public ActionResult<List<Tutor>> GetAllTutores()
        {
            try
            {
                var tutores = _tutorService.GetAllTutores();
                return Ok(tutores);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los tutores", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Tutor> GetTutorById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del tutor debe ser un número positivo" });
            }

            try
            {
                var tutor = _tutorService.GetTutorById(id);
                return Ok(tutor);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el tutor", error = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult<Tutor> CrearTutor([FromBody] Tutor tutor)
        {
            try
            {
                var nuevoTutor = _tutorService.CrearTutor(tutor);
                return CreatedAtAction(nameof(GetTutorById), new { id = nuevoTutor.IdTutor }, nuevoTutor);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el tutor", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<Tutor> ActualizarTutor(int id, [FromBody] Tutor tutor)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del tutor debe ser un número positivo" });
            }

            try
            {
                var tutorActualizado = _tutorService.ActualizarTutor(id, tutor);
                return Ok(tutorActualizado);
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
                return StatusCode(500, new { message = "Error al actualizar el tutor", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public ActionResult EliminarTutor(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del tutor debe ser un número positivo" });
            }

            try
            {
                var resultado = _tutorService.EliminarTutor(id);
                return Ok(new { message = "Tutor eliminado exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el tutor", error = ex.Message });
            }
        }

        [HttpPost("{idTutor}/clientes/{idCliente}")]
        public ActionResult<ClienteTutor> AsignarClienteATutor(int idTutor, int idCliente)
        {
            if (idTutor <= 0 || idCliente <= 0)
            {
                return BadRequest(new { message = "Los IDs deben ser números positivos" });
            }

            try
            {
                var clienteTutor = _tutorService.AsignarClienteATutor(idTutor, idCliente);
                return Ok(new
                {
                    message = "Cliente asignado al tutor exitosamente",
                    data = clienteTutor
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
                return StatusCode(500, new { message = "Error al asignar el cliente al tutor", error = ex.Message });
            }
        }

        [HttpDelete("{idTutor}/clientes/{idCliente}")]
        public ActionResult DesasignarClienteDeTutor(int idTutor, int idCliente)
        {
            if (idTutor <= 0 || idCliente <= 0)
            {
                return BadRequest(new { message = "Los IDs deben ser números positivos" });
            }

            try
            {
                var resultado = _tutorService.DesasignarClienteDeTutor(idTutor, idCliente);
                return Ok(new { message = "Cliente desasignado del tutor exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al desasignar el cliente del tutor", error = ex.Message });
            }
        }

        [HttpGet("{idTutor}/clientes")]
        public ActionResult<List<Cliente>> GetClientesByTutorId(int idTutor)
        {
            if (idTutor <= 0)
            {
                return BadRequest(new { message = "El ID del tutor debe ser un número positivo" });
            }

            try
            {
                var clientes = _tutorService.GetClientesByTutorId(idTutor);
                return Ok(clientes);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los clientes del tutor", error = ex.Message });
            }
        }
    }
}
