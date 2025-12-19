using Backend.Models;
using Backend.Services.CitaService;
using Backend.Services.LoggingService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CitaController : ControllerBase
    {
        private readonly ICitaService _citaService;
        private readonly ILoggingService _logger;

        public CitaController(ICitaService citaService, ILoggingService logger)
        {
            _citaService = citaService;
            _logger = logger;
        }

        [HttpGet]
        public ActionResult<List<CitaServicio>> GetAllCitas()
        {
            try
            {
                var citas = _citaService.GetAllCitas();
                return Ok(citas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener las citas", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<CitaServicio> GetCitaById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID de la cita debe ser un número positivo" });
            }

            try
            {
                var cita = _citaService.GetCitaById(id);
                return Ok(cita);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener la cita", error = ex.Message });
            }
        }

        [HttpGet("estado/{estado}")]
        public ActionResult<List<CitaServicio>> GetCitasByEstado(string estado)
        {
            if (string.IsNullOrWhiteSpace(estado))
            {
                return BadRequest(new { message = "El estado no puede estar vacío" });
            }

            try
            {
                var citas = _citaService.GetCitasByEstado(estado);
                return Ok(citas);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener las citas por estado", error = ex.Message });
            }
        }

        [HttpGet("fecha/{fecha}")]
        public ActionResult<List<CitaServicio>> GetCitasByFecha(DateTime fecha)
        {
            try
            {
                var citas = _citaService.GetCitasByFecha(fecha);
                return Ok(citas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener las citas por fecha", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<CitaServicio>> CrearCita([FromBody] CitaServicio cita, [FromQuery] string? clienteEmail = null, [FromQuery] string? clienteNombre = null)
        {
            try
            {
                
                var nuevaCita = await _citaService.CrearCitaAsync(cita, clienteEmail, clienteNombre);
                return CreatedAtAction(nameof(GetCitaById), new { id = nuevaCita.IdCita }, nuevaCita);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"[API] Validación fallida al crear cita: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError("[API] Error al crear la cita", ex);
                return StatusCode(500, new { message = "Error al crear la cita", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CitaServicio>> ActualizarCita(int id, [FromBody] CitaServicio cita, [FromQuery] string? clienteEmail = null, [FromQuery] string? clienteNombre = null)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID de la cita debe ser un número positivo" });
            }

            try
            {
                
                var citaActualizada = await _citaService.ActualizarCitaAsync(id, cita, clienteEmail, clienteNombre);
                return Ok(citaActualizada);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning($"[API] Cita no encontrada: {ex.Message}");
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"[API] Validación fallida al actualizar cita {id}: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[API] Error al actualizar la cita {id}", ex);
                return StatusCode(500, new { message = "Error al actualizar la cita", error = ex.Message });
            }
        }

        [HttpGet("{idCita}/tatuajes")]
        public ActionResult<List<Tatuaje>> GetTatuajesByCitaId(int idCita)
        {
            if (idCita <= 0)
            {
                return BadRequest(new { message = "El ID de la cita debe ser un número positivo" });
            }

            try
            {
                var tatuajes = _citaService.GetTatuajesByCitaId(idCita);
                return Ok(tatuajes);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los tatuajes de la cita", error = ex.Message });
            }
        }
    }
}
