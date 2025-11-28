# ✅ VERIFICACIÓN RÁPIDA DE CONEXIÓN

## 🎯 Objetivo

Verificar que el frontend se conecte correctamente con el backend y cargue las alertas de la base de datos.

---

## 📋 CHECKLIST PRE-VERIFICACIÓN

### Backend

- [ ] El backend está corriendo en `http://localhost:5260`
- [ ] `AlertasController.cs` está copiado en `TATA.BACKEND.PROYECTO1.API/Controllers/`
- [ ] Las entidades están configuradas con los atributos `[Table]` y `[Column]`
- [ ] El `ApplicationDbContext` tiene los `DbSet` necesarios
- [ ] La cadena de conexión a SQL Server es correcta

### Base de Datos

- [ ] SQL Server está corriendo
- [ ] La base de datos tiene datos:
  - 15 solicitudes en tabla `solicitud`
  - 3 alertas en tabla `alerta`
- [ ] Las relaciones entre tablas están configuradas

### Frontend

- [ ] El servidor de desarrollo está corriendo (`npm run dev`)
- [ ] El navegador tiene acceso a `http://localhost:9000` (o el puerto configurado)

---

## 🧪 PRUEBAS PASO A PASO

### 1️⃣ Verificar Backend Directamente

Abre tu navegador y visita:

```
http://localhost:5260/api/alertas/dashboard
```

**✅ Resultado esperado:**
Deberías ver un JSON con tus 3 alertas, algo así:

```json
[
  {
    "idAlerta": 1,
    "nivel": "INCUMPLIMIENTO_SLA",
    "estado": "LEIDA",
    "mensaje": "Actualizado con envío",
    "fechaRegistro": "2025-11-14T00:33:47.2281593",
    "diasRestantes": 30,
    "porcentajeProgreso": 68.57,
    "solicitud": { ... }
  },
  ...
]
```

**❌ Si ves un error:**

- **404 Not Found**: El controlador no está en el backend o la ruta es incorrecta
- **500 Internal Server Error**: Revisa los logs del backend, puede ser un error en las entidades
- **Connection Refused**: El backend no está corriendo

---

### 2️⃣ Verificar Consola del Frontend

1. Abre la aplicación frontend en el navegador
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**
4. Navega a **Gestión de Alertas** (`/sistema/alertas/gestion-alertas`)

**✅ Resultado esperado:**

```
✅ 3 alertas cargadas desde el backend
```

**⚠️ Si ves:**

```
⚠️ Usando datos de prueba (backend no disponible)
```

Significa que el frontend no puede conectarse al backend. Verifica:

- ¿El backend está corriendo?
- ¿El endpoint responde en el navegador?
- ¿Hay errores de CORS?

**❌ Si ves:**

```
❌ Error al obtener alertas desde /api/alertas/dashboard: ...
```

Revisa el mensaje de error detallado en la consola.

---

### 3️⃣ Verificar Pestaña Network

En DevTools, ve a la pestaña **Network**:

1. Filtra por `XHR` o `Fetch`
2. Busca la petición a `/api/alertas/dashboard`
3. Haz clic en la petición

**✅ Status 200 OK:**

- La conexión es exitosa
- Revisa la pestaña **Response** para ver los datos JSON

**❌ Status 404:**

```json
{
  "message": "Recurso no encontrado (404)"
}
```

El controlador no existe en el backend.

**❌ Status 500:**

```json
{
  "message": "Error interno del servidor (500)",
  "error": "..."
}
```

Hay un error en el backend. Revisa los logs del servidor.

**❌ Status 0 (CORS Error):**

```
Access to XMLHttpRequest at 'http://localhost:5260/api/alertas/dashboard'
from origin 'http://localhost:9000' has been blocked by CORS policy
```

