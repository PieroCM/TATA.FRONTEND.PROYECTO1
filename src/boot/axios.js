import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

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

// Interceptor de respuesta para manejo global de errores
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, la retornamos tal cual
    return response
  },
  (error) => {
    // Manejo de errores HTTP
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    // Notificación visual de error
    if (status === 404) {
      Notify.create({
        type: 'negative',
        message: 'Recurso no encontrado (404)',
        caption: message,
        position: 'top-right',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    } else if (status === 500) {
      Notify.create({
        type: 'negative',
        message: 'Error interno del servidor (500)',
        caption: message || 'Por favor, contacte al administrador',
        position: 'top-right',
        timeout: 4000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    } else if (status === 401) {
      Notify.create({
        type: 'warning',
        message: 'No autorizado (401)',
        caption: 'Por favor, inicie sesión nuevamente',
        position: 'top-right',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white' }],
      })
      // Token inválido o expirado - limpiar y redirigir al login
      localStorage.removeItem('authToken')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('username')
      window.location.href = '/login'
    } else if (status === 403) {
      Notify.create({
        type: 'warning',
        message: 'Acceso denegado (403)',
        caption: 'No tiene permisos para realizar esta acción',
        position: 'top-right',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      Notify.create({
        type: 'negative',
        message: 'Error de conexión',
        caption: 'No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.',
        position: 'top-right',
        timeout: 5000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    } else if (status >= 400) {
      Notify.create({
        type: 'negative',
        message: `Error ${status}`,
        caption: message || 'Ocurrió un error en la solicitud',
        position: 'top-right',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white' }],
      })
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
