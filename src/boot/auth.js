import { defineBoot } from '#q-app/wrappers'
import { useAuthStore } from 'src/stores/useAuthStore'

/**
 * Boot file de autenticación
 *
 * Propósito:
 * - Restaurar sesión desde localStorage ANTES de que el router inicie
 * - Garantizar que authStore.isAuthenticated sea correcto desde el inicio
 * - Evitar que el usuario sea redirigido al login si tiene una sesión válida
 *
 * Orden de ejecución (definido en quasar.config.js):
 * 1. clearAuthOnDev (solo en DEV, limpia storage)
 * 2. auth (este archivo - restaura sesión)
 * 3. axios (configura interceptores con token ya cargado)
 * 4. Router guards (authGuard + permissionGuard)
 */

export default defineBoot(({ _app, _router }) => {
  const authStore = useAuthStore()

  // Restaurar sesión desde localStorage si existe
  const sessionRestored = authStore.hydrateFromLocalStorage()

  if (sessionRestored) {
    console.log('✅ Sesión restaurada desde localStorage')
    console.log('👤 Usuario:', authStore.userName)
    console.log('🔑 Token presente:', !!authStore.token)
    console.log('🛡️ Permisos cargados:', authStore.permisos.length)
  } else {
    console.log('ℹ️ No hay sesión previa en localStorage')
  }
})
