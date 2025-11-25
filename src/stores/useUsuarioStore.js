import { defineStore } from 'pinia'
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
        this.usuarios = await usuarioService.getAll()
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
        this.usuarioActual = await usuarioService.getById(id)
        return this.usuarioActual
      } catch (err) {
        this.error = err.message
        console.error('Error al cargar usuario:', err)
        return null
      } finally {
        this.loading = false
      }
    },

    async crearUsuario(usuario) {
      this.loading = true
      this.error = null

      try {
        const nuevoUsuario = await usuarioService.create(usuario)
        this.usuarios.push(nuevoUsuario)
        return nuevoUsuario
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
        return false
      } finally {
        this.loading = false
      }
    },

    async toggleEstado(id, estado) {
      this.loading = true
      this.error = null

      try {
        await usuarioService.toggleEstado(id, estado)

        // Actualizar en la lista local
        const index = this.usuarios.findIndex((u) => u.idUsuario === id)
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
  },
})
