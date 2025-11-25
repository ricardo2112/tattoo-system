using Backend.DTOs;
using Backend.Services.CountryService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CountryController : ControllerBase
    {
        private readonly ICountryService _countryService;

        public CountryController(ICountryService service)
        {
            _countryService = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<CountryDto>>> GetAllCountries()
        {
            try
            {
                var countries = await _countryService.GetAllCountriesAsync();
                return Ok(countries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los países", error = ex.Message });
            }
        }

        [HttpGet("{code}")]
        public async Task<ActionResult<CountryDto>> GetCountryByCode(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(new { message = "El código del país no puede estar vacío" });
            }

            try
            {
                var country = await _countryService.GetCountryByCodeAsync(code);

                if (country == null)
                {
                    return NotFound(new { message = $"No se encontró un país con el código {code}" });
                }

                return Ok(country);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el país", error = ex.Message });
            }
        }
    }
}
