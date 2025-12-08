/**
 * Utilidades de Navegación
 *
 * Funciones reutilizables para determinar características de las rutas
 * y ayudar en la lógica de navegación.
 */

/**
 * Determina si una ruta es pública (accesible sin autenticación)
 * @param {RouteLocationNormalized} route - Objeto de ruta de Vue Router
 * @returns {boolean} true si la ruta tiene meta.public === true
 */
export function isPublicRoute(route) {
  return route.meta?.public === true
}

/**
 * Determina si una ruta requiere autenticación
 * @param {RouteLocationNormalized} route - Objeto de ruta de Vue Router
 * @returns {boolean} true si la ruta NO es pública
 */
export function requiresAuth(route) {
  return !isPublicRoute(route)
}

/**
 * Determina si una ruta requiere permisos específicos
 * @param {RouteLocationNormalized} route - Objeto de ruta de Vue Router
 * @returns {boolean} true si la ruta tiene meta.permisos definidos
 */
export function requiresPermissions(route) {
  const perms = route.meta?.permisos
  return perms && Array.isArray(perms) && perms.length > 0
}

/**
 * Verifica si un usuario tiene al menos uno de los permisos requeridos
 * @param {string[]} userPermissions - Array de permisos del usuario
 * @param {string[]} requiredPermissions - Array de permisos requeridos
 * @returns {boolean} true si el usuario tiene al menos un permiso requerido
 */
export function hasAnyPermission(userPermissions = [], requiredPermissions = []) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true // Sin restricciones, acceso permitido
  }

  return requiredPermissions.some((perm) => userPermissions.includes(perm))
}
