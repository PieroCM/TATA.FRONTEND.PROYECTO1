import { api } from 'src/boot/axios'

/**
 * Servicio de Gestión de Roles del Sistema
 * Maneja operaciones de consulta de roles
 */
export const rolService = {
  /**
   * Obtener todos los roles del sistema
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const response = await api.get('/api/RolesSistema')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Obtener rol por ID
   * @param {number} id - ID del rol
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await api.get(`/api/RolesSistema/${id}`)
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
