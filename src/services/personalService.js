import { api } from 'src/boot/axios'

/**
 * Servicio de Gestión de Personal
 * Maneja operaciones CRUD de personal y verificaciones
 */
export const personalService = {
  // ===========================
  // CRUD PERSONAL
  // ===========================

  /**
   * Obtener todo el personal
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const response = await api.get('/api/personal')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Obtener personal por ID
   * @param {number} id - ID del personal
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await api.get(`/api/personal/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Crear personal simple (sin cuenta de usuario)
   * @param {Object} personal - {nombres, apellidos, documento?, correoCorporativo?, estado?}
   * @returns {Promise<{message: string}>}
   */
  async create(personal) {
    try {
      const response = await api.post('/api/personal', personal)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Crear personal con cuenta de usuario (condicional y transaccional)
   * @param {Object} datos - {
   *   nombres, apellidos, documento?, correoCorporativo?, estado?,
   *   crearCuentaUsuario: boolean,
   *   username?, idRolSistema?
   * }
   * @returns {Promise<{message: string, conCuentaUsuario: boolean, username?: string, instrucciones?: string}>}
   */
  async createWithAccount(datos) {
    try {
      const response = await api.post('/api/personal/with-account', datos)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Actualizar personal existente
   * @param {number} id - ID del personal
   * @param {Object} datosActualizar - {nombres?, apellidos?, documento?, correoCorporativo?, estado?}
   * @returns {Promise<{message: string}>}
   */
  async update(id, datosActualizar) {
    try {
      const response = await api.put(`/api/personal/${id}`, datosActualizar)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Eliminar personal
   * @param {number} id - ID del personal
   * @returns {Promise<{message: string}>}
   */
  async delete(id) {
    try {
      const response = await api.delete(`/api/personal/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Verificar si un documento ya está registrado
   * @param {string} documento - Número de documento a verificar
   * @returns {Promise<{existe: boolean, documento: string, mensaje: string}>}
   */
  async verificarDocumento(documento) {
    try {
      const response = await api.get(`/api/personal/verificar-documento/${documento}`)
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
      const data = error.response.data
      // Si hay un detalle específico del error, incluirlo
      const mensaje = data?.detalle || data?.message || 'Error en el servidor'
      return new Error(mensaje)
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor')
    } else {
      return new Error(error.message || 'Error desconocido')
    }
  },
}
