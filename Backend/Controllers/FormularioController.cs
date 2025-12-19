using Backend.Models;
using Backend.Services.FormularioService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormularioController : ControllerBase
    {
        private readonly IFormularioService _formularioService;

        public FormularioController(IFormularioService formularioService)
        {
            _formularioService = formularioService;
        }

        [HttpGet]
        public ActionResult<List<Formulario>> GetAllFormularios()
        {
            try
            {
                var formularios = _formularioService.GetAllFormularios();
                return Ok(formularios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los formularios", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Formulario> GetFormularioById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del formulario debe ser un número positivo" });
            }

            try
            {
                var formulario = _formularioService.GetFormularioById(id);
                return Ok(formulario);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el formulario", error = ex.Message });
            }
        }

        [HttpGet("evento/{evento}")]
        public ActionResult<Formulario> GetFormularioPorEvento(string evento)
        {
            if (string.IsNullOrWhiteSpace(evento))
            {
                return BadRequest(new { message = "El nombre del evento es requerido" });
            }

            try
            {
                var formulario = _formularioService.GetFormularioPorEvento(evento);

                if (formulario == null)
                {
                    return NotFound(new { message = $"No se encontró un formulario activo para el evento '{evento}'" });
                }

                return Ok(formulario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el formulario por evento", error = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult<Formulario> CrearFormulario([FromBody] Formulario formulario)
        {
            try
            {
                var nuevoFormulario = _formularioService.CrearFormulario(formulario);
                return CreatedAtAction(nameof(GetFormularioById), new { id = nuevoFormulario.IdFormulario }, nuevoFormulario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el formulario", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<Formulario> ActualizarFormulario(int id, [FromBody] Formulario formulario)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del formulario debe ser un número positivo" });
            }

            try
            {
                var formularioActualizado = _formularioService.ActualizarFormulario(id, formulario);
                return Ok(formularioActualizado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el formulario", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public ActionResult EliminarFormulario(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del formulario debe ser un número positivo" });
            }

            try
            {
                var resultado = _formularioService.EliminarFormulario(id);
                return Ok(new { message = "Formulario eliminado exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el formulario", error = ex.Message });
            }
        }

        [HttpGet("eventos")]
        public ActionResult<List<EventoFormulario>> GetAllEventos()
        {
            try
            {
                var eventos = _formularioService.GetAllEventos();
                return Ok(eventos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los eventos", error = ex.Message });
            }
        }

        [HttpPut("eventos/{idEvento}/asignar/{idFormulario}")]
        public ActionResult<EventoFormulario> AsignarFormularioAEvento(int idEvento, int idFormulario)
        {
            if (idEvento <= 0 || idFormulario <= 0)
            {
                return BadRequest(new { message = "Los IDs deben ser números positivos" });
            }

            try
            {
                var eventoFormulario = _formularioService.AsignarFormularioAEvento(idEvento, idFormulario);
                return Ok(new
                {
                    message = "Formulario asignado al evento exitosamente. El formulario anterior ha sido desactivado automáticamente.",
                    data = eventoFormulario
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
                return StatusCode(500, new { message = "Error al asignar el formulario al evento", error = ex.Message });
            }
        }

        [HttpPut("eventos/{idEvento}/desasignar")]
        public ActionResult DesasignarFormularioDeEvento(int idEvento)
        {
            if (idEvento <= 0)
            {
                return BadRequest(new { message = "El ID del evento debe ser un número positivo" });
            }

            try
            {
                var resultado = _formularioService.DesasignarFormularioDeEvento(idEvento);
                return Ok(new { message = "Formulario desasignado del evento exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al desasignar el formulario del evento", error = ex.Message });
            }
        }
    }
}
