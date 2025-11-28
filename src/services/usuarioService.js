import { api } from 'src/boot/axios'

/**
 * Servicio de Gestión de Usuarios
 * Maneja operaciones CRUD de usuarios y administración
 */
export const usuarioService = {
  // ===========================
  // CRUD USUARIOS
  // ===========================

  /**
   * Obtener todos los usuarios
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const response = await api.get('/api/usuario')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Obtener usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await api.get(`/api/usuario/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Crear nuevo usuario (solo Admin)
   * @param {Object} usuario - {username, password, idRolSistema, idPersonal?, estado}
   * @returns {Promise<Object>}
   */
  async create(usuario) {
    try {
      const response = await api.post('/api/usuario', usuario)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Actualizar usuario existente
   * @param {number} id - ID del usuario
   * @param {Object} datosActualizar - {username?, idRolSistema?, estado?}
   * @returns {Promise<{message: string}>}
   */
  async update(id, datosActualizar) {
    try {
      const response = await api.put(`/api/usuario/${id}`, datosActualizar)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Eliminar usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<{message: string}>}
   */
  async delete(id) {
    try {
      const response = await api.delete(`/api/usuario/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Toggle estado de usuario (ACTIVO <-> INACTIVO)
   * @param {number} id - ID del usuario
   * @param {string} estado - Nuevo estado ('ACTIVO' | 'INACTIVO')
   * @returns {Promise<{message: string}>}
   */
  async toggleEstado(id, estado) {
    try {
      const response = await api.patch(`/api/usuario/${id}/toggle-estado`, { estado })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Vincular personal existente con usuario (solo Admin)
   * @param {Object} datos - {idPersonal, username, idRolSistema}
   * @returns {Promise<{message: string, detalles: Object}>}
   */
  async vincularPersonal(datos) {
    try {
      // Intentar primero con el endpoint de Usuario
      const response = await api.post('/api/usuario/vincular-personal', datos)
      return response.data
    } catch (error) {
      // Si falla (403 Forbidden por permisos), intentar endpoint alternativo
      if (error.response?.status === 403) {
        console.warn(
          '⚠️ Endpoint /api/usuario/vincular-personal requiere ADMIN. Intentando alternativa...',
        )
        // Puedes agregar aquí un endpoint alternativo si existe en PersonalController
        throw new Error('No tienes permisos para crear cuentas de usuario. Se requiere rol ADMIN.')
      }
      throw this.handleError(error)
    }
  },

  /**
   * Actualizar rol de usuario
   * @param {number} id - ID del usuario
   * @param {number} idRolSistema - Nuevo ID de rol
   * @returns {Promise<{message: string}>}
   */
  async actualizarRol(id, idRolSistema) {
    try {
      const response = await api.patch(`/api/usuario/${id}/rol`, { idRolSistema })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  // ===========================
  // ACTIVACIÓN Y RECUPERACIÓN
  // ===========================

  /**
   * Activar cuenta con token (soporta email o username)
   * @param {Object} datos - {Email: string (puede ser email o username), Token: string, NuevaPassword: string}
   * @returns {Promise<{message: string}>}
   */
  async activarCuenta(datos) {
    try {
      console.log('[Activación] Enviando Email/Username:', datos.Email)
      console.log('[Activación] Token enviado:', datos.Token ? '✓' : '✗')

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
      return new Error(error.response.data?.message || 'Error en el servidor')
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor')
    } else {
      return new Error(error.message || 'Error desconocido')
    }
  },
}
