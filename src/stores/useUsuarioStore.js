import { defineStore } from 'pinia'
import { personalService } from 'src/services/personalService'
import { usuarioService } from 'src/services/usuarioService'

export const useUsuarioStore = defineStore('usuario', {
  state: () => ({
    usuarios: [],
    usuarioActual: null,
    loading: false,
    error: null,
  }),

  getters: {
    usuariosActivos: (state) => state.usuarios.filter((u) => u.estado === 'ACTIVO'),
    usuariosInactivos: (state) => state.usuarios.filter((u) => u.estado === 'INACTIVO'),
    totalUsuarios: (state) => state.usuarios.length,
  },

  actions: {
    async fetchUsuarios() {
      this.loading = true
      this.error = null

      try {
        // Usar endpoint unificado que incluye Personal + Usuario + Rol
        this.usuarios = await personalService.getGestionUsuarios()
      } catch (err) {
        this.error = err.message
        console.error('Error al cargar usuarios:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchUsuarioById(id) {
      this.loading = true
      this.error = null

      try {
        this.usuarioActual = await personalService.getById(id)
        return this.usuarioActual
      } catch (err) {
        this.error = err.message
        console.error('Error al cargar usuario:', err)
        return null
      } finally {
        this.loading = false
      }
    },

    async crearUsuario(personal) {
      this.loading = true
      this.error = null

      try {
        const resultado = await personalService.createWithAccount(personal)
        // Recargar la lista completa
        await this.fetchUsuarios()
        return resultado
      } catch (err) {
        this.error = err.message
        console.error('Error al crear usuario:', err)
        return null
      } finally {
        this.loading = false
      }
    },

    async actualizarUsuario(id, datosActualizar) {
      this.loading = true
      this.error = null

      try {
        await usuarioService.update(id, datosActualizar)

        // Actualizar en la lista local
        const index = this.usuarios.findIndex((u) => u.idUsuario === id)
        if (index !== -1) {
          this.usuarios[index] = {
            ...this.usuarios[index],
            ...datosActualizar,
          }
        }

        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al actualizar usuario:', err)
        return false
      } finally {
        this.loading = false
      }
    },

    async eliminarUsuario(id) {
      this.loading = true
      this.error = null

      try {
        await usuarioService.delete(id)
        this.usuarios = this.usuarios.filter((u) => u.idUsuario !== id)
        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al eliminar usuario:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async eliminarPersonal(idPersonal) {
      this.loading = true
      this.error = null

      try {
        await personalService.delete(idPersonal)
        this.usuarios = this.usuarios.filter((u) => u.idPersonal !== idPersonal)
        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al eliminar personal:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async toggleEstado(id, estado) {
      this.loading = true
      this.error = null

      try {
        // Usar endpoint específico de toggle estado
        await usuarioService.toggleEstado(id, estado)

        // Actualizar en la lista local
        const index = this.usuarios.findIndex((u) => u.idUsuario === id)
        if (index !== -1) {
          this.usuarios[index].estadoCuentaAcceso = estado
        }

        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al cambiar estado:', err)
        return false
      } finally {
        this.loading = false
      }
    },

    async actualizarRolUsuario(idUsuario, idRolSistema) {
      this.loading = true
      this.error = null

      try {
        // Llamar endpoint para actualizar rol
        await usuarioService.actualizarRol(idUsuario, idRolSistema)

        // Actualizar en la lista local
        const index = this.usuarios.findIndex((u) => u.idUsuario === idUsuario)
        if (index !== -1) {
          this.usuarios[index].idRolSistema = idRolSistema
          // El nombreRol se actualizará al refrescar la lista
        }

        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al actualizar rol:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async verificarDocumento(documento) {
      try {
        const resultado = await personalService.verificarDocumento(documento)
        return resultado
      } catch (err) {
        console.error('Error al verificar documento:', err)
        return { existe: false, error: err.message }
      }
    },
  },
})
