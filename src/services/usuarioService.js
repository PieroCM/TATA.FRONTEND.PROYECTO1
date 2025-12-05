import { api } from 'src/boot/axios'

export const usuarioService = {
  // ===========================
  // AUTENTICACIÓN
  // ===========================

  async login(email, password) {
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

  async register(email, password, idPersonal = null) {
    try {
      const response = await api.post('/api/usuario/signup', {
        email,
        password,
        idPersonal,
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

  // ===========================
  // 🔵 FLUJO 1: Crear Personal SIN Cuenta
  // POST /api/personal
  // ===========================
  async crearPersonalSimple(personal) {
    try {
      console.log('📤 [FLUJO 1] Crear Personal Simple:', personal)
      const response = await api.post('/api/personal', {
        nombres: personal.nombres,
        apellidos: personal.apellidos,
        documento: personal.documento || null,
        correoCorporativo: personal.correoCorporativo || null,
        estado: personal.estado || 'ACTIVO',
      })
      console.log('✅ [FLUJO 1] Personal creado:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [FLUJO 1] Error:', error)
      throw this.handleError(error)
    }
  },

  // ===========================
  // 🔑 FLUJO 2: Crear Personal CON Cuenta al Mismo Tiempo
  // POST /api/personal/with-account
  // ===========================
  async crearPersonalConCuenta(data) {
    try {
      console.log('📤 [FLUJO 2] Crear Personal + Usuario:', data)
      const response = await api.post('/api/personal/with-account', {
        nombres: data.nombres,
        apellidos: data.apellidos,
        documento: data.documento || null,
        correoCorporativo: data.correoCorporativo,
        estado: data.estado || 'ACTIVO',
        crearCuentaUsuario: true,
        username: data.username,
        idRolSistema: data.idRolSistema,
      })
      console.log('✅ [FLUJO 2] Personal + Usuario creado:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [FLUJO 2] Error:', error)
      throw this.handleError(error)
    }
  },

  // ===========================
  // 🔄 FLUJO 3: Vincular Personal Existente a Usuario (Solo Admin)
  // POST /api/usuario/vincular-personal
  // ===========================
  async vincularPersonal(payload) {
    try {
      console.log('📤 [FLUJO 3] Vincular Personal a Usuario:', payload)
      const response = await api.post('/api/usuario/vincular-personal', {
        idPersonal: payload.idPersonal,
        username: payload.username,
        idRolSistema: payload.idRolSistema,
      })
      console.log('✅ [FLUJO 3] Personal vinculado:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [FLUJO 3] Error:', error)
      throw this.handleError(error)
    }
  },

  // ===========================
  // ACTUALIZAR PERSONAL
  // ===========================
  async actualizarPersonal(id, datos) {
    try {
      console.log('📤 [actualizarPersonal] ID:', id, 'Datos:', datos)
      const response = await api.put(`/api/personal/${id}`, datos)
      console.log('✅ [actualizarPersonal] Actualizado:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [actualizarPersonal] Error:', error)
      throw this.handleError(error)
    }
  },

  async eliminarUsuario(id) {
    try {
      const response = await api.delete(`/api/usuario/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async eliminarPersonal(id) {
    try {
      const response = await api.delete(`/api/personal/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async verificarDocumento(documento) {
    try {
      const response = await api.get(`/api/personal/verificar-documento/${documento}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async activarCuenta(email, token, nuevaPassword) {
    try {
      console.log('📤 [activarCuenta] Activando cuenta:', { email, token })
      const response = await api.post('/api/usuario/activar-cuenta', {
        email,
        token,
        nuevaPassword,
      })
      console.log('✅ [activarCuenta] Cuenta activada:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [activarCuenta] Error:', error)
      throw this.handleError(error)
    }
  },

  async toggleEstado(id, estado) {
    try {
      const response = await api.patch(`/api/usuario/${id}/toggle-estado`, {
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

  async cambiarPassword(email, passwordActual, nuevaPassword) {
    try {
      const response = await api.put('/api/usuario/cambiar-password', {
        email,
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
      const response = await api.post('/api/usuario/solicitar-recuperacion', {
        email,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async restablecerPassword(email, token, nuevaPassword) {
    try {
      const response = await api.post('/api/usuario/restablecer-password', {
        email,
        token,
        nuevaPassword,
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
      console.error('❌ Error response:', error.response.data)
      return new Error(
        error.response.data.message || error.response.data.detalle || 'Error en el servidor',
      )
    } else if (error.request) {
      console.error('❌ Error request:', error.request)
      return new Error('No se pudo conectar con el servidor')
    } else {
      console.error('❌ Error:', error.message)
      return new Error(error.message || 'Error desconocido')
    }
  },
}
