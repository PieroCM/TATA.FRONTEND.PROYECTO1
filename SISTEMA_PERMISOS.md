# Sistema de Permisos - Frontend

## Resumen

El sistema de autenticación y permisos ha sido implementado completamente. Ahora el frontend:

1. **Guarda token, usuario y permisos** obtenidos del backend al hacer login
2. **Protege rutas** según los permisos requeridos
3. **Muestra/oculta opciones del sidebar** según los permisos del usuario

---

## Flujo de Autenticación

### 1. Login (`LoginForm.vue`)

Cuando el usuario inicia sesión:

```javascript
// POST /api/usuario/signin
const response = await this.$api.post('/api/usuario/signin', {
  email: this.correo,
  password: this.password,
})

// Guardar en el authStore
authStore.setAuth(response.data)
```

El backend devuelve:

```json
{
  "token": "eyJhbGc...",
  "idUsuario": 1,
  "username": "superadmin@sla.local",
  "email": "22200150@ue.edu.pe",
  "nombres": "Super",
  "apellidos": "Admin",
  "idRolSistema": 1,
  "rolCodigo": "SUPER_ADMIN",
  "rolNombre": "Super Administrador",
  "permisos": [
    "DASHBOARD_EJECUTIVO",
    "ANALISIS_INTERACTIVO",
    "CARGA_DATOS",
    "GESTION_SOLICITUD",
    "REPORTE_CUMPLIMIENTO",
    "HISTORIAL_REPORTES",
    "GESTION_ALERTAS",
    "CONFIGURAR_EMAIL",
    "LOGS",
    "GESTION_USUARIOS"
  ]
}
```

### 2. Store de Autenticación (`useAuthStore.js`)

Estado guardado:

- `token`: JWT del usuario
- `usuario`: Objeto con datos personales (nombres, apellidos, email, rol, etc.)
- `permisos`: Array de códigos de permiso

Métodos importantes:

- `setAuth(authData)`: Guarda token, usuario y permisos
- `clearAuth()`: Limpia la sesión completamente
- `hydrateFromLocalStorage()`: Restaura la sesión desde localStorage
- `hasPermiso(codigo)`: Verifica si tiene un permiso específico
- `hasAnyPermiso(codigos)`: Verifica si tiene al menos uno de los permisos

Persistencia en localStorage:

- `authToken`: El JWT
- `authUser`: JSON del usuario
- `authPerms`: JSON del array de permisos

---

## Protección de Rutas

### Configuración en `routes.js`

Cada ruta protegida tiene `meta.permisos`:

```javascript
{
  path: 'dashboard',
  component: () => import('src/view/DashBoard/SLA_FiltrosReporte.vue'),
  meta: {
    title: 'Dashboard Ejecutivo SLA',
    permisos: ['DASHBOARD_EJECUTIVO']
  },
}
```

### Verificación en `router/index.js`

El `beforeEach` guard verifica:

1. **Sesión activa** (token existe)
2. **Permisos** (si la ruta los requiere)

```javascript
Router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Restaurar sesión si no está en memoria
  if (!authStore.token) {
    authStore.hydrateFromLocalStorage()
  }

  // Verificar permisos
  const requiredPerms = to.meta?.permisos
  if (requiredPerms && requiredPerms.length > 0) {
    const hasPermission = requiredPerms.some((perm) => authStore.permisos.includes(perm))

    if (!hasPermission) {
      // Redirigir a dashboard si no tiene permiso
      next('/sistema/dashboard')
      return
    }
  }

  next()
})
```

---

## Control del Sidebar

### Mostrar/Ocultar Grupos y Opciones

En `MainLayout.vue`, cada grupo y opción usa `v-if`:

```vue
<SidebarGroup
  v-if="hasPerm('DASHBOARD_EJECUTIVO') || hasPerm('ANALISIS_INTERACTIVO')"
  icon="dashboard"
  label="Dashboard"
>
  <SidebarItemChild
    v-if="hasPerm('DASHBOARD_EJECUTIVO')"
    label="Dashboard ejecutivo"
    to="/sistema/dashboard"
  />
  <SidebarItemChild
    v-if="hasPerm('ANALISIS_INTERACTIVO')"
    label="Análisis interactivo"
    to="/sistema/analitica-interactiva"
  />
</SidebarGroup>
```

Método helper:

```javascript
hasPerm(codigoPermiso) {
  return this.authStore.permisos?.includes(codigoPermiso) || false
}
```

---

## Mapa de Permisos

| Código Permiso         | Ruta                                | Descripción                 |
| ---------------------- | ----------------------------------- | --------------------------- |
| `DASHBOARD_EJECUTIVO`  | `/sistema/dashboard`                | Dashboard ejecutivo SLA     |
| `ANALISIS_INTERACTIVO` | `/sistema/analitica-interactiva`    | Análisis interactivo        |
| `CARGA_DATOS`          | `/sistema/carga-volumen`            | Cargar datos de solicitudes |
| `GESTION_SOLICITUD`    | `/sistema/gestion-sla`              | Gestionar solicitudes SLA   |
| `REPORTE_CUMPLIMIENTO` | `/sistema/reportes/sla-indicadores` | Reporte de cumplimiento     |
| `HISTORIAL_REPORTES`   | `/sistema/reportes/sla-historial`   | Historial de reportes       |
| `GESTION_ALERTAS`      | `/sistema/alertas`                  | Gestión de alertas          |
| `CONFIGURAR_EMAIL`     | `/sistema/alertas/config-email`     | Configurar email            |
| `LOGS`                 | `/sistema/log-view`                 | Ver logs del sistema        |
| `GESTION_USUARIOS`     | `/sistema/usuarios`                 | Gestión de usuarios         |

---

## Cerrar Sesión

Cuando el usuario cierra sesión:

```javascript
cerrarSesion() {
  // Limpia token, usuario, permisos del estado y localStorage
  this.authStore.clearAuth()

  // Redirige al login
  this.$router.push('/')
}
```

---

## Ejemplo de Uso en Componentes

### Verificar permisos en un componente:

```javascript
import { useAuthStore } from 'stores/useAuthStore'

export default {
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  methods: {
    puedeCrearUsuario() {
      return this.authStore.hasPermiso('GESTION_USUARIOS')
    },
  },
}
```

### En template:

```vue
<q-btn
  v-if="authStore.hasPermiso('GESTION_USUARIOS')"
  label="Nuevo Usuario"
  @click="crearUsuario"
/>
```

---

## Notas Importantes

1. **La ruta `/sistema/usuario` (Mi Perfil) NO requiere permisos** - Todos los usuarios pueden ver su perfil
2. **Si un usuario intenta acceder a una ruta sin permisos**, es redirigido a `/sistema/dashboard`
3. **Si el dashboard también está restringido**, asegúrate de que todos los roles tengan al menos un permiso básico
4. **Los permisos se restauran automáticamente** desde localStorage cuando se recarga la página

---

## Testing

Para probar el sistema:

1. **Login con diferentes roles**
2. **Verificar que el sidebar** solo muestre las opciones permitidas
3. **Intentar acceder directamente** a rutas protegidas (debe redirigir si no tiene permiso)
4. **Recargar la página** (debe mantener la sesión y permisos)
5. **Cerrar sesión** (debe limpiar todo y redirigir al login)
