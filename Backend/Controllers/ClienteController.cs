using Backend.Models;
using Backend.Services.ClienteService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        [HttpGet]
        public ActionResult<List<Cliente>> GetAllClientes()
        {
            try
            {
                var clientes = _clienteService.GetAllClientes();
                return Ok(clientes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los clientes", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Cliente> GetClienteById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del cliente debe ser un número positivo" });
            }

            try
            {
                var cliente = _clienteService.GetClienteById(id);
                return Ok(cliente);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el cliente", error = ex.Message });
            }
        }

        [HttpPost]
        public ActionResult<Cliente> CrearCliente([FromBody] Cliente cliente)
        {
            try
            {
                var nuevoCliente = _clienteService.CrearCliente(cliente);
                return CreatedAtAction(nameof(GetClienteById), new { id = nuevoCliente.IdCliente }, nuevoCliente);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el cliente", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<Cliente> ActualizarCliente(int id, [FromBody] Cliente cliente)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del cliente debe ser un número positivo" });
            }

            try
            {
                var clienteActualizado = _clienteService.ActualizarCliente(id, cliente);
                return Ok(clienteActualizado);
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
                return StatusCode(500, new { message = "Error al actualizar el cliente", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public ActionResult EliminarCliente(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El ID del cliente debe ser un número positivo" });
            }

            try
            {
                var resultado = _clienteService.EliminarCliente(id);
                return Ok(new { message = "Cliente eliminado exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el cliente", error = ex.Message });
            }
        }

        [HttpPost("{idCliente}/tutores/{idTutor}")]
        public ActionResult<ClienteTutor> AsignarTutorACliente(int idCliente, int idTutor)
        {
            if (idCliente <= 0 || idTutor <= 0)
            {
                return BadRequest(new { message = "Los IDs deben ser números positivos" });
            }

            try
            {
                var clienteTutor = _clienteService.AsignarTutorACliente(idCliente, idTutor);
                return Ok(new
                {
                    message = "Tutor asignado al cliente exitosamente",
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
                return StatusCode(500, new { message = "Error al asignar el tutor al cliente", error = ex.Message });
            }
        }

        [HttpDelete("{idCliente}/tutores/{idTutor}")]
        public ActionResult DesasignarTutorDeCliente(int idCliente, int idTutor)
        {
            if (idCliente <= 0 || idTutor <= 0)
            {
                return BadRequest(new { message = "Los IDs deben ser números positivos" });
            }

            try
            {
                var resultado = _clienteService.DesasignarTutorDeCliente(idCliente, idTutor);
                return Ok(new { message = "Tutor desasignado del cliente exitosamente", success = resultado });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al desasignar el tutor del cliente", error = ex.Message });
            }
        }

        [HttpGet("{idCliente}/tutores")]
        public ActionResult<List<Tutor>> GetTutoresByClienteId(int idCliente)
        {
            if (idCliente <= 0)
            {
                return BadRequest(new { message = "El ID del cliente debe ser un número positivo" });
            }

            try
            {
                var tutores = _clienteService.GetTutoresByClienteId(idCliente);
                return Ok(tutores);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los tutores del cliente", error = ex.Message });
            }
        }
    }
}
