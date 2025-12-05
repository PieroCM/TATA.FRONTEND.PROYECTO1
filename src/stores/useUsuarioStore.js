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

    async crearUsuario(data) {
      this.loading = true
      this.error = null

      try {
        let resultado

        if (data.crearCuentaUsuario) {
          // 🔑 FLUJO 2: Crear personal + cuenta usuario
          // POST /api/personal/with-account
          resultado = await usuarioService.crearPersonalConCuenta(data)
        } else {
          // 🔵 FLUJO 1: Crear solo personal
          // POST /api/personal
          resultado = await usuarioService.crearPersonalSimple(data)
        }

        // Recargar la lista completa
        await this.fetchUsuarios()

        return resultado
      } catch (err) {
        this.error = err.message
        console.error('Error al crear usuario/personal:', err)
        return null
      } finally {
        this.loading = false
      }
    },

    async actualizarUsuario(id, datosActualizar) {
      this.loading = true
      this.error = null

      try {
        // PUT /api/personal/{id}
        await usuarioService.actualizarPersonal(id, datosActualizar)

        // Recargar la lista completa
        await this.fetchUsuarios()

        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al actualizar personal:', err)
        return false
      } finally {
        this.loading = false
      }
    },

    async eliminarUsuario(id) {
      this.loading = true
      this.error = null

      try {
        // DELETE /api/usuario/{id}
        await usuarioService.eliminarUsuario(id)
        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al eliminar usuario:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async eliminarPersonal(id) {
      this.loading = true
      this.error = null

      try {
        // DELETE /api/personal/{id}
        await usuarioService.eliminarPersonal(id)
        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al eliminar personal:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async verificarDocumento(documento) {
      this.loading = true
      this.error = null

      try {
        // GET /api/personal/verificar-documento/{documento}
        const resultado = await usuarioService.verificarDocumento(documento)
        return resultado
      } catch (err) {
        this.error = err.message
        console.error('Error al verificar documento:', err)
        return { existe: false }
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
