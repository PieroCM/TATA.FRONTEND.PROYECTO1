/**
 * Boot file para limpiar autenticación en modo desarrollo
 *
 * Comportamiento INTELIGENTE:
 * - LIMPIA localStorage SOLO al iniciar el servidor (primera carga)
 * - PRESERVA sesión en recargas normales (F5, navegación)
 * - Usa sessionStorage como flag temporal (se borra al cerrar pestaña)
 *
 * ¿Cómo funciona?
 * 1. Al iniciar el servidor → sessionStorage vacío → LIMPIA localStorage
 * 2. Marca sessionStorage.devServerStarted = 'true'
 * 3. En recargas (F5) → sessionStorage existe → NO limpia nada
 * 4. Al cerrar pestaña → sessionStorage se borra → próximo inicio limpia
 *
 * Ventajas:
 * ✅ Desarrollo limpio al levantar el servidor
 * ✅ Sesión persiste al presionar F5
 * ✅ No necesitas logout manual cada vez
 */

export default () => {
  if (process.env.DEV) {
    const DEV_SESSION_KEY = 'devServerStarted'

    // Verificar si es la PRIMERA CARGA del servidor
    const isPrimeraVez = !sessionStorage.getItem(DEV_SESSION_KEY)

    if (isPrimeraVez) {
      // SOLO limpia en la primera carga (al iniciar el servidor)
      console.log('🧹 [DEV MODE] Primera carga detectada → Limpiando autenticación...')

      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      localStorage.removeItem('authPerms')

      // Marcar que el servidor ya se inició (persiste durante la sesión de navegador)
      sessionStorage.setItem(DEV_SESSION_KEY, 'true')

      console.log('✅ [DEV MODE] localStorage limpiado. Puedes hacer login.')
    } else {
      // F5 o recarga normal → NO hacer nada
      console.log('🔄 [DEV MODE] Recarga detectada → Sesión preservada (F5 permitido)')
    }
  }
}