**Solución:** Agrega CORS en tu backend (`Program.cs`):

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:9000", "http://localhost:8080")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Después de var app = builder.Build();
app.UseCors("AllowFrontend");
```

---

### 4️⃣ Verificar Datos en la Tabla

Si la conexión es exitosa, verifica que los datos se muestren correctamente en la tabla:

**✅ Deberías ver:**

- 3 filas en la tabla (tus 3 alertas de la BD)
- Columna "Solicitud" con valores como `Sol-1`, `Sol-2`
- Columna "Responsable" con los nombres de los roles
- Columna "SLA" con códigos como `SLA1`, `SLA2`
- Barras de progreso con colores (verde, naranja, rojo)
- Días restantes calculados correctamente

**❌ Si ves:**

- Tabla vacía: Los datos no llegaron o el array está vacío
- 50 filas: Está usando datos de prueba (backend no disponible)
- Errores en consola: Problema de mapeo de datos

---

## 🔍 DIAGNÓSTICO DE ERRORES COMUNES

### Error 1: "Cannot read property 'configSla' of undefined"

**Causa:** La estructura de datos del backend no coincide con lo esperado.

**Solución:**

1. Verifica que el backend incluya las relaciones:

   ```csharp
   .Include(a => a.Solicitud)
       .ThenInclude(s => s.ConfigSla)
   ```

2. Revisa la respuesta JSON en Network tab

### Error 2: "Invalid column name 'IdAlerta'"

**Causa:** Las entidades no tienen los atributos `[Column]` configurados.

**Solución:**

```csharp
[Column("id_alerta")]
public int IdAlerta { get; set; }
```

### Error 3: Datos de prueba en lugar de datos reales

**Causa:** El backend devuelve 404 o error de red.

**Verificación:**

```bash
# Prueba el endpoint directamente
curl http://localhost:5260/api/alertas/dashboard
```

Si devuelve error, el problema está en el backend.

### Error 4: CORS Policy Blocked

**Solución:** Configura CORS en `Program.cs` del backend (ver paso 3 arriba).

---

## 📊 COMPARACIÓN: Datos de Prueba vs Datos Reales

### Datos de Prueba (Fallback)

```
✓ 50 alertas
✓ IDs del 1 al 50
✓ Datos generados aleatoriamente
✓ Mensaje en consola: "⚠️ Usando datos de prueba"
```

### Datos Reales (Backend)

```
✓ 3 alertas (según tu BD)
✓ IDs: 1, 2, 3
✓ Datos desde SQL Server
✓ Mensaje en consola: "✅ 3 alertas cargadas desde el backend"
```

---

## ✅ CONFIRMACIÓN FINAL

Si todo funciona correctamente, deberías tener:

1. **Backend respondiendo:**

   ```bash
   curl http://localhost:5260/api/alertas/dashboard
   # Devuelve JSON con 3 alertas
   ```

2. **Frontend conectado:**

   ```
   Console: ✅ 3 alertas cargadas desde el backend
   ```

3. **Tabla mostrando datos reales:**
   - 3 filas visibles
   - Datos coinciden con tu base de datos SQL
   - Filtros funcionando
   - Exportación disponible

4. **Sin errores:**
   - Sin errores 404
   - Sin errores de CORS
   - Sin errores en consola

---

## 🎯 SIGUIENTE PASO

Una vez verificado que todo funciona:

1. **Deshabilita el modo de datos de prueba** (opcional):
   - Si quieres forzar que siempre use el backend real
   - Modifica `useAlertaStore.js` para lanzar error en lugar de usar fallback

2. **Prueba las funcionalidades:**
   - Filtrar por SLA
   - Filtrar por Rol
   - Buscar por texto
   - Exportar a CSV
   - Marcar como leída
   - Eliminar alerta

3. **Implementa el módulo de Email:**
   - Configuración de emails
   - Sala de comunicaciones
   - Historial de envíos

---

**¿Todo funcionando?** 🎉  
Estás listo para continuar con las demás funcionalidades del módulo.

**¿Aún tienes problemas?**  
Revisa los logs del backend y comparte el error específico para ayuda adicional.
