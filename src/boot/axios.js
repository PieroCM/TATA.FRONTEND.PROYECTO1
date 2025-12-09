import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5260' })

// Agregar interceptor para incluir token de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtener el token desde localStorage (fall back: 'token')
    const token = localStorage.getItem('authToken') || localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('📤 Request con token:', {
        url: config.url,
        method: config.method,
        hasToken: true,
      })
    } else {
      console.warn('⚠️ Request SIN token:', {
        url: config.url,
        method: config.method,
      })
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor de respuesta para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token expirado o inválido
      console.warn('🔒 Token expirado o inválido (401)')

      // Importar authStore y limpiar sesión completa
      const { useAuthStore } = await import('src/stores/useAuthStore')
      const authStore = useAuthStore()
      authStore.clearAuth()

      // Redirigir al login si no estamos ya ahí
      const currentPath = window.location.pathname
      if (currentPath !== '/' && currentPath !== '/login') {
        console.log('↪️ Redirigiendo a login...')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
