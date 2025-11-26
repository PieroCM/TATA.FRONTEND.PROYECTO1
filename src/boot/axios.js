import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'http://localhost:5260' })

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

    // Rechazar la promesa para que pueda ser manejada localmente
    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
