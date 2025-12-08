/**
 * Utilidades de Permisos
 *
 * Lógica para determinar qué rutas son accesibles según los permisos del usuario.
 * Funciones reutilizables para el router y componentes (ej: menú lateral).
 */

import routes from '../routes'
import { hasAnyPermission } from './navigationUtils'

/**
 * Extrae todas las rutas navegables del árbol de rutas
 * Recorre recursivamente las rutas y sus hijos
 * @param {RouteRecordRaw[]} routeList - Array de definiciones de rutas
 * @param {string} parentPath - Path padre acumulado
 * @returns {Object[]} Array de objetos con {path, meta, name}
 */
function flattenRoutes(routeList, parentPath = '') {
  const result = []

  for (const route of routeList) {
    // Construir el path completo
    const fullPath = parentPath + (route.path.startsWith('/') ? route.path : `/${route.path}`)

    // Agregar la ruta actual si tiene meta (indica que es navegable)
    if (route.meta) {
      result.push({
        path: fullPath.replace(/\/+/g, '/'), // Normalizar slashes
        meta: route.meta,
        name: route.name,
      })
    }

    // Procesar rutas hijas recursivamente
    if (route.children && route.children.length > 0) {
      const childRoutes = flattenRoutes(route.children, fullPath)
      result.push(...childRoutes)
    }
  }

  return result
}

/**
 * Obtiene todas las rutas privadas accesibles según los permisos del usuario
 * @param {string[]} userPermissions - Array de permisos del usuario
 * @returns {Object[]} Array de rutas accesibles ordenadas
 */
export function getAccessibleRoutes(userPermissions = []) {
  const allRoutes = flattenRoutes(routes)

  return allRoutes.filter((route) => {
    // Excluir rutas públicas (login, forgot-password, etc.)
    if (route.meta.public === true) {
      return false
    }

    // Incluir rutas sin restricción de permisos (solo requieren autenticación)
    const requiredPerms = route.meta.permisos
    if (!requiredPerms || !Array.isArray(requiredPerms) || requiredPerms.length === 0) {
      return true
    }

    // Verificar si el usuario tiene permisos
    return hasAnyPermission(userPermissions, requiredPerms)
  })
}

/**
 * Encuentra la primera ruta accesible para un usuario
 * @param {string[]} userPermissions - Array de permisos del usuario
 * @param {string} [excludePath] - Path a excluir (para evitar bucles)
 * @returns {string|null} Path de la primera ruta accesible o null
 */
export function findFirstAccessibleRoute(userPermissions = [], excludePath = null) {
  const accessibleRoutes = getAccessibleRoutes(userPermissions)

  // Filtrar la ruta actual si se especifica (evitar redirección a sí misma)
  const filteredRoutes = excludePath
    ? accessibleRoutes.filter((route) => route.path !== excludePath)
    : accessibleRoutes

  if (filteredRoutes.length === 0) {
    return null
  }

  // Priorizar ciertas rutas estratégicas (dashboard, perfil de usuario)
  const priorityRoutes = ['/sistema/dashboard', '/sistema/usuario']

  for (const priorityPath of priorityRoutes) {
    const found = filteredRoutes.find((route) => route.path === priorityPath)
    if (found) {
      return found.path
    }
  }

  // Retornar la primera ruta disponible
  return filteredRoutes[0].path
}

/**
 * Verifica si un usuario puede acceder a una ruta específica
 * @param {string} routePath - Path de la ruta
 * @param {string[]} userPermissions - Array de permisos del usuario
 * @returns {boolean} true si el usuario puede acceder
 */
export function canAccessRoute(routePath, userPermissions = []) {
  const accessibleRoutes = getAccessibleRoutes(userPermissions)
  return accessibleRoutes.some((route) => route.path === routePath)
}
