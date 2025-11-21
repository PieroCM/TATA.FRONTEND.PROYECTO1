import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

// Configuración de la API base
// La URL se puede cambiar en el archivo .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7010/api',
  timeout: parseInt(import.meta.env.VITE_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para requests - agregar token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses - manejo de errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Los errores se manejan en los componentes usando $q.notify
    // Solo añadimos información adicional al error para debugging
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('Network Error: No response received', error.request)
    } else {
      console.error('Request Error:', error.message)
    }
    return Promise.reject(error)
  }
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
