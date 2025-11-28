import { api } from 'src/boot/axios'

/**
 * Servicio para gestionar operaciones de usuarios
 */
const usuarioService = {
  /**
   * Obtiene la información completa de un personal (personal + usuario + rol)
   * @param {number} idPersonal - ID del personal
   * @returns {Promise} Datos del personal con usuario y rol
   */
  async getUsuario(idPersonal) {
    try {
      console.log('🔍 Llamando a:', `/api/Personal/${idPersonal}`)
      const personalResponse = await api.get(`/api/Personal/${idPersonal}`)
      const personalData = personalResponse.data
      console.log('✅ Personal obtenido:', personalData)

      // Si tiene usuario vinculado, obtener datos completos del usuario con rol
      if (personalData.idUsuario) {
        console.log('🔍 Obteniendo datos de usuario:', personalData.idUsuario)
        const usuarioResponse = await api.get(`/api/Usuario/${personalData.idUsuario}`)
        const usuarioData = usuarioResponse.data
        console.log('✅ Usuario obtenido:', usuarioData)

        // Obtener información del rol del sistema
        let rolData = null
        if (usuarioData.idRolSistema) {
          console.log('🔍 Obteniendo rol del sistema:', usuarioData.idRolSistema)
          try {
            const rolResponse = await api.get(`/api/RolesSistema/${usuarioData.idRolSistema}`)
            rolData = rolResponse.data
            console.log('✅ Rol obtenido:', rolData)
          } catch (rolError) {
            console.warn('⚠️ No se pudo obtener el rol:', rolError)
          }
        }

        // Combinar datos de Personal, Usuario y Rol
        return {
          ...personalData,
          username: usuarioData.username,
          estadoCuentaAcceso: usuarioData.estado,
          idRolSistema: usuarioData.idRolSistema,
          rol: rolData, // Incluir el rol completo del sistema
        }
      }

      // Si no tiene usuario, devolver solo datos de personal
      return personalData
    } catch (error) {
      console.error('❌ Error obteniendo datos:', error)
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
   * @param {object} payload - { email, passwordActual, nuevaPassword }
   * @returns {Promise} Respuesta del servidor
   */
  async changePassword(payload) {
    try {
      console.log('🔍 Cambiando contraseña para:', payload.email)
      console.log('📤 Payload enviado:', {
        Email: payload.email,
        PasswordActual: '***',
        NuevaPassword: '***',
      })

      const response = await api.put('/api/Usuario/cambiar-password', {
        Email: payload.email, // Backend espera 'Email' con mayúscula
        PasswordActual: payload.passwordActual, // Backend espera 'PasswordActual'
        NuevaPassword: payload.nuevaPassword, // Backend espera 'NuevaPassword'
      })

      console.log('✅ Contraseña cambiada exitosamente')
      return response.data
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error.response?.data)
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
      console.log('🔍 Validando contraseña para:', correo)
      // Intentamos hacer signin para validar la contraseña
      const response = await api.post('/api/Usuario/signin', {
        email: correo, // El backend espera 'email', no 'correo'
        password: password,
      })
      console.log('✅ Contraseña válida')
      return response.data.token ? true : false
    } catch (error) {
      console.error('❌ Contraseña inválida:', error.response?.data)
      return false
    }
  },
}

export default usuarioService
