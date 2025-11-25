using System.Text.Json.Serialization;

namespace Backend.DTOs
{
    public class ApiCountryResponse
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("alpha2Code")]
        public string Alpha2Code { get; set; } = string.Empty;

        [JsonPropertyName("alpha3Code")]
        public string Alpha3Code { get; set; } = string.Empty;

        [JsonPropertyName("callingCodes")]
        public List<string> CallingCodes { get; set; } = new List<string>();

        [JsonPropertyName("flags")]
        public ApiFlags Flags { get; set; } = new ApiFlags();
    }

    public class ApiFlags
    {
        [JsonPropertyName("svg")]
        public string Svg { get; set; } = string.Empty;

        [JsonPropertyName("png")]
        public string Png { get; set; } = string.Empty;
    }
}
