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
      const response = await api.post('/api/usuario/signup', {
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
      console.log(
        '📤 [getAll] Llamando a:',
        api.defaults.baseURL + '/api/personal/gestion-usuarios',
      )
      const response = await api.get('/api/personal/gestion-usuarios')
      console.log('✅ [getAll] Personal/Usuarios recibidos:', response.data.length)
      return response.data
    } catch (error) {
      console.error('❌ [getAll] Error:', error)
      throw this.handleError(error)
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/api/usuario/${id}`)
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
  // CONTRASEÑAS
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
