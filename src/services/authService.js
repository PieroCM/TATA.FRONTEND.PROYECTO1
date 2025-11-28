import { api } from 'src/boot/axios'

/**
 * Servicio de Autenticación
 * Maneja login, registro, recuperación de contraseña y activación de cuentas
 */
export const authService = {
  // ===========================
  // AUTENTICACIÓN
  // ===========================

  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<{message: string, token: string}>}
   */
  async signIn(email, password) {
    try {
      const response = await api.post('/api/usuario/signin', {
        email,
        password,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Registro público de usuario
   * @param {Object} datos - {email, password, idPersonal?}
   * @returns {Promise<{message: string}>}
   */
  async signUp(datos) {
    try {
      const response = await api.post('/api/usuario/signup', datos)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Solicitar recuperación de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<{message: string}>}
   */
  async solicitarRecuperacion(email) {
    try {
      const response = await api.post('/api/usuario/solicitar-recuperacion', {
        email,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Restablecer contraseña con token
   * @param {Object} datos - {email, token, nuevaPassword}
   * @returns {Promise<{message: string}>}
   */
  async restablecerPassword(datos) {
    try {
      const response = await api.post('/api/usuario/restablecer-password', datos)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Activar cuenta con token
   * @param {Object} datos - {email, token, nuevaPassword}
   * @returns {Promise<{message: string}>}
   */
  async activarCuenta(datos) {
    try {
      const response = await api.post('/api/usuario/activar-cuenta', datos)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Cambiar contraseña (usuario autenticado)
   * @param {Object} datos - {email, passwordActual, nuevaPassword}
   * @returns {Promise<{message: string}>}
   */
  async cambiarPassword(datos) {
    try {
      const response = await api.put('/api/usuario/cambiar-password', datos)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // ===========================
  // MANEJO DE ERRORES
  // ===========================

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data?.message || 'Error en el servidor')
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor')
    } else {
      return new Error(error.message || 'Error desconocido')
    }
  },
}
