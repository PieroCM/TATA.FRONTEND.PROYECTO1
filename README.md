# 📊 Sistema SLA TCS

Sistema de gestión y monitoreo de SLA (Service Level Agreement) desarrollado con **Quasar Framework v2** + **Vue 3** + **.NET API**.

---

## 🚀 Inicio Rápido

### Instalación de dependencias

```bash
npm install
```

### Iniciar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:9000/**

### Build para producción

```bash
npm run build
```

---

## 📋 Componentes del Sistema

### 1. **Dashboard Ejecutivo** (`/dashboard`)
Dashboard principal con KPIs ejecutivos y métricas en tiempo real.

**Características:**
- ✅ **4 KPIs principales:**
  - SLA Global Mensual con indicador de color
  - Variación vs Mes Anterior
  - Mejor Rol (máximo cumplimiento)
  - Rol que Requiere Atención (mínimo cumplimiento)
- ✅ **Gráficos separados por tipo de SLA** (NUEVO, REEMPLAZO, etc.)
- ✅ Filtros por Mes/Año y Roles
- ✅ Auto-refresh cada 30 segundos
- ✅ Chips interactivos para filtrar roles
- ✅ Diseño responsive (móvil, tablet, desktop)

**Colores de estado:**
- 🟢 Verde: SLA ≥ 90% (Excelente)
- 🟡 Amarillo: SLA ≥ 70% (Aceptable)
- 🔴 Rojo: SLA < 70% (Bajo)

---

### 2. **Análisis Interactivo** (`/sla-analitica`)
Visualización de datos con gráficos interactivos usando Chart.js.

**Características:**
- ✅ **5 tipos de gráficos:** Barras, Líneas, Área, Donut, Radar
- ✅ Filtros dinámicos:
  - Mes/Año
  - Tipo SLA
  - Roles/Áreas (multi-selección)
  - Tipo de gráfico
- ✅ Estadísticas rápidas (Total, Promedio SLA, Roles analizados)
- ✅ Tooltips interactivos
- ✅ Animaciones suaves
- ✅ Responsive

---

### 3. **Filtros y Reportes** (`/sla-filtros`)
Generación de reportes personalizados con exportación a CSV.

**Características:**
- ✅ Filtros avanzados obligatorios y opcionales
- ✅ Tabla de resultados con:
  - Barras de progreso visuales
  - Badges de estado
  - Paginación
- ✅ Exportación a CSV con nombre dinámico
- ✅ Chips visuales de filtros activos
- ✅ Mensaje personalizado cuando no hay datos

---

## 🎨 Diseño y Estilo

### Paleta de Colores

```css
/* Colores de Estado SLA */
Verde (Excelente): #4CAF50  /* >= 90% */
Amarillo (Aceptable): #FF9800  /* >= 70% */
Rojo (Bajo): #F44336  /* < 70% */

/* Colores Quasar */
Primary: #1976D2 (Azul)
Positive: #4CAF50 (Verde)
Warning: #FF9800 (Naranja)
Negative: #F44336 (Rojo)

/* Fondos */
Página: #f5f7fa
Cards: white
```

### Responsive Design

Todos los componentes son completamente responsive:

- 📱 **Móvil (< 768px):** Elementos apilados verticalmente
- 📱 **Tablet (768-1023px):** Grid de 2-3 columnas
- 💻 **Desktop (≥ 1024px):** Grid de 4 columnas optimizado

---

## 🔌 Integración con API .NET

### Configuración

**Archivo:** `.env`
```env
VITE_API_BASE_URL=http://localhost:5260/api
```

### Endpoints Utilizados

```
GET /api/Solicitud       - Obtener solicitudes
GET /api/RolRegistro     - Obtener roles técnicos
GET /api/ConfigSla       - Obtener configuraciones SLA
```

### Estructura de Datos

**Solicitud:**
```json
{
  "idSolicitud": 1,
  "idRolRegistro": 3,
  "idSla": 1,
  "fechaSolicitud": "2025-11-01",
  "fechaIngreso": "2025-11-05"
}
```

**RolRegistro:**
```json
{
  "idRolRegistro": 1,
  "nombreRol": "Desarrollador Sr.",
  "esActivo": true
}
```

**ConfigSla:**
```json
{
  "idSla": 1,
  "tipoSolicitud": "NUEVO",
  "diasUmbral": 35,
  "esActivo": true
}
```

### Configuración CORS en .NET

