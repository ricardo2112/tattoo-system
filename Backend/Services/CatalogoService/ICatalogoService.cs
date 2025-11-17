using Backend.DTOs;
using Backend.Models;

namespace Backend.Services.CatalogoService
{
    public interface ICatalogoService
    {
        List<TipoCatalogo> GetAllCatalogos();
        Catalogo GetCatalogoById(int id);
        Catalogo CrearCatalogo(Catalogo catalogo);
        Catalogo ActualizarCatalogo(int id, Catalogo catalogo);
    }
}
