using Microsoft.AspNetCore.Http;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Prueba_JWT.Custom;
using Prueba_JWT.Models;
using Prueba_JWT.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Prueba_JWT.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]

    public class ProductoController : ControllerBase
    {
        private readonly DbPruebaJwtContext _context;

        public ProductoController(DbPruebaJwtContext context)
        {
            _context = context;
        }
        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var lista = await _context.Productos.ToListAsync();
            return StatusCode(StatusCodes.Status200OK, new { value = lista });
        }
    }
}