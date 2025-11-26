import { api } from 'src/boot/axios'

/**
 * Servicio para gestionar operaciones de usuarios
 */
const usuarioService = {
  /**
   * Obtiene la información completa de un usuario (usuario + personal + rol)
   * @param {number} id - ID del usuario
   * @returns {Promise} Datos combinados del usuario
   */
  async getUsuario(id) {
    try {
      console.log('🔍 Llamando a:', `/api/Usuario/${id}`)
      const response = await api.get(`/api/Usuario/${id}`)
      console.log('✅ Respuesta exitosa:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error)
      console.error('📍 Status:', error.response?.status)
      console.error('📄 Mensaje:', error.response?.data)
      throw error
    }
  },

  /**
   * Actualiza la información del usuario
   * @param {number} id - ID del usuario
   * @param {object} payload - Datos a actualizar
   * @returns {Promise} Respuesta del servidor
   */
  async updateUsuario(id, payload) {
    try {
      const response = await api.put(`/api/Usuario/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      throw error
    }
  },

  /**
   * Actualiza la información personal del usuario
   * @param {number} id - ID del personal
   * @param {object} payload - Datos a actualizar
   * @returns {Promise} Respuesta del servidor
   */
  async updatePersonal(id, payload) {
    try {
      const response = await api.put(`/api/Personal/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('Error actualizando personal:', error)
      throw error
    }
  },

  /**
   * Cambia la contraseña del usuario
   * @param {object} payload - { correo, passwordActual, passwordNuevo }
   * @returns {Promise} Respuesta del servidor
   */
  async changePassword(payload) {
    try {
      const response = await api.put('/api/Usuario/cambiar-password', payload)
      return response.data
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      throw error
    }
  },

  /**
   * Crea una nueva alerta en el sistema
   * @param {object} payload - Datos de la alerta
   * @returns {Promise} Respuesta del servidor
   */
  async createAlerta(payload) {
    try {
      const response = await api.post('/api/Alerta', payload)
      return response.data
    } catch (error) {
      console.error('Error creando alerta:', error)
      throw error
    }
  },

  /**
   * Valida la contraseña actual del usuario
   * @param {string} correo - Correo del usuario
   * @param {string} password - Contraseña a validar
   * @returns {Promise<boolean>} True si la contraseña es correcta
   */
  async validatePassword(correo, password) {
    try {
      // Intentamos hacer signin para validar la contraseña
      const response = await api.post('/api/Usuario/signin', {
        correo,
        password,
      })
      return response.data.token ? true : false
    } catch (error) {
      return false
    }
  },
}

export default usuarioService