**Program.cs:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowQuasarApp", policy =>
    {
        policy.WithOrigins("http://localhost:9000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowQuasarApp");
```

---

## 📦 Dependencias Principales

```json
{
  "quasar": "^2.16.0",
  "vue": "^3.5.22",
  "vue-router": "^4.0.0",
  "axios": "^1.2.1",
  "chart.js": "^4.5.1",
  "vue-chartjs": "^5.3.3",
  "pinia": "^3.0.1"
}
```

---

## 🛠️ Configuración Quasar

**Plugins habilitados:**
```javascript
plugins: ['Notify', 'Loading']
```

**Framework:**
- Build tool: **Vite**
- Mode: **SPA** (Single Page Application)
- CSS Preprocessor: **SCSS**

---

## 📊 Cálculos SLA

El sistema calcula automáticamente:

```javascript
// SLA Global
slaGlobal = (solicitudesCumplidas / totalSolicitudes) × 100

// Cumplimiento individual
cumpleSla = diasTranscurridos ≤ diasUmbral

// Días transcurridos
diasTranscurridos = fechaIngreso - fechaSolicitud

// Variación
variacion = slaActual - slaMesAnterior
```

---

## 🗂️ Estructura del Proyecto

```
src/
├── pages/
│   ├── Dashboard.vue                   # Dashboard Ejecutivo Unificado
│   ├── SLA_AnaliticaInteractiva.vue    # Gráficos con Chart.js
│   └── SLA_FiltrosReporte.vue          # Filtros y exportación CSV
├── components/
│   └── SidebarMenu.vue                 # Menú lateral de navegación
├── router/
│   ├── index.js
│   └── routes.js                       # Rutas de la aplicación
├── boot/
│   └── axios.js                        # Configuración Axios
└── css/
    ├── app.scss
    └── quasar.variables.scss
```

---

## 🔄 Changelog - Cambios Recientes

### ✅ 21/11/2025 - Gráficos Separados por Tipo SLA
- **Agregado:** Gráficos independientes para cada tipo de SLA (NUEVO, REEMPLAZO)
- **Mejora:** Cada gráfico muestra su umbral específico y SLA promedio
- **Visualización:** Chip de color indicando estado del tipo de SLA
- **Layout:** Responsive (1 o 2 gráficos por fila según dispositivo)

### ✅ 20/11/2025 - Unificación de Dashboards
- **Eliminado:** `SLA_DashboardEjecutivo.vue` (duplicado)
- **Actualizado:** `Dashboard.vue` ahora incluye:
  - 4 KPIs ejecutivos con iconos dinámicos
  - Bordes de color según estado
  - Efectos hover mejorados
  - Auto-refresh cada 30s
- **Menú simplificado:** Items directos sin subsecciones

---

## ✅ Testing

### Probar la aplicación:

1. **Iniciar servidor de desarrollo:**
```bash
cd D:\REPOS\Fronen.Proyecto_wed_01\TATA.FRONTEND.PROYECTO1
npm run dev
```

2. **Navegar a:**
   - http://localhost:9000/dashboard
   - http://localhost:9000/sla-analitica
   - http://localhost:9000/sla-filtros

3. **Verificar API:**
   - http://localhost:5260/api/Solicitud
   - http://localhost:5260/api/RolRegistro
   - http://localhost:5260/api/ConfigSla

---

## 🐛 Troubleshooting

### Error: "Notify is not a function"
```javascript
// Verificar en quasar.config.js
plugins: ['Notify', 'Loading']
```

### Error: "Chart is not defined"
```bash
npm install chart.js vue-chartjs
```

### Los gráficos no se muestran
- Verificar que haya datos en la API
- Abrir consola (F12) y revisar errores
- Confirmar que filtros coincidan con datos reales

### "No existen registros"
**Causas:**
- No hay solicitudes en el mes/año seleccionado
- Filtro de roles no coincide
- Tipo de SLA sin registros

---

## 📝 Notas Importantes

1. **Auto-refresh:** El dashboard se actualiza cada 30 segundos automáticamente
2. **Cálculos en Frontend:** Los cálculos SLA se realizan en el cliente para mantener consistencia
3. **Chart.js responsive:** Los gráficos se adaptan automáticamente al tamaño de pantalla
4. **Filtros sincronizados:** Los cambios en filtros actualizan todos los componentes
5. **Gráficos por tipo SLA:** Cada tipo (NUEVO, REEMPLAZO) tiene su propio gráfico con umbral específico

---

## 🎯 Roadmap / Mejoras Futuras

- [ ] Exportar gráficos a PDF
- [ ] Comparativas entre períodos
- [ ] Notificaciones push cuando SLA cae por debajo de umbral
- [ ] Modo oscuro
- [ ] Configuración de umbrales personalizados por usuario
- [ ] Dashboard de administración de usuarios

---

## 👨‍💻 Desarrollado por

**Proyecto:** Sistema SLA TCS  
**Framework:** Quasar v2.18.5 + Vue 3  
**Backend:** .NET 6/7 Web API  
**Database:** SQL Server

---

## 📄 Licencia

Este proyecto es privado y pertenece a TCS.

---

**🎉 ¡Sistema listo para producción!**
