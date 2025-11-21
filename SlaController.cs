using Microsoft.AspNetCore.Mvc;
using TATA.BACKEND.PROYECTO1.CORE.Core.DTOs;
using TATA.BACKEND.PROYECTO1.CORE.Core.Interfaces;

namespace TATA.BACKEND.PROYECTO1.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SlaController : ControllerBase
    {
        private readonly ISlaService _slaService;

        public SlaController(ISlaService slaService)
        {
            _slaService = slaService;
        }

        /// <summary>
        /// Obtiene los años disponibles para filtrar
        /// GET: api/sla/anios-disponibles
        /// </summary>
        [HttpGet("anios-disponibles")]
        public async Task<IActionResult> GetAniosDisponibles()
        {
            try
            {
                var anios = await _slaService.GetAniosDisponibles();
                return Ok(anios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener años disponibles", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene los roles disponibles para un año y mes específicos
        /// GET: api/sla/roles-disponibles?anio=2025&mes=11
        /// </summary>
        [HttpGet("roles-disponibles")]
        public async Task<IActionResult> GetRolesDisponibles([FromQuery] int anio, [FromQuery] int mes)
        {
            try
            {
                var roles = await _slaService.GetRolesDisponibles(anio, mes);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener roles disponibles", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene los datos del dashboard ejecutivo de SLA
        /// GET: api/sla/dashboard-ejecutivo?anio=2025&mes=11&roles=Desarrollador Sr.,QA Analyst
        /// </summary>
        [HttpGet("dashboard-ejecutivo")]
        public async Task<IActionResult> GetDashboardEjecutivo(
            [FromQuery] int anio, 
            [FromQuery] int mes, 
            [FromQuery] string? roles = null)
        {
            try
            {
                // Convertir string de roles separados por coma a lista
                List<string>? listaRoles = null;
                if (!string.IsNullOrEmpty(roles))
                {
                    listaRoles = roles.Split(',').Select(r => r.Trim()).ToList();
                }

                var dashboardData = await _slaService.GetDashboardEjecutivo(anio, mes, listaRoles);
                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener datos del dashboard", error = ex.Message });
            }
        }
    }
}
