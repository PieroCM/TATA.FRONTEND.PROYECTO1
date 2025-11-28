import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5260' })

// Agregar interceptor para incluir token de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtener el token desde localStorage usando la clave 'authToken'
    const token = localStorage.getItem('authToken')

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
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token expirado o inválido
      console.warn('🔒 Token expirado o inválido (401)')

      // Limpiar token y datos del usuario
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('username')

      // Redirigir al login si no estamos ya ahí
      const currentPath = window.location.pathname
      if (currentPath !== '/' && currentPath !== '/login') {
        console.log('Redirigiendo a login...')
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
