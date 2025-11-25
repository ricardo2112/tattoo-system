using Backend.DTOs;
using System.Text.Json;

namespace Backend.Services.CountryService
{
    public class CountryService : ICountryService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiCountriesUrl = "https://www.apicountries.com";
        //private readonly string _apiRestCountries = "https://restcountries.com/v3.1";

        public CountryService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(_apiCountriesUrl);
        }

        public async Task<List<CountryDto>> GetAllCountriesAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/countries");

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"Error al obtener los países: {response.StatusCode}");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var apiCountries = JsonSerializer.Deserialize<List<ApiCountryResponse>>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiCountries == null)
                {
                    return new List<CountryDto>();
                }

                // Mapear a CountryDto
                var countries = apiCountries.Select(country => new CountryDto
                {
                    Name = country.Name,
                    Alpha2Code = country.Alpha2Code,
                    Alpha3Code = country.Alpha3Code,
                    CallingCodes = country.CallingCodes,
                    Flags = new FlagsDto
                    {
                        Svg = country.Flags.Svg,
                        Png = country.Flags.Png
                    }
                }).OrderBy(c => c.Name).ToList();

                return countries;
            }
            catch (HttpRequestException ex)
            {
                throw new Exception("Error al conectar con la API de países", ex);
            }
            catch (JsonException ex)
            {
                throw new Exception("Error al procesar la respuesta de la API", ex);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los países", ex);
            }
        }

        public async Task<CountryDto?> GetCountryByCodeAsync(string code)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(code))
                {
                    throw new ArgumentException("El código del país no puede estar vacío");
                }

                var response = await _httpClient.GetAsync($"/alpha/{code}");

                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return null;
                }

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"Error al obtener el país: {response.StatusCode}");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var apiCountry = JsonSerializer.Deserialize<ApiCountryResponse>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiCountry == null)
                {
                    return null;
                }

                // Mapear a CountryDto
                var country = new CountryDto
                {
                    Name = apiCountry.Name,
                    Alpha2Code = apiCountry.Alpha2Code,
                    Alpha3Code = apiCountry.Alpha3Code,
                    CallingCodes = apiCountry.CallingCodes,
                    Flags = new FlagsDto
                    {
                        Svg = apiCountry.Flags.Svg,
                        Png = apiCountry.Flags.Png
                    }
                };

                return country;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (HttpRequestException ex)
            {
                throw new Exception("Error al conectar con la API de países", ex);
            }
            catch (JsonException ex)
            {
                throw new Exception("Error al procesar la respuesta de la API", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener el país con código {code}", ex);
            }
        }
    }
}
