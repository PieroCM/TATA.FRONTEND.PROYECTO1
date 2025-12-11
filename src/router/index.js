import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { authGuard } from './guards/authGuard'
import { permissionGuard } from './guards/permissionGuard'

/*
 * Router con Arquitectura Limpia
 *
 * Separación de responsabilidades:
 * - authGuard: Maneja autenticación (token, rutas públicas/privadas)
 * - permissionGuard: Maneja autorización (permisos específicos de rutas)
 * - navigationUtils: Funciones reutilizables para inspeccionar rutas
 * - permissionUtils: Lógica para determinar rutas accesibles por permisos
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  /**
   * Guard Global de Navegación
   *
   * Flujo:
   * 1. authGuard valida autenticación (token, rutas públicas)
   * 2. Si pasa authGuard, permissionGuard valida permisos
   *
   * Evita duplicación de lógica delegando a guards especializados
   */
  Router.beforeEach(async (to, from, next) => {
    // Importar authStore dinámicamente
    const { useAuthStore } = await import('src/stores/useAuthStore')
    const authStore = useAuthStore()

    // Ejecutar authGuard primero
    await authGuard(
      to,
      from,
      (route) => {
        if (route && route !== true) {
          // authGuard decidió hacer una redirección
          next(route)
        } else {
          // authGuard permitió continuar, ejecutar permissionGuard
          permissionGuard(to, from, next, authStore)
        }
      },
      authStore,
    )
  })

  return Router
})
