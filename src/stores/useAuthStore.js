import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Store de autenticación del usuario
 * Maneja sesión, token y datos del usuario logueado
 */
export const useAuthStore = defineStore('auth', () => {
  // Estado
  const token = ref(localStorage.getItem('authToken') || null)
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userEmail = computed(() => usuario.value?.correo || usuario.value?.email || null)
  const userName = computed(
    () => usuario.value?.nombre || usuario.value?.nombreCompleto || 'Usuario',
  )

  /**
   * Guarda el token y datos del usuario en el estado y localStorage
   */
  const setAuth = (authToken, userData) => {
    token.value = authToken
    usuario.value = userData

    localStorage.setItem('authToken', authToken)
    localStorage.setItem('usuario', JSON.stringify(userData))
  }

  /**
   * Limpia la sesión (logout)
   */
  const clearAuth = () => {
    token.value = null
    usuario.value = null

    localStorage.removeItem('authToken')
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('username')
  }

  /**
   * Restaura la sesión desde localStorage
   */
  const restoreSession = () => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('usuario')

    if (storedToken && storedUser) {
      token.value = storedToken
      usuario.value = JSON.parse(storedUser)
      return true
    }

    return false
  }

  return {
    // Estado
    token,
    usuario,

    // Getters
    isAuthenticated,
    userEmail,
    userName,

    // Actions
    setAuth,
    clearAuth,
    restoreSession,
  }
})
