using Backend.DTOs;
using Backend.Models;

namespace Backend.Services.CatalogoService
{
    public interface ICatalogoService
    {
        List<TipoCatalogoDto> GetAllCatalogos();
        Catalogo GetCatalogoById(int id);
        Catalogo CrearCatalogo(Catalogo catalogo);
        Catalogo ActualizarCatalogo(int id, Catalogo catalogo);
        List<string> GetCatalogoByTipo(int idTipo);
    }
}
