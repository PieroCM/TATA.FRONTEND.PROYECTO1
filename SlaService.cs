using Microsoft.EntityFrameworkCore;
using TATA.BACKEND.PROYECTO1.CORE.Core.DTOs;
using TATA.BACKEND.PROYECTO1.CORE.Core.Interfaces;
using TATA.BACKEND.PROYECTO1.INFRASTRUCTURE.Data;

namespace TATA.BACKEND.PROYECTO1.CORE.Core.Services
{
    public class SlaService : ISlaService
    {
        private readonly ApplicationDbContext _context;

        public SlaService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<int>> GetAniosDisponibles()
        {
            // Ejemplo: Obtener años desde una tabla de tickets o SLA
            // Ajusta según tu modelo de datos
            var anios = await _context.Tickets
                .Where(t => t.FechaCreacion.HasValue)
                .Select(t => t.FechaCreacion!.Value.Year)
                .Distinct()
                .OrderByDescending(y => y)
                .ToListAsync();

            // Si no hay datos, devolver años por defecto
            if (!anios.Any())
            {
                var currentYear = DateTime.Now.Year;
                return new List<int> { currentYear - 2, currentYear - 1, currentYear, currentYear + 1 };
            }

            return anios;
        }

        public async Task<List<RolDisponibleDTO>> GetRolesDisponibles(int anio, int mes)
        {
            // Ejemplo: Obtener roles desde tickets del mes específico
            // Ajusta según tu modelo de datos
            var roles = await _context.Tickets
                .Where(t => t.FechaCreacion.HasValue 
                    && t.FechaCreacion.Value.Year == anio 
                    && t.FechaCreacion.Value.Month == mes
                    && !string.IsNullOrEmpty(t.RolAsignado))
                .GroupBy(t => t.RolAsignado)
                .Select(g => new RolDisponibleDTO
                {
                    Rol = g.Key ?? "Sin Rol",
                    Cantidad = g.Count()
                })
                .OrderByDescending(r => r.Cantidad)
                .ToListAsync();

            return roles;
        }

        public async Task<DashboardEjecutivoDTO> GetDashboardEjecutivo(int anio, int mes, List<string>? roles = null)
        {
            // Filtrar tickets del mes específico
            var query = _context.Tickets
                .Where(t => t.FechaCreacion.HasValue 
                    && t.FechaCreacion.Value.Year == anio 
                    && t.FechaCreacion.Value.Month == mes);

            // Aplicar filtro de roles si se proporciona
            if (roles != null && roles.Any())
            {
                query = query.Where(t => roles.Contains(t.RolAsignado ?? ""));
            }

            var tickets = await query.ToListAsync();

            if (!tickets.Any())
            {
                // Devolver datos vacíos si no hay información
                return new DashboardEjecutivoDTO
                {
                    SlaGlobalMensual = 0,
                    VariacionMesAnterior = 0,
                    MejorRol = "N/A",
                    CumplimientoPorRol = new List<CumplimientoRolDTO>(),
                    TodosLosRoles = new List<RolDisponibleDTO>()
                };
            }

            // Calcular SLA Global Mensual
            var totalTickets = tickets.Count;
            var ticketsCumplidos = tickets.Count(t => t.CumpleSLA == true);
            var slaGlobal = totalTickets > 0 ? (decimal)ticketsCumplidos / totalTickets * 100 : 0;

            // Calcular variación con mes anterior
            var mesAnterior = mes == 1 ? 12 : mes - 1;
            var anioAnterior = mes == 1 ? anio - 1 : anio;

            var ticketsMesAnterior = await _context.Tickets
                .Where(t => t.FechaCreacion.HasValue 
                    && t.FechaCreacion.Value.Year == anioAnterior 
                    && t.FechaCreacion.Value.Month == mesAnterior)
                .ToListAsync();

            decimal variacion = 0;
            if (ticketsMesAnterior.Any())
            {
                var slaMesAnterior = (decimal)ticketsMesAnterior.Count(t => t.CumpleSLA == true) / ticketsMesAnterior.Count * 100;
                variacion = slaGlobal - slaMesAnterior;
            }

            // Calcular cumplimiento por rol
            var cumplimientoPorRol = tickets
                .GroupBy(t => t.RolAsignado ?? "Sin Rol")
                .Select(g => new CumplimientoRolDTO
                {
                    Rol = g.Key,
                    TotalTickets = g.Count(),
                    TicketsCumplidos = g.Count(t => t.CumpleSLA == true),
                    PorcentajeCumplimiento = g.Count() > 0 
                        ? (decimal)g.Count(t => t.CumpleSLA == true) / g.Count() * 100 
                        : 0
                })
                .OrderByDescending(r => r.PorcentajeCumplimiento)
                .ToList();

            // Obtener mejor rol
            var mejorRol = cumplimientoPorRol.FirstOrDefault()?.Rol ?? "N/A";

            // Obtener todos los roles del mes para los chips
            var todosLosRoles = await GetRolesDisponibles(anio, mes);

            return new DashboardEjecutivoDTO
            {
                SlaGlobalMensual = Math.Round(slaGlobal, 1),
                VariacionMesAnterior = Math.Round(variacion, 1),
                MejorRol = mejorRol,
                CumplimientoPorRol = cumplimientoPorRol,
                TodosLosRoles = todosLosRoles
            };
        }
    }
}
