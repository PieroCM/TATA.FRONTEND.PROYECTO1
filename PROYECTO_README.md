# 🎯 Dashboard Administrativo - Sistema SLA TCS

## 📁 Estructura del Proyecto

```
/src
 ├─ assets/              # Recursos estáticos
 ├─ components/          # Componentes reutilizables
 │   ├─ ChartCard.vue   # Tarjetas de estadísticas
 │   ├─ DataTable.vue   # Tabla de datos con filtros
 │   ├─ SidebarMenu.vue # Menú lateral de navegación
 │   └─ EssentialLink.vue
 ├─ pages/               # Páginas principales
 │   ├─ Dashboard.vue    # Dashboard ejecutivo
 │   ├─ Productos.vue    # Gestión de productos
 │   ├─ Usuarios.vue     # Gestión de usuarios
 │   ├─ Reportes.vue     # Reportes y estadísticas
 │   ├─ IndexPage.vue
 │   └─ ErrorNotFound.vue
 ├─ layouts/
 │   └─ MainLayout.vue   # Layout principal con header y sidebar
 ├─ router/
 │   ├─ index.js
 │   └─ routes.js        # Definición de rutas
 ├─ boot/
 │   └─ axios.js         # Configuración de API
 └─ stores/              # Pinia stores
```

## 🚀 Características Implementadas

### ✅ Componentes Reutilizables

1. **ChartCard.vue** - Tarjetas de estadísticas con iconos
   - Props: title, icon, value, color
   - Efecto hover con elevación
   - Soporte para colores de Quasar

2. **DataTable.vue** - Tabla de datos completa
   - Búsqueda integrada
   - Paginación automática
   - Columnas ordenables
   - Badges para estados
   - Botones de acción (ver, editar, eliminar)
   - Emisión de eventos personalizados

3. **SidebarMenu.vue** - Menú de navegación
   - Links activos con resaltado
   - Iconos de Material Design
   - Agrupación por categorías
   - Navegación con Vue Router

### 📄 Páginas Implementadas

#### Dashboard.vue
- 6 tarjetas de estadísticas
- Tabla de productos recientes
- Integración con API
- Acciones CRUD completas
- Área preparada para gráficos (Chart.js)

#### Productos.vue
- Listado completo de productos
- Filtros por categoría y estado
- Formulario de creación/edición
- Validación de campos
- Diálogos de confirmación

#### Usuarios.vue
- Gestión completa de usuarios
- Tarjetas de resumen
- Formulario con validación de email
- Diferentes roles de usuario
- Estados activo/inactivo

#### Reportes.vue
- Filtros por fecha y tipo
- Resumen ejecutivo
- Top 5 productos más vendidos
- Exportación a CSV
- Área preparada para gráficos

### 🔧 Configuración de API

**boot/axios.js** configurado con:
- Base URL: `https://localhost:7010/api`
- Interceptores de request (JWT)
- Interceptores de response (manejo de errores)
- Notificaciones automáticas de Quasar
- Timeout de 10 segundos

### 🎨 Layout Principal

**MainLayout.vue** incluye:
- Header con toolbar personalizado
- Sistema de notificaciones
- Menú de usuario
- Sidebar responsive
- Avatar de usuario
- Navegación integrada

## 🛠️ Endpoints de API Esperados

```javascript
// Productos
GET    /api/productos           # Listar todos
POST   /api/productos           # Crear nuevo
PUT    /api/productos/{id}      # Actualizar
DELETE /api/productos/{id}      # Eliminar

// Usuarios
GET    /api/usuarios            # Listar todos
POST   /api/usuarios            # Crear nuevo
PUT    /api/usuarios/{id}       # Actualizar
DELETE /api/usuarios/{id}       # Eliminar

// Estadísticas
GET    /api/estadisticas/dashboard      # Datos del dashboard
GET    /api/estadisticas/tendencias     # Datos para gráficos

// Reportes
GET    /api/reportes/transacciones      # Listado de transacciones
```

## 📊 Formato de Datos Esperado

### Producto
```json
{
  "id": 1,
  "nombre": "Laptop HP",
  "descripcion": "Laptop de alto rendimiento",
  "categoria": "Electrónica",
  "precio": 15000,
  "stock": 50,
  "estado": "Activo"
}
```

### Usuario
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "telefono": "(555) 123-4567",
  "rol": "Administrador",
  "estado": "Activo",
  "fechaRegistro": "2025-01-15"
}
```

## 🎨 Mejoras Opcionales

### Para agregar gráficos con Chart.js:

```bash
npm install chart.js
```

Luego en Dashboard.vue o Reportes.vue, descomentar y usar:
```javascript
import Chart from 'chart.js/auto'
```

### Colores personalizados en quasar.variables.scss:
```scss
$primary   : #1976D2
$secondary : #26A69A
$positive  : #21BA45
$negative  : #C10015
$info      : #31CCEC
$warning   : #F2C037
```

## 🔐 Autenticación (Para implementar)

El sistema está preparado para JWT:
- El interceptor agrega el token automáticamente
- Redirección a /login en 401
- Almacenamiento en localStorage

## 📱 Responsive

Todos los componentes usan el sistema de grid de Quasar:
- `col-12 col-md-4` para tarjetas
- Tablas responsive automáticamente
- Sidebar oculto en móviles

## 🚦 Cómo Usar

1. Asegúrate de que el servidor de desarrollo esté corriendo:
   ```bash
   npm run dev
   ```

2. La aplicación abre en: http://localhost:9000

3. Navega entre las secciones usando el menú lateral:
   - Dashboard → Vista ejecutiva
   - Productos → CRUD completo
   - Usuarios → Gestión de usuarios
   - Reportes → Estadísticas

4. Configura la URL de tu API en `src/boot/axios.js`

## 📝 Notas Importantes

- Todos los componentes usan **Composition API** (script setup)
- Las tablas tienen búsqueda y ordenamiento integrados
- Los formularios tienen validación en tiempo real
- Los errores de API se muestran automáticamente
- El código está comentado y documentado

## 🎯 Próximos Pasos

1. Conectar con tu API real de .NET
2. Implementar autenticación
3. Agregar más páginas según necesites
4. Instalar Chart.js para gráficos
5. Personalizar colores y estilos
6. Agregar más validaciones
