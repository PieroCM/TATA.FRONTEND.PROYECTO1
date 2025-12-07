/**
 * Boot file para limpiar autenticación en modo desarrollo
 *
 * Propósito:
 * - En desarrollo, limpia el localStorage de tokens previos al iniciar la app
 * - Esto asegura que cada `quasar dev` comience con el formulario de login
 * - Sin este archivo, tokens previos mantienen al usuario automáticamente logueado
 *
 * Comportamiento:
 * - process.env.DEV = true → Se ejecuta la limpieza
 * - process.env.DEV = false → No hace nada (producción)
 */

export default ({ app }) => {
  // Solo ejecutar en entorno de desarrollo
  if (process.env.DEV) {
    console.log('🧹 [DEV MODE] Limpiando tokens de autenticación previos...')

    // Remover credenciales de sesión anterior
    localStorage.removeItem('authToken')
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('username')

    console.log('✅ [DEV MODE] localStorage limpiado. Ir a /login para iniciar sesión.')
  }
}
