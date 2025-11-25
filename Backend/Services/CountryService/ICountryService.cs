using Backend.DTOs;

namespace Backend.Services.CountryService
{
    public interface ICountryService
    {
        Task<List<CountryDto>> GetAllCountriesAsync();
        Task<CountryDto?> GetCountryByCodeAsync(string code);
    }
}
