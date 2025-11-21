# Módulo de Gestión de Registros SLA

Este módulo contiene todos los componentes relacionados con la vista de Gestión de Registros SLA.

## Estructura de Componentes

### Componentes Creados

1. **SlaToolbar.vue**
   - Muestra el título, subtítulo y botón "Nuevo Registro"
   - **Eventos:** `nuevo-registro`

2. **SlaSearchInput.vue**
   - Input de búsqueda con icono de lupa
   - Soporta v-model mediante `modelValue` y `update:modelValue`
   - **Props:** `modelValue` (String)
   - **Eventos:** `update:modelValue`

3. **SlaFilterBar.vue**
   - Barra de filtros que contiene el input de búsqueda y botón de exportar
   - **Eventos:** `buscar`, `exportar`

4. **SlaSeverityBadge.vue**
   - Badge con color según severidad (Alta, Media, Baja)
   - **Props:** `severity` (String: 'Alta' | 'Media' | 'Baja')

5. **SlaStatusBadge.vue**
   - Badge con color según estado (Cumplido, Incumplido, Preventivo)
   - **Props:** `status` (String: 'Cumplido' | 'Incumplido' | 'Preventivo')

6. **SlaActionButtons.vue**
   - Botones de editar y eliminar
   - **Eventos:** `editar`, `eliminar`

7. **SlaTableRow.vue**
   - Fila de la tabla con todos los datos del registro
   - **Props:** `registro` (Object con cliente, rol, fechaSolicitud, fechaIngreso, tipo, slaDias, severidad, estado)
   - **Eventos:** `editar`, `eliminar`

8. **SlaTable.vue**
   - Tabla completa con cabeceras y filas
   - **Props:** `registros` (Array de objetos)
   - **Eventos:** `editar`, `eliminar`

## Vista Principal

**GestionSLAView.vue** (`src/views/SLA/GestionSLAView.vue`)
- Orquesta todos los componentes
- Maneja el estado de búsqueda y filtrado
- Contiene datos mock de ejemplo
- Conecta todos los eventos (por ahora solo console.log)

## Ruta

La ruta está configurada en `src/router/routes.js`:
- **Path:** `/GestionSLAView`
- **Name:** `GestionSLAView`

## Funcionalidad Actual

✅ Interfaz de usuario completa
✅ Búsqueda por cliente o rol (case-insensitive)
✅ Datos mock de ejemplo
✅ Eventos conectados (console.log)

⏳ Pendiente (no implementado aún):
- Integración con API real
- Modales de crear/editar registros
- Confirmación de eliminación
- Exportación de datos
- Paginación

## Uso

Para navegar a la vista:
```javascript
// En el navegador
http://localhost:9000/#/GestionSLAView

// Programáticamente
router.push({ name: 'GestionSLAView' })
```

## Estilos

Todos los componentes usan CSS scoped sin dependencias externas.
Los colores y estilos están alineados con un diseño limpio y moderno.
