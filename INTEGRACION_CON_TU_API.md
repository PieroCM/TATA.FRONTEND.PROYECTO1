# 🎯 Integración Dashboard con tu API Real

## ✅ Cambios Realizados

El Dashboard ahora está **100% integrado** con tus endpoints existentes en `http://localhost:5260`

### 📊 Endpoints Utilizados

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/api/Solicitud` | GET | Obtiene todas las solicitudes para calcular SLA |
| `/api/RolRegistro` | GET | Obtiene los roles técnicos (Desarrollador, QA, etc.) |
| `/api/ConfigSla` | GET | Obtiene la configuración de días umbral por tipo de SLA |

### 🧮 Cálculos que Realiza el Frontend

#### 1. **SLA Global Mensual**
```javascript
// Fórmula:
SLA% = (Solicitudes que cumplen SLA / Total solicitudes) * 100

// Una solicitud cumple SLA si:
días_transcurridos = fecha_ingreso - fecha_solicitud
cumple_sla = días_transcurridos <= config_sla.dias_umbral
```

#### 2. **Variación vs Mes Anterior**
```javascript
// Compara el SLA del mes actual vs el mes anterior
variacion = SLA_mes_actual - SLA_mes_anterior
```

#### 3. **Cumplimiento por Rol**
```javascript
// Para cada rol_registro:
- Total de solicitudes del rol en el mes
- Solicitudes que cumplen SLA
- Porcentaje = (cumplen / total) * 100
```

#### 4. **Mejor Rol**
```javascript
// El rol con mayor porcentaje de cumplimiento SLA
mejor_rol = MAX(cumplimiento_por_rol)
```

## 🗄️ Estructura de Datos Esperada

### Solicitud (de tu API)
```json
{
  "idSolicitud": 1,
  "idPersonal": 5,
  "idSla": 2,
  "idRolRegistro": 3,
  "fechaSolicitud": "2025-11-01",
  "fechaIngreso": "2025-11-05",
  "estadoSolicitud": "COMPLETADA"
}
```

### RolRegistro
```json
{
  "idRolRegistro": 1,
  "nombreRol": "Desarrollador Sr.",
  "bloqueTech": "Desarrollo",
  "esActivo": true
}
```

### ConfigSla
```json
{
  "idSla": 1,
  "codigoSla": "SLA_NUEVO",
  "diasUmbral": 7,
  "tipoSolicitud": "NUEVO",
  "esActivo": true
}
```

## 🔧 Configuración Actual

**Archivo `.env`:**
```
VITE_API_BASE_URL=http://localhost:5260/api
```

**Axios Base URL:**
```javascript
// src/boot/axios.js
const api = axios.create({
  baseURL: 'http://localhost:5260/api'
})
```

## 🚀 Cómo Funciona el Flujo

1. **Usuario abre el Dashboard** → `onMounted()`
2. **Carga años disponibles** → Extrae años únicos de `fechaSolicitud`
3. **Carga roles disponibles** → Obtiene de `/RolRegistro` (solo activos)
4. **Carga datos del dashboard**:
   - Obtiene `/Solicitud`, `/RolRegistro`, `/ConfigSla`
   - Filtra por año y mes seleccionados
   - Filtra por roles seleccionados (si aplica)
   - Calcula métricas SLA en el frontend
   - Actualiza las tarjetas y gráficos

5. **Auto-refresh cada 30 segundos** → Recarga automáticamente

## 📋 Requisitos de tu API

### ✅ Ya tienes implementados:
- `GET /api/Solicitud` - SolicitudController
- `GET /api/RolRegistro` - RolRegistroController  
- `GET /api/ConfigSla` - ConfigSlaController

### ⚠️ Verifica que devuelvan:

**SolicitudController.cs** debe incluir las relaciones:
```csharp
[HttpGet]
public async Task<IActionResult> GetAll()
{
    var solicitudes = await _service.GetAll();
    // Debe incluir: idSolicitud, idRolRegistro, idSla, 
    //               fechaSolicitud, fechaIngreso
    return Ok(solicitudes);
}
```

**Campos críticos:**
- `fechaSolicitud` (DATE) - Para filtrar por mes/año
- `fechaIngreso` (DATE) - Para calcular días transcurridos
- `idRolRegistro` (INT) - Para agrupar por rol
- `idSla` (INT) - Para obtener días_umbral

## 🎨 Nombres de Propiedades en C#

El frontend espera estas propiedades (en camelCase por axios):

```csharp
// DTO de Solicitud
public class SolicitudDTO
{
    public int IdSolicitud { get; set; }        // → idSolicitud
    public int IdRolRegistro { get; set; }      // → idRolRegistro
    public int IdSla { get; set; }              // → idSla
    public DateTime FechaSolicitud { get; set; } // → fechaSolicitud
    public DateTime? FechaIngreso { get; set; }  // → fechaIngreso
}

// DTO de RolRegistro
public class RolRegistroDTO
{
    public int IdRolRegistro { get; set; }  // → idRolRegistro
    public string NombreRol { get; set; }   // → nombreRol
    public bool EsActivo { get; set; }      // → esActivo
}

// DTO de ConfigSla
public class ConfigSlaDTO
{
    public int IdSla { get; set; }          // → idSla
    public int DiasUmbral { get; set; }     // → diasUmbral
}
```

## 🧪 Prueba en Postman

### 1. Verifica que tus endpoints respondan:

```
GET http://localhost:5260/api/Solicitud
GET http://localhost:5260/api/RolRegistro
GET http://localhost:5260/api/ConfigSla
```

### 2. Verifica el formato JSON:

```json
// /api/Solicitud debe devolver algo como:
[
  {
    "idSolicitud": 1,
    "idPersonal": 2,
    "idSla": 1,
    "idRolRegistro": 3,
    "fechaSolicitud": "2025-11-15T00:00:00",
    "fechaIngreso": "2025-11-18T00:00:00"
  }
]
```

## ✨ Datos de Ejemplo

Si aún no tienes datos en la base de datos, el Dashboard mostrará:
- **Datos de ejemplo** cuando falla el API
- **Notificación amarilla** indicando que está usando datos de prueba
- **Botón "Reintentar"** para volver a consultar el API

## 🔄 Próximos Pasos

1. **Asegúrate de tener CORS configurado** (ver `CONFIGURACION_CORS_DOTNET.md`)
2. **Inserta datos de prueba** en tu base de datos
3. **Verifica que tu API esté corriendo** en http://localhost:5260
4. **Abre el Dashboard** en http://localhost:9000
5. **Verifica la consola del navegador** (F12) para ver las peticiones

## 🐛 Troubleshooting

### Error: "Cannot read properties of undefined"
→ Verifica que los DTOs tengan las propiedades correctas (FechaSolicitud, FechaIngreso, etc.)

### Error: "404 Not Found"
→ Verifica que los controladores estén registrados en Program.cs

### Error: "CORS Policy"
→ Agrega CORS en Program.cs (ver archivo de configuración)

### SLA muestra 0%
→ Verifica que:
- Hay solicitudes en el mes/año seleccionado
- Las solicitudes tienen `fechaIngreso` no nula
- La tabla `config_sla` tiene registros con `dias_umbral`
