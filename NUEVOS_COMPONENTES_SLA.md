# 📊 Componentes SLA - Documentación

## ✅ Componentes Disponibles

Se han creado **3 componentes principales** para el sistema de gestión SLA:

### 1. **Dashboard.vue** (Dashboard Ejecutivo Unificado)
**Ruta:** `/dashboard`

#### Características:
- ✅ **4 KPIs principales:**
  - **SLA Global Mensual** con indicador de color (verde ≥90%, amarillo ≥70%, rojo <70%)
  - **Variación vs Mes Anterior** con flechas ↑ ↓
  - **Mejor Rol** (medalla de oro) con porcentaje
  - **Rol que Requiere Atención** (alerta naranja) con porcentaje
- ✅ Selector Mes/Año obligatorio
- ✅ Filtros avanzados por roles/áreas (multi-selección)
- ✅ Gráfico de barras comparativo de todos los roles
- ✅ **Auto-refresh cada 30 segundos**
- ✅ Chips interactivos para filtrar roles
- ✅ Efectos hover en tarjetas KPI
- ✅ Paleta de colores consistente

#### API Endpoints usados:
```
GET /api/Solicitud
GET /api/RolRegistro
GET /api/ConfigSla
```

#### Cálculos automáticos:
- SLA Global = (Solicitudes cumplidas / Total solicitudes) × 100
- Variación = SLA actual - SLA mes anterior
- Cumplimiento por rol con ordenamiento descendente
- Identificación automática de mejor y peor rol

---

### 2. **SLA_AnaliticaInteractiva.vue** (US-010)
**Ruta:** `/sla-analitica`

#### Características:
- ✅ Filtros dinámicos:
  - Mes/Año
  - Tipo SLA (dropdown con opciones de ConfigSla)
  - Roles/Áreas (multi-selección)
  - Tipo de gráfico: **Barras, Líneas, Área, Donut, Radar**
- ✅ Gráfico interactivo con **Chart.js**:
  - Tooltips al pasar el cursor
  - Animaciones suaves
  - Colores dinámicos por porcentaje
  - Responsive
- ✅ Estadísticas rápidas:
  - Total Solicitudes
  - Promedio SLA
  - Roles Analizados
- ✅ Botones de **Aplicar Filtros** y **Restablecer**
- ✅ Mensaje "No existen registros" cuando no hay datos

#### API Endpoints usados:
```
GET /api/Solicitud
GET /api/RolRegistro
GET /api/ConfigSla
```

#### Tipos de gráfico disponibles:
1. **Barras** (por defecto)
2. **Líneas**
3. **Área** (líneas con relleno)
4. **Donut** (circular)
5. **Radar** (radial)

---

### 3. **SLA_FiltrosReporte.vue** (US-011)
**Ruta:** `/sla-filtros`

#### Características:
- ✅ Filtros avanzados:
  - Selector Mes/Año con validación obligatoria
  - Dropdown Tipo SLA (opcional)
  - Dropdown Roles (multi-selección, opcional)
- ✅ Chips visuales de filtros activos
- ✅ Tabla de resultados con:
  - Total Solicitudes
  - Cumplidos
  - Barra de progreso visual
  - Badge de estado (Excelente/Aceptable/Bajo)
- ✅ Botón **"Restablecer filtros"**
- ✅ Botón **"Exportar Reporte"** (descarga CSV)
- ✅ Mensaje: **"No existen registros para los filtros seleccionados"**
- ✅ Emite evento `onFiltroChange` al componente padre

#### API Endpoints usados:
```
GET /api/Solicitud
GET /api/RolRegistro
GET /api/ConfigSla
```

#### Funcionalidades especiales:
- **Exportación a CSV** con nombre dinámico: `Reporte_SLA_Mes_Año.csv`
- **Scroll automático** al mensaje "sin datos"
- **Estadísticas resumidas** arriba de la tabla

---

## 🎨 Estilo y Paleta de Colores

