import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Store de autenticación del usuario
 * Maneja sesión, token, datos del usuario y permisos
 */
export const useAuthStore = defineStore('auth', () => {
  // Estado
  const token = ref(null)
  const usuario = ref(null)
  const permisos = ref([])

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userEmail = computed(() => usuario.value?.email || null)
  const userName = computed(() => {
    if (!usuario.value) return 'Usuario'
    return (
      `${usuario.value.nombres || ''} ${usuario.value.apellidos || ''}`.trim() ||
      usuario.value.username ||
      'Usuario'
    )
  })
  const userRole = computed(() => usuario.value?.rolNombre || usuario.value?.rolCodigo || null)

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermiso = (codigoPermiso) => {
    return permisos.value?.includes(codigoPermiso) || false
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos proporcionados
   */
  const hasAnyPermiso = (codigosPermisos) => {
    if (!Array.isArray(codigosPermisos)) return false
    return codigosPermisos.some((permiso) => permisos.value?.includes(permiso))
  }

  /**
   * Guarda el token, datos del usuario y permisos en el estado y localStorage
   */
  const setAuth = (authData) => {
    token.value = authData.token

    usuario.value = {
      idUsuario: authData.idUsuario,
      username: authData.username,
      email: authData.email,
      idPersonal: authData.idPersonal,
      nombres: authData.nombres,
      apellidos: authData.apellidos,
      idRolSistema: authData.idRolSistema,
      rolCodigo: authData.rolCodigo,
      rolNombre: authData.rolNombre,
    }

    permisos.value = authData.permisos || []

    // Persistir en localStorage
    localStorage.setItem('authToken', authData.token)
    localStorage.setItem('authUser', JSON.stringify(usuario.value))
    localStorage.setItem('authPerms', JSON.stringify(permisos.value))
  }

  /**
   * Limpia la sesión (logout)
   */
  const clearAuth = () => {
    token.value = null
    usuario.value = null
    permisos.value = []

    // Limpiar todo localStorage relacionado con auth
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('authPerms')
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('username')
  }

  /**
   * Restaura la sesión desde localStorage
   */
  const hydrateFromLocalStorage = () => {
    try {
      const storedToken = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('authUser')
      const storedPerms = localStorage.getItem('authPerms')

      if (storedToken && storedUser) {
        token.value = storedToken
        usuario.value = JSON.parse(storedUser)
        permisos.value = storedPerms ? JSON.parse(storedPerms) : []
        return true
      }

      return false
    } catch (error) {
      console.error('Error al restaurar sesión desde localStorage:', error)
      clearAuth()
      return false
    }
  }

  /**
   * Alias para compatibilidad con código existente
   */
  const restoreSession = hydrateFromLocalStorage

  return {
    // Estado
    token,
    usuario,
    permisos,

    // Getters
    isAuthenticated,
    userEmail,
    userName,
    userRole,

    // Actions
    setAuth,
    clearAuth,
    hydrateFromLocalStorage,
    restoreSession,
    hasPermiso,
    hasAnyPermiso,
  }
})
