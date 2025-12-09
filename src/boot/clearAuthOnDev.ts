/**
 * Boot file para limpiar autenticación en modo desarrollo
 *
 * Propósito:
 * - [DESHABILITADO] Anteriormente limpiaba localStorage en cada recarga
 * - PROBLEMA: Impedía mantener sesión al presionar F5
 * - SOLUCIÓN: Comentado para permitir persistencia de sesión
 *
 * Para limpiar manualmente la sesión en desarrollo:
 * - Opción 1: Usar DevTools → Application → Local Storage → Clear All
 * - Opción 2: Hacer logout desde la aplicación
 * - Opción 3: Descomentar temporalmente el código de limpieza
 *
 * Comportamiento actual:
 * - NO limpia localStorage automáticamente
 * - Permite mantener sesión entre recargas (F5)
 * - boot/auth.js restaurará la sesión si existe
 */

export default ({ app }) => {
  // DESHABILITADO: No limpiar en cada recarga para permitir persistencia
  // if (process.env.DEV) {
  //   console.log('🧹 [DEV MODE] Limpiando tokens de autenticación previos...')
  //
  //   localStorage.removeItem('authToken')
  //   localStorage.removeItem('authUser')
  //   localStorage.removeItem('authPerms')
  //
  //   console.log('✅ [DEV MODE] localStorage limpiado. Ir a /login para iniciar sesión.')
  // }

  // Si necesitas limpiar la sesión, haz logout manualmente o usa DevTools
  if (process.env.DEV) {
    console.log('ℹ️ [DEV MODE] clearAuthOnDev deshabilitado - sesión persiste entre recargas')
  }
}
