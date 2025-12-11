/**
 * Guard de Autorización (Permisos)
 *
 * Responsabilidades:
 * - Validar si el usuario tiene permisos para acceder a la ruta
 * - Redirigir a la primera ruta accesible si no tiene permisos
 * - Permitir acceso a rutas sin restricción de permisos (solo requieren autenticación)
 */

import { findFirstAccessibleRoute } from '../utils/permissionUtils'

/**
 * Ejecuta la lógica de autorización basada en permisos
 * @param {RouteLocationNormalized} to - Ruta de destino
 * @param {RouteLocationNormalized} from - Ruta de origen
 * @param {Function} next - Callback de navegación
 * @param {Object} authStore - Store de autenticación de Pinia
 * @returns {void}
 */
export function permissionGuard(to, from, next, authStore) {
  const requiredPerms = to.meta?.permisos

  // Si la ruta NO requiere permisos específicos, permitir acceso
  // (cualquier usuario autenticado puede acceder)
  if (!requiredPerms || !Array.isArray(requiredPerms) || requiredPerms.length === 0) {
    next()
    return
  }

  const userPerms = authStore.permisos || []

  // Verificar si el usuario tiene al menos uno de los permisos requeridos
  const hasPermission = requiredPerms.some((perm) => userPerms.includes(perm))

  if (hasPermission) {
    // ✅ Usuario tiene permisos, permitir acceso
    next()
    return
  }

  // ⛔ Usuario NO tiene permisos
  // console.warn('⛔ Acceso denegado: Sin permisos suficientes')
  // console.warn('Permisos requeridos:', requiredPerms)
  // console.warn('Permisos del usuario:', userPerms)

  // Buscar la primera ruta accesible para el usuario
  const firstAccessibleRoute = findFirstAccessibleRoute(userPerms, to.fullPath)

  if (firstAccessibleRoute) {
    // console.log('↪️ Redirigiendo a la primera ruta accesible:', firstAccessibleRoute)
    next(firstAccessibleRoute)
    return
  }

  // Si no tiene ninguna ruta accesible, enviarlo a página de no autorizado
  // console.warn('⚠️ Usuario sin rutas accesibles, redirigiendo a /no-autorizado')
  next('/no-autorizado')
}
