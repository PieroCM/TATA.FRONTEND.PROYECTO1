import { api } from 'src/boot/axios'

export const usuarioService = {
  // ===========================
  // AUTENTICACIÓN
  // ===========================

  async login(correo, password) {
    try {
      const response = await api.post('/usuario/signin', {
        correo,
        password,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async register(username, correo, password) {
    try {
      const response = await api.post('/usuario/signup', {
        username,
        correo,
        password,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // ===========================
  // CRUD USUARIOS
  // ===========================

  async getAll() {
    try {
      const response = await api.get('/usuario')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/usuario/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async create(usuario) {
    try {
      const response = await api.post('/usuario', usuario)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async update(id, datosActualizar) {
    try {
      const response = await api.put(`/usuario/${id}`, datosActualizar)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/usuario/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async toggleEstado(id, estado) {
    try {
      const response = await api.patch(`/usuario/${id}/toggle-estado`, {
        estado,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // ===========================
  // GESTIÓN DE PERSONAL Y VINCULACIÓN
  // ===========================

  /**
   * Nueva función extraída del conflicto de merge.
   * Se encarga de vincular un usuario con personal.
   */
  async vincularPersonal(datos) {
    try {
      // Endpoint de la rama fix/Loginygestionpersonal
      const response = await api.post('/api/usuario/vincular-personal', datos)
      return response.data
    } catch (error) {
      // Manejo de error específico para permisos (403)
      if (error.response?.status === 403) {
        console.warn(
          '⚠️ Endpoint /api/usuario/vincular-personal requiere ADMIN. Verifique permisos.',
        )
        throw new Error('No tienes permisos para crear/vincular cuentas. Se requiere rol ADMIN.')
      }
      throw this.handleError(error)
    }
  },

  // ===========================
  // CONTRASEÑAS Y RECUPERACIÓN
  // ===========================

  async cambiarPassword(correo, passwordActual, nuevaPassword) {
    try {
      const response = await api.put('/usuario/cambiar-password', {
        correo,
        passwordActual,
        nuevaPassword,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async solicitarRecuperacion(email) {
    try {
      // Endpoint de la rama fix/presentacion
      const response = await api.post('/usuario/solicitar-recuperacion', {
        Email: email,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async restablecerPassword(email, token, nuevaPassword) {
    try {
      const response = await api.post('/usuario/restablecer-password', {
        Email: email,
        Token: token,
        NuevaPassword: nuevaPassword,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // ===========================
  // ACTIVACIÓN DE CUENTA
  // ===========================

  /**
   * Activar cuenta con token (soporta email o username)
   * @param {Object} datos - {Email: string, Token: string, NuevaPassword: string}
   */
  async activarCuenta(datos) {
    try {
      console.log('[Activación] Enviando Email/Username:', datos.Email)
      const response = await api.post('/api/usuario/activar-cuenta', datos)
      return response.data
    } catch (error) {
      console.error('[Activación] Error en servicio:', error.response?.data || error.message)
      throw this.handleError(error)
    }
  },

  // ===========================
  // MANEJO DE ERRORES
  // ===========================

  handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      return new Error(error.response.data.message || 'Error en el servidor')
    } else if (error.request) {
      // Error de red
      return new Error('No se pudo conectar con el servidor')
    } else {
      // Otro error
      return new Error(error.message || 'Error desconocido')
    }
  },
}