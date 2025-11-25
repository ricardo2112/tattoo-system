namespace Backend.DTOs
{
    public class TipoCatalogoDto
    {
        public int IdTipoCatalogo { get; set; }
        public string NombreTipo { get; set; } = string.Empty;
        public List<CatalogoDto> Catalogos { get; set; } = new List<CatalogoDto>();
    }

    public class CatalogoDto
    {
        public int IdCatalogo { get; set; }
        public int IdTipoCatalogo { get; set; }
        public string NombreCatalogo { get; set; } = string.Empty;
    }
}
