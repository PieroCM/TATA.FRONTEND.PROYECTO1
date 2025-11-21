# 🔗 Conexión Frontend Quasar ↔️ API .NET

## 📋 Requisitos Previos

1. ✅ Visual Studio 2022 con tu API .NET corriendo
2. ✅ Node.js y npm instalados
3. ✅ Quasar CLI instalado globalmente

---

## 🚀 Pasos para Conectar

### 1️⃣ Configurar la API en Visual Studio 2022

#### A. Verificar el Puerto de la API
- Abre tu proyecto en Visual Studio 2022
- Ve a `Properties/launchSettings.json`
- Verifica el puerto HTTPS (por defecto es 7010)
- Si es diferente, actualiza el archivo `.env` en el proyecto Quasar

#### B. Habilitar CORS
Agrega esto en tu `Program.cs`:

```csharp
// Antes de builder.Build()
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowQuasarApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:9000", "http://127.0.0.1:9000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Después de app.Build(), antes de app.UseHttpsRedirection()
app.UseCors("AllowQuasarApp");
```

#### C. Implementar el Controlador
Crea el archivo `Controllers/SlaController.cs` con el código del archivo `API_DOTNET_MODELS.md`

---

### 2️⃣ Configurar el Frontend Quasar

#### A. Verificar la URL de la API
Abre el archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=https://localhost:7010/api
```

Si tu API corre en otro puerto, cámbialo aquí.

#### B. Instalar Dependencias (si no lo has hecho)
```bash
cd TATA.FRONTEND.PROYECTO1
npm install
```

#### C. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

O si prefieres usar Quasar CLI:
```bash
quasar dev
```

---

### 3️⃣ Ejecutar Ambos Proyectos

#### Terminal 1 - API .NET (Visual Studio)
1. Abre tu solución en Visual Studio 2022
2. Presiona `F5` o haz clic en "▶ Iniciar"
3. Verifica que corra en `https://localhost:7010`
4. Abre Swagger: `https://localhost:7010/swagger`

#### Terminal 2 - Frontend Quasar (VS Code)
```bash
cd D:\REPOS\Fronen.Proyecto_wed_01\TATA.FRONTEND.PROYECTO1
npm run dev
```

El frontend abrirá en: `http://localhost:9000`

---

## 🔍 Verificar la Conexión

### 1. Probar la API directamente
Abre en tu navegador:
```
https://localhost:7010/api/sla/dashboard-ejecutivo?anio=2025&mes=11
```

Deberías ver un JSON con los datos.

### 2. Ver las peticiones en la Consola del Navegador
1. Abre el dashboard en `http://localhost:9000`
2. Abre DevTools (F12)
3. Ve a la pestaña "Network" o "Red"
4. Recarga la página
5. Busca la petición a `dashboard-ejecutivo`
6. Verifica que retorne status 200

---

## 🐛 Solución de Problemas

### ❌ Error: "No se pudo conectar con el servidor"

**Causa:** La API no está corriendo o el puerto es incorrecto

**Solución:**
1. Verifica que Visual Studio esté ejecutando la API (F5)
2. Confirma el puerto en `launchSettings.json`
3. Actualiza `.env` si el puerto es diferente
4. Reinicia el servidor Quasar después de cambiar `.env`

---

### ❌ Error: CORS

**Causa:** CORS no está configurado correctamente

**Solución:**
```csharp
// En Program.cs, asegúrate de tener:
app.UseCors("AllowQuasarApp");

// ANTES DE:
app.UseAuthorization();
```

---

### ❌ Error 404: Endpoint no encontrado

**Causa:** La ruta del endpoint no coincide

**Solución:**
1. Verifica que tu controlador tenga:
```csharp
[Route("api/[controller]")]
[ApiController]
public class SlaController : ControllerBase
{
    [HttpGet("dashboard-ejecutivo")]
    public async Task<ActionResult<DashboardEjecutivoResponse>> GetDashboardEjecutivo(...)
}
```

2. La URL completa debe ser: `https://localhost:7010/api/sla/dashboard-ejecutivo`

---

### ❌ Certificado SSL no confiable

**Causa:** Certificado de desarrollo de .NET no instalado

**Solución:**
```bash
dotnet dev-certs https --trust
```

O en el navegador, acepta el certificado de desarrollo.

---

## 📊 Endpoints del Dashboard

### GET /api/sla/dashboard-ejecutivo
Obtiene los datos del dashboard ejecutivo

**Query Parameters:**
- `anio` (int): Año a consultar
- `mes` (int): Mes (1-12)
- `roles` (string): Roles separados por coma

**Ejemplo:**
```
GET https://localhost:7010/api/sla/dashboard-ejecutivo?anio=2025&mes=11&roles=Desarrollador Sr.,QA Analyst
```

**Response:**
```json
{
  "slaGlobalMensual": 89.4,
  "variacionMesAnterior": 3.1,
  "mejorRol": "Desarrollador Sr.",
  "cumplimientoPorRol": [
    {
      "rol": "Desarrollador Sr.",
      "porcentajeCumplimiento": 95.0
    }
  ],
  "todosLosRoles": [
    {
      "rol": "Desarrollador Sr.",
      "cantidad": 20
    }
  ]
}
```

---

## 🔧 Configuración Adicional

### Cambiar Puerto de la API
1. Edita `.env`:
```env
VITE_API_BASE_URL=https://localhost:TU_PUERTO/api
```

2. Reinicia el servidor Quasar:
```bash
npm run dev
```

### Deshabilitar Notificaciones de Error
En `src/boot/axios.js`, comenta las líneas de `Notify.create()` en el interceptor de errores.

---

## ✅ Checklist de Verificación

- [ ] API .NET corriendo en Visual Studio 2022
- [ ] Puerto correcto en `.env`
- [ ] CORS configurado en la API
- [ ] Controlador SlaController creado
- [ ] Endpoint responde correctamente en Swagger
- [ ] Frontend Quasar corriendo
- [ ] Dashboard carga sin errores
- [ ] Datos se muestran correctamente

---

## 📞 Datos de Conexión por Defecto

| Componente | URL | Puerto |
|------------|-----|--------|
| API .NET | https://localhost:7010 | 7010 |
| Frontend Quasar | http://localhost:9000 | 9000 |
| Swagger | https://localhost:7010/swagger | 7010 |

---

## 🎯 Próximos Pasos

1. ✅ Verifica que ambos proyectos estén corriendo
2. ✅ Prueba el endpoint en Swagger
3. ✅ Abre el dashboard y verifica que cargue los datos
4. ⚙️ Ajusta los filtros (año, mes, roles) y observa los cambios
5. 📊 Implementa endpoints adicionales según necesites

---

¡Listo! Ahora tu Dashboard de Quasar está conectado a tu API de .NET en Visual Studio 2022. 🚀
