import { defineStore } from 'pinia'
import { personalService } from 'src/services/personalService'

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
        this.usuarios = await personalService.getAll()
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
        await personalService.update(id, datosActualizar)

        // Actualizar en la lista local
        const index = this.usuarios.findIndex((u) => u.idPersonal === id)
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
        await personalService.delete(id)
        this.usuarios = this.usuarios.filter((u) => u.idPersonal !== id)
        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al eliminar usuario:', err)
        return false
      } finally {
        this.loading = false
      }
    },

    async toggleEstado(id, estado) {
      this.loading = true
      this.error = null

      try {
        // Personal no tiene endpoint toggle-estado, usar update
        await personalService.update(id, { estado })

        // Actualizar en la lista local
        const index = this.usuarios.findIndex((u) => u.idPersonal === id)
        if (index !== -1) {
          this.usuarios[index].estado = estado
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
