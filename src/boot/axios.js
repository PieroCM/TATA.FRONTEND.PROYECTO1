import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
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

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
