/**
 * Constantes del Router
 *
 * Paths y configuraciones centralizadas para evitar hardcoding
 */

export const ROUTES = {
  // Rutas públicas
  LOGIN: '/login',
  ROOT: '/',
  FORGOT_PASSWORD: '/forgot-password',
  ACTIVACION_CUENTA: '/activacion-cuenta',

  // Rutas privadas
  SISTEMA_ROOT: '/sistema',
  DASHBOARD: '/sistema/dashboard',
  USUARIO_PERFIL: '/sistema/usuario',

  // Rutas especiales
  NO_AUTORIZADO: '/no-autorizado',
  NOT_FOUND: '/:catchAll(.*)*',
}

export const META_KEYS = {
  PUBLIC: 'public',
  PERMISOS: 'permisos',
  TITLE: 'title',
}
