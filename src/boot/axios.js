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
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de autenticación y HTTP
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, la retornamos tal cual
    return response
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    // --- 401: No autorizado / sesión expirada ---
    if (status === 401) {
      Notify.create({
        type: 'warning',
        message: 'No autorizado (401)',
        caption: 'Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.',
        position: 'top-right',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white' }],
      })

      // Token inválido o expirado - limpiar todo lo relevante
      localStorage.removeItem('token')
      localStorage.removeItem('authToken')
      localStorage.removeItem('usuario')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('username')

      // Solo redirigir si no estamos ya en la pantalla de login
      const currentPath = window.location.pathname
      if (!currentPath.includes('/login')) {
        window.location.href = '/login'
      }

      return Promise.reject(error)
    }

    // --- 404: Recurso no encontrado ---
    if (status === 404) {
      Notify.create({
        type: 'negative',
        message: 'Recurso no encontrado (404)',
        caption: message,
        position: 'top-right',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    }
    // --- 500: Error interno del servidor ---
    else if (status === 500) {
      Notify.create({
        type: 'negative',
        message: 'Error interno del servidor (500)',
        caption: message || 'Por favor, contacte al administrador',
        position: 'top-right',
        timeout: 4000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    }
    // --- 403: Acceso denegado ---
    else if (status === 403) {
      Notify.create({
        type: 'warning',
        message: 'Acceso denegado (403)',
        caption: 'No tiene permisos para realizar esta acción',
        position: 'top-right',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    }
    // --- Errores de red / backend caído ---
    else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      Notify.create({
        type: 'negative',
        message: 'Error de conexión',
        caption:
          'No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.',
        position: 'top-right',
        timeout: 5000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    }
    // --- Otros errores 4xx/5xx genéricos ---
    else if (status && status >= 400) {
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
