/**
 * Guard de Autenticación
 *
 * Responsabilidades:
 * - Validar si el usuario está autenticado (tiene token)
 * - Permitir acceso a rutas públicas
 * - Bloquear rutas privadas sin autenticación
 * - Redirigir usuarios autenticados desde login a su primera ruta accesible
 *
 * NOTA: La restauración de sesión desde localStorage ya se hizo en boot/auth.js
 *       Este guard solo valida el estado actual del authStore
 */

import { isPublicRoute } from '../utils/navigationUtils'
import { findFirstAccessibleRoute } from '../utils/permissionUtils'

/**
 * Ejecuta la lógica de autenticación antes de cada navegación
 * @param {RouteLocationNormalized} to - Ruta de destino
 * @param {RouteLocationNormalized} from - Ruta de origen
 * @param {Function} next - Callback de navegación
 * @param {Object} authStore - Store de autenticación de Pinia
 * @returns {void}
 */
export async function authGuard(to, from, next, authStore) {
  const isAuthenticated = authStore.isAuthenticated
  const isPublic = isPublicRoute(to)

  // ✅ Rutas públicas: login, forgot-password, activacion-cuenta
  if (isPublic) {
    // Si ya está autenticado y va a login o raíz, redirigir a su primera ruta accesible
    if (isAuthenticated && (to.path === '/' || to.path === '/login')) {
      const firstRoute = findFirstAccessibleRoute(authStore.permisos)

      if (firstRoute) {
        console.log('✅ Usuario autenticado redirigido desde login a:', firstRoute)
        next(firstRoute)
        return
      }

      // Si no tiene ninguna ruta accesible, enviarlo a no-autorizado
      console.warn('⚠️ Usuario sin rutas accesibles')
      next('/no-autorizado')
      return
    }

    // Permitir acceso libre a rutas públicas
    next()
    return
  }

  // 🔒 Rutas privadas: requieren autenticación
  if (!isAuthenticated) {
    console.warn('🔒 Acceso denegado: No hay sesión activa. Redirigiendo a /login')
    console.warn('📍 Ruta bloqueada:', to.fullPath)
    next('/login')
    return
  }

  // Usuario autenticado, continuar al siguiente guard (permisos)
  next()
}
