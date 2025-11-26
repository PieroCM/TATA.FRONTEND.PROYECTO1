import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5260' })

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Obtener el token desde localStorage usando la clave 'authToken'
    const token = localStorage.getItem('authToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Log solo en desarrollo para verificar que el token se envía
      if (process.env.DEV) {
        console.log(`[Axios] Enviando request a ${config.url} con token`)
      }
    } else {
      // Log solo en desarrollo para advertir cuando no hay token
      if (process.env.DEV) {
        console.warn(
          `[Axios] Request a ${config.url} sin token (puede fallar si requiere autorización)`,
        )
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado - redirigir al login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
