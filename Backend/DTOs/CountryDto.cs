namespace Backend.DTOs
{
    public class CountryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Alpha2Code { get; set; } = string.Empty;
        public string Alpha3Code { get; set; } = string.Empty;
        public List<string> CallingCodes { get; set; } = new List<string>();
        public FlagsDto Flags { get; set; } = new FlagsDto();
    }

    public class FlagsDto
    {
        public string Svg { get; set; } = string.Empty;
        public string Png { get; set; } = string.Empty;
    }

    
}