Todos los componentes mantienen la **misma paleta** del Dashboard principal:

### Colores de Estado SLA:
```css
Verde (Excelente): #4CAF50  /* >= 90% */
Amarillo (Aceptable): #FF9800  /* >= 70% */
Rojo (Bajo): #F44336  /* < 70% */
```

### Colores Quasar:
- **Primary:** Azul (#1976D2)
- **Positive:** Verde (#4CAF50)
- **Negative:** Rojo (#F44336)
- **Warning:** Naranja (#FF9800)
- **Accent:** Púrpura

### Fondos:
- Página: `#f5f7fa` (gris claro)
- Cards: `white`
- Hover en cards: sombra elevada

---

## 🗺️ Navegación

Los componentes están organizados en el **menú lateral** de la siguiente forma:

```
📊 Dashboard Ejecutivo    ← Dashboard principal unificado (US-009)
📈 Análisis Interactivo   ← Gráficos con Chart.js (US-010)
🔍 Filtros y Reportes     ← Filtros avanzados y exportación (US-011)
💾 Datos SLA              ← Gestión de datos
📋 Reportes               ← Reportes programados
```

### Rutas configuradas:
```javascript
/dashboard       → Dashboard.vue (Dashboard Ejecutivo Unificado)
/sla-analitica   → SLA_AnaliticaInteractiva.vue
/sla-filtros     → SLA_FiltrosReporte.vue
```

**Nota:** Se unificaron los dashboards "Dashboard.vue" y "SLA_DashboardEjecutivo.vue" en un solo componente mejorado que combina las mejores características de ambos.

---

## 📦 Dependencias Instaladas

Para los gráficos interactivos:

```bash
npm install chart.js vue-chartjs
```

**Chart.js v4** está configurado y registrado en `SLA_AnaliticaInteractiva.vue`.

---

## 🔧 Configuración en quasar.config.js

Plugins de Quasar habilitados:

```javascript
plugins: ['Notify', 'Loading']
```

Estos plugins permiten:
- **Notify:** Notificaciones toast (éxito, error, advertencia)
- **Loading:** Spinners de carga globales

---

## 🚀 Uso de los Componentes

### Ejemplo 1: Dashboard Ejecutivo Unificado
```vue
<template>
  <Dashboard />
</template>
```

**Funcionalidades integradas:**
- Carga automática de KPIs al montar
- Auto-refresh cada 30 segundos
- Filtros interactivos por mes/año/roles
- 4 tarjetas KPI con indicadores visuales
- Gráfico comparativo de cumplimiento por rol
- Identifica mejor y peor rol automáticamente

**Ventajas de la unificación:**
- ✅ Una sola fuente de verdad para métricas ejecutivas
- ✅ Combina KPIs ejecutivos con análisis detallado
- ✅ Menor mantenimiento de código
- ✅ Experiencia de usuario más coherente

### Ejemplo 2: Analítica Interactiva
```vue
<template>
  <SLA_AnaliticaInteractiva />
</template>
```

Funcionalidades:
- Cambia tipo de gráfico dinámicamente
- Filtra por múltiples criterios
- Actualiza gráfico en tiempo real

### Ejemplo 3: Filtros de Reporte
```vue
<template>
  <SLA_FiltrosReporte @onFiltroChange="handleFiltros" />
</template>

<script setup>
const handleFiltros = (data) => {
  console.log('Filtros aplicados:', data.filtros)
  console.log('Datos:', data.datos)
  console.log('Estadísticas:', data.estadisticas)
}
</script>
```

---

## 📊 Estructura de Datos

### Datos de entrada esperados:

#### Solicitud:
```json
{
  "idSolicitud": 1,
  "idRolRegistro": 3,
  "idSla": 1,
  "fechaSolicitud": "2025-11-01",
  "fechaIngreso": "2025-11-05"
}
```

#### RolRegistro:
```json
{
  "idRolRegistro": 1,
  "nombreRol": "Desarrollador Sr.",
  "esActivo": true
}
```

#### ConfigSla:
```json
{
  "idSla": 1,
  "tipoSolicitud": "NUEVO",
  "diasUmbral": 7,
  "esActivo": true
}
```

### Datos de salida (KPIs):

```javascript
{
  slaGlobal: 87.5,
  variacion: 2.3,
  mejorRol: { nombre: "Desarrollador Sr.", porcentaje: 92.5 },
  peorRol: { nombre: "QA Jr.", porcentaje: 75.2 },
  cumplimientoRoles: [
    { nombre: "Dev Sr.", cumplimiento: 92.5 },
    { nombre: "QA", cumplimiento: 88.3 }
  ]
}
```

---

## ✅ Testing

### Para probar los componentes:

1. **Inicia el servidor:**
```bash
cd D:\REPOS\Fronen.Proyecto_wed_01\TATA.FRONTEND.PROYECTO1
npm run dev
```

2. **Navega a:**
   - http://localhost:9000/dashboard (Dashboard Ejecutivo Unificado)
   - http://localhost:9000/sla-analitica (Análisis Interactivo)
   - http://localhost:9000/sla-filtros (Filtros y Reportes)

3. **Verifica que la API esté corriendo:**
   - http://localhost:5260/api/Solicitud
   - http://localhost:5260/api/RolRegistro
   - http://localhost:5260/api/ConfigSla

---

## 🐛 Troubleshooting

### Error: "Notify is not a function"
**Solución:** Verifica que en `quasar.config.js` esté:
```javascript
plugins: ['Notify', 'Loading']
```

### Error: "Chart is not defined"
**Solución:** Reinstala Chart.js:
```bash
npm install chart.js
```

### Los gráficos no se muestran
**Solución:** 
1. Verifica que haya datos en la respuesta de la API
2. Abre la consola (F12) y revisa errores
3. Confirma que los filtros coincidan con datos reales

### "No existen registros"
**Causas posibles:**
- No hay solicitudes en el mes/año seleccionado
- El filtro de roles no coincide con datos reales
- El tipo de SLA no tiene registros

---

## 📝 Notas Importantes

1. **Dashboard unificado** combina las mejores características de los componentes originales:
   - KPIs ejecutivos (US-009)
   - Filtros avanzados por roles
   - Auto-refresh automático
   - Efectos visuales mejorados

2. **Todos los componentes usan los mismos endpoints** que el Dashboard principal
3. **No se crearon nuevos endpoints en el backend** - reutiliza los existentes
4. **Los cálculos SLA se hacen en el frontend** para mantener consistencia
5. **Chart.js** está configurado para ser responsive
6. **Los filtros se sincronizan** entre componentes mediante eventos

---

## 🔄 Cambios Recientes

### ✅ Unificación de Dashboards (20/11/2025)
- **Eliminado:** `SLA_DashboardEjecutivo.vue` (duplicado)
- **Actualizado:** `Dashboard.vue` ahora incluye:
  - 4 KPIs ejecutivos con iconos y colores
  - Tarjeta para "Mejor Rol"
  - Tarjeta para "Rol que Requiere Atención"
  - Efectos hover mejorados
  - Bordes de color según estado (success/warning/danger)
  - Auto-refresh cada 30s
  - Chip visual indicando auto-refresh activo

- **Menú actualizado:** Ya no existe sección "Módulos SLA", ahora son items directos:
  - Dashboard Ejecutivo
  - Análisis Interactivo
  - Filtros y Reportes

---

## 🎯 Próximos Pasos

Si necesitas agregar funcionalidades:

1. **Más tipos de gráficos:** Edita `tiposGraficoDisponibles` en `SLA_AnaliticaInteractiva.vue`
2. **Nuevos filtros:** Agrega campos en el objeto `filtros` de cada componente
3. **Exportar a PDF:** Instala `jspdf` y agrega botón de exportación
4. **Comparativas entre períodos:** Agrega selector de "rango de meses"

---

¡Los componentes están listos para usar! 🚀
