import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

const api = axios.create({ baseURL: 'http://localhost:5260' })

// Agregar interceptor para incluir token de autenticación
api.interceptors.request.use(
  (config) => {
    // Buscar token en localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor de respuesta para manejar 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.warn('Token expirado o inválido (401)')

      // Limpiar token
      localStorage.removeItem('token')
      localStorage.removeItem('auth_token')

      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
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
