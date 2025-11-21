# 🎯 Implementación del API de SLA para Dashboard

He creado **4 archivos** que debes agregar a tu proyecto .NET en Visual Studio 2022:

## 📁 Estructura de Archivos

```
TATA.BACKEND.PROYECTO1.API/
├── Controllers/
│   └── SlaController.cs          ← Copiar este archivo
│
TATA.BACKEND.PROYECTO1.CORE/
├── Core/
│   ├── DTOs/
│   │   └── SlaDTOs.cs            ← Copiar este archivo
│   ├── Interfaces/
│   │   └── ISlaService.cs        ← Copiar este archivo
│   └── Services/
│       └── SlaService.cs         ← Copiar este archivo
```

## ✅ Paso 1: Copiar los Archivos

Los 4 archivos están en: `D:\REPOS\Fronen.Proyecto_wed_01\TATA.FRONTEND.PROYECTO1\`

1. **SlaController.cs** → Copia a: `TATA.BACKEND.PROYECTO1.API/Controllers/`
2. **SlaDTOs.cs** → Copia a: `TATA.BACKEND.PROYECTO1.CORE/Core/DTOs/`
3. **ISlaService.cs** → Copia a: `TATA.BACKEND.PROYECTO1.CORE/Core/Interfaces/`
4. **SlaService.cs** → Copia a: `TATA.BACKEND.PROYECTO1.CORE/Core/Services/`

## ⚙️ Paso 2: Registrar el Servicio en Program.cs

Abre `Program.cs` y agrega antes de `var app = builder.Build();`:

```csharp
// Registrar servicio de SLA
builder.Services.AddScoped<ISlaService, SlaService>();
```

## 🗄️ Paso 3: Ajustar el Modelo de Datos

El código asume que tienes una tabla `Tickets` con estos campos:
- `FechaCreacion` (DateTime?)
- `RolAsignado` (string?)
- `CumpleSLA` (bool?)

**Si tu modelo es diferente**, necesitas ajustar `SlaService.cs` en los métodos:
- `GetAniosDisponibles()` - línea 21
- `GetRolesDisponibles()` - línea 38
- `GetDashboardEjecutivo()` - línea 54

### Ejemplo de ajuste si tu tabla se llama diferente:

```csharp
// ANTES (en el código que generé)
var anios = await _context.Tickets
    .Where(t => t.FechaCreacion.HasValue)
    .Select(t => t.FechaCreacion!.Value.Year)

// DESPUÉS (si tu tabla se llama TicketsSLA)
var anios = await _context.TicketsSLA
    .Where(t => t.Fecha.HasValue)
    .Select(t => t.Fecha!.Value.Year)
```

## 🔧 Paso 4: Configurar CORS (si aún no lo hiciste)

En `Program.cs`, asegúrate de tener:

```csharp
// ANTES de var app = builder.Build();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowQuasarApp", policy =>
    {
        policy.WithOrigins("http://localhost:9000")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// DESPUÉS de var app = builder.Build();
app.UseCors("AllowQuasarApp");
```

## 🚀 Paso 5: Probar los Endpoints

Una vez implementado, reinicia tu API (Shift+F5, luego F5) y prueba:

1. **GET** `http://localhost:5260/api/sla/anios-disponibles`
2. **GET** `http://localhost:5260/api/sla/roles-disponibles?anio=2025&mes=11`
3. **GET** `http://localhost:5260/api/sla/dashboard-ejecutivo?anio=2025&mes=11&roles=Desarrollador Sr.,QA`

## 📊 Estructura de Datos Esperada

### Tabla Tickets (ejemplo)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| IdTicket | int | ID del ticket |
| FechaCreacion | DateTime? | Fecha de creación |
| RolAsignado | string? | Rol responsable (ej: "Desarrollador Sr.") |
| CumpleSLA | bool? | ¿Cumple el SLA? (true/false) |
| ... | ... | Otros campos de tu modelo |

## ⚠️ Importante

**Ajusta los nombres de:**
1. Tu DbContext (busca `ApplicationDbContext` y cámbialo por el tuyo)
2. Tu tabla de datos (busca `Tickets` y cámbialo por tu tabla)
3. Los campos (busca `FechaCreacion`, `RolAsignado`, `CumpleSLA` y ajusta según tu modelo)

## 🎯 Siguiente Paso

Después de implementar estos archivos:
1. Compila tu proyecto en Visual Studio (Ctrl+Shift+B)
2. Ejecuta tu API (F5)
3. Refresca tu navegador en el dashboard (http://localhost:9000)

¡El dashboard debería cargar datos reales de tu base de datos!
