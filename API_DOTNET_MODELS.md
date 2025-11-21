# 🔧 Modelos y Controladores para API .NET (Visual Studio 2022)

## 📋 Estructura de la API

Tu API en Visual Studio 2022 debe tener estos componentes para conectarse con el Dashboard:

---

## 1️⃣ Modelos C# (Models/)

### DashboardEjecutivoResponse.cs
```csharp
namespace TCS.SLA.API.Models
{
    public class DashboardEjecutivoResponse
    {
        public decimal SlaGlobalMensual { get; set; }
        public decimal VariacionMesAnterior { get; set; }
        public string MejorRol { get; set; }
        public List<CumplimientoRolDto> CumplimientoPorRol { get; set; }
        public List<RolDisponibleDto> TodosLosRoles { get; set; }
    }

    public class CumplimientoRolDto
    {
        public string Rol { get; set; }
        public decimal PorcentajeCumplimiento { get; set; }
    }

    public class RolDisponibleDto
    {
        public string Rol { get; set; }
        public int Cantidad { get; set; }
    }
}
```

---

## 2️⃣ Controlador (Controllers/SlaController.cs)

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TCS.SLA.API.Data;
using TCS.SLA.API.Models;

namespace TCS.SLA.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SlaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SlaController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene los años disponibles en la base de datos
        /// </summary>
        [HttpGet("anios-disponibles")]
        public async Task<ActionResult<List<int>>> GetAniosDisponibles()
        {
            try
            {
                var anios = await _context.Tickets
                    .Select(t => t.FechaCreacion.Year)
                    .Distinct()
                    .OrderByDescending(y => y)
                    .ToListAsync();

                if (anios.Count == 0)
                {
                    var currentYear = DateTime.Now.Year;
                    return Ok(new List<int> { currentYear - 1, currentYear, currentYear + 1 });
                }

                return Ok(anios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener años", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene los roles disponibles para un mes específico
        /// </summary>
        [HttpGet("roles-disponibles")]
        public async Task<ActionResult<List<RolDisponibleDto>>> GetRolesDisponibles(
            [FromQuery] int anio,
            [FromQuery] int mes)
        {
            try
            {
                var roles = await _context.Tickets
                    .Where(t => t.FechaCreacion.Year == anio && t.FechaCreacion.Month == mes)
                    .GroupBy(t => t.Rol)
                    .Select(g => new RolDisponibleDto
                    {
                        Rol = g.Key,
                        Cantidad = g.Count()
                    })
                    .OrderBy(r => r.Rol)
                    .ToListAsync();

                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener roles", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene los datos del Dashboard Ejecutivo Mensual
        /// </summary>
        /// <param name="anio">Año a consultar</param>
        /// <param name="mes">Mes a consultar (1-12)</param>
        /// <param name="roles">Roles separados por coma (opcional)</param>
        [HttpGet("dashboard-ejecutivo")]
        public async Task<ActionResult<DashboardEjecutivoResponse>> GetDashboardEjecutivo(
            [FromQuery] int anio = 2025,
            [FromQuery] int mes = 11,
            [FromQuery] string? roles = null)
        {
            try
            {
                var rolesArray = string.IsNullOrEmpty(roles) 
                    ? new string[] { } 
                    : roles.Split(',').Select(r => r.Trim()).ToArray();

                // Calcular SLA Global del mes
                var slaGlobal = await CalcularSlaGlobalMensual(anio, mes, rolesArray);
                
                // Calcular variación con mes anterior
                var mesAnterior = mes == 1 ? 12 : mes - 1;
                var anioAnterior = mes == 1 ? anio - 1 : anio;
                var slaAnterior = await CalcularSlaGlobalMensual(anioAnterior, mesAnterior, rolesArray);
                var variacion = slaGlobal - slaAnterior;

                // Obtener cumplimiento por rol
                var cumplimientoPorRol = await ObtenerCumplimientoPorRol(anio, mes, rolesArray);

                // Obtener mejor rol
                var mejorRol = cumplimientoPorRol
                    .OrderByDescending(r => r.PorcentajeCumplimiento)
                    .FirstOrDefault()?.Rol ?? "N/A";

                // Obtener todos los roles disponibles
                var todosLosRoles = await ObtenerRolesDisponibles(anio, mes);

                var response = new DashboardEjecutivoResponse
                {
                    SlaGlobalMensual = slaGlobal,
                    VariacionMesAnterior = variacion,
                    MejorRol = mejorRol,
                    CumplimientoPorRol = cumplimientoPorRol,
                    TodosLosRoles = todosLosRoles
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener datos del dashboard", error = ex.Message });
            }
        }

        private async Task<decimal> CalcularSlaGlobalMensual(int anio, int mes, string[] roles)
        {
            // Aquí va tu lógica para calcular el SLA desde SQL Server
            var query = _context.Tickets
                .Where(t => t.FechaCreacion.Year == anio && t.FechaCreacion.Month == mes);

            if (roles.Length > 0)
            {
                query = query.Where(t => roles.Contains(t.Rol));
            }

            var totalTickets = await query.CountAsync();
            if (totalTickets == 0) return 0;

            var ticketsCumplidos = await query.CountAsync(t => t.CumpleSla);
            
            return Math.Round((decimal)ticketsCumplidos / totalTickets * 100, 1);
        }

        private async Task<List<CumplimientoRolDto>> ObtenerCumplimientoPorRol(int anio, int mes, string[] roles)
        {
            var query = _context.Tickets
                .Where(t => t.FechaCreacion.Year == anio && t.FechaCreacion.Month == mes);

            if (roles.Length > 0)
            {
                query = query.Where(t => roles.Contains(t.Rol));
            }

            var cumplimiento = await query
                .GroupBy(t => t.Rol)
                .Select(g => new CumplimientoRolDto
                {
                    Rol = g.Key,
                    PorcentajeCumplimiento = Math.Round(
                        (decimal)g.Count(t => t.CumpleSla) / g.Count() * 100, 1)
                })
                .OrderByDescending(r => r.PorcentajeCumplimiento)
                .ToListAsync();

            return cumplimiento;
        }

        private async Task<List<RolDisponibleDto>> ObtenerRolesDisponibles(int anio, int mes)
        {
            var roles = await _context.Tickets
                .Where(t => t.FechaCreacion.Year == anio && t.FechaCreacion.Month == mes)
                .GroupBy(t => t.Rol)
                .Select(g => new RolDisponibleDto
                {
                    Rol = g.Key,
                    Cantidad = g.Count()
                })
                .OrderBy(r => r.Rol)
                .ToListAsync();

            return roles;
        }
    }
}
```

---

## 3️⃣ Modelo de Entidad (Models/Ticket.cs)

```csharp
namespace TCS.SLA.API.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public string Rol { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaResolucion { get; set; }
        public bool CumpleSla { get; set; }
        public int TiempoRespuesta { get; set; } // en horas
        public string Estado { get; set; }
        public string Prioridad { get; set; }
    }
}
```

---

## 4️⃣ Configuración CORS (Program.cs)

```csharp
// En Program.cs, antes de var app = builder.Build();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowQuasarApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:9000") // URL de tu Quasar app
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Después de var app = builder.Build();

app.UseCors("AllowQuasarApp");
```

---

## 5️⃣ Endpoints disponibles

### GET /api/sla/anios-disponibles
Obtiene la lista de años disponibles en la base de datos

**Ejemplo de Request:**
```
GET https://localhost:7010/api/sla/anios-disponibles
```

**Ejemplo de Response:**
```json
[2023, 2024, 2025]
```

---

### GET /api/sla/roles-disponibles
Obtiene los roles disponibles para un mes específico

**Query Parameters:**
- `anio` (int): Año a consultar
- `mes` (int): Mes (1-12)

**Ejemplo de Request:**
```
GET https://localhost:7010/api/sla/roles-disponibles?anio=2025&mes=11
```

**Ejemplo de Response:**
```json
[
  {
    "rol": "Desarrollador Sr.",
    "cantidad": 20
  },
  {
    "rol": "QA Analyst",
    "cantidad": 15
  }
]
```

---

### GET /api/sla/dashboard-ejecutivo
Obtiene los datos del dashboard ejecutivo

**Query Parameters:**
- `anio` (int): Año a consultar (default: 2025)
- `mes` (int): Mes a consultar 1-12 (default: 11)
- `roles` (string): Roles separados por coma (ej: "Desarrollador Sr.,QA Analyst")

**Ejemplo de Request:**
```
GET https://localhost:7010/api/sla/dashboard-ejecutivo?anio=2025&mes=11&roles=Desarrollador Sr.,QA Analyst
```

**Ejemplo de Response:**
```json
{
  "slaGlobalMensual": 89.4,
  "variacionMesAnterior": 3.1,
  "mejorRol": "Desarrollador Sr.",
  "cumplimientoPorRol": [
    {
      "rol": "Desarrollador Sr.",
      "porcentajeCumplimiento": 95.0
    },
    {
      "rol": "QA Analyst",
      "porcentajeCumplimiento": 88.0
    },
    {
      "rol": "DevOps Engineer",
      "porcentajeCumplimiento": 92.0
    }
  ],
  "todosLosRoles": [
    {
      "rol": "Desarrollador Sr.",
      "cantidad": 20
    },
    {
      "rol": "QA Analyst",
      "cantidad": 15
    },
    {
      "rol": "DevOps Engineer",
      "cantidad": 12
    }
  ]
}
```

---

## 6️⃣ Base de Datos (DbContext)

```csharp
using Microsoft.EntityFrameworkCore;
using TCS.SLA.API.Models;

namespace TCS.SLA.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones adicionales si son necesarias
            modelBuilder.Entity<Ticket>()
                .HasIndex(t => new { t.FechaCreacion, t.Rol });
        }
    }
}
```

---

## 🚀 Pasos para implementar en Visual Studio 2022

1. **Crear los modelos** en la carpeta `Models/`
2. **Crear el controlador** `SlaController.cs` en `Controllers/`
3. **Configurar CORS** en `Program.cs`
4. **Actualizar DbContext** si es necesario
5. **Ejecutar la API** (F5 en Visual Studio)
6. **Verificar que corra en** `https://localhost:7010`
7. **Probar el endpoint** con Postman o Swagger

---

## 🔍 Verificación

Para probar que tu API funciona:

1. Abre Swagger: `https://localhost:7010/swagger`
2. Busca el endpoint `/api/sla/dashboard-ejecutivo`
3. Haz una petición de prueba
4. Verifica que retorne los datos correctamente

---

## 📝 Notas Importantes

- La URL base está configurada en `src/boot/axios.js`: `https://localhost:7010/api`
- Asegúrate de que tu API esté corriendo en el puerto 7010
- El frontend maneja automáticamente los errores de conexión
- Si la API no está disponible, el dashboard mostrará datos de ejemplo

---

## 🔐 Seguridad (Opcional)

Si necesitas autenticación JWT:

```csharp
[Authorize] // Agregar este atributo al controlador o método
[HttpGet("dashboard-ejecutivo")]
public async Task<ActionResult<DashboardEjecutivoResponse>> GetDashboardEjecutivo(...)
{
    // ...
}
```
