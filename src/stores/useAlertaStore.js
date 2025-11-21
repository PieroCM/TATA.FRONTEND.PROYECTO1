import { defineStore } from 'pinia'
import { api } from 'boot/axios'

/**
 * Store para gestión de alertas SLA
 * Consume el endpoint GET /api/alerta que devuelve estructura anidada completa
 */
export const useAlertaStore = defineStore('alerta', {
  state: () => ({
    alertas: [],
    loading: false,
  }),

  getters: {
    /**
     * Total de alertas activas
     */
    totalAlertas: (state) => state.alertas.length,

    /**
     * Alertas críticas (nivel CRITICAL)
     */
    alertasCriticas: (state) => {
      return state.alertas.filter((a) => a.nivel === 'CRITICAL')
    },

    /**
     * Alertas de advertencia (nivel WARNING)
     */
    alertasAdvertencia: (state) => {
      return state.alertas.filter((a) => a.nivel === 'WARNING')
    },
  },

  actions: {
    /**
     * Obtiene todas las alertas desde el backend
     * La respuesta ya incluye la estructura anidada completa:
     * - solicitud.idSolicitud
     * - solicitud.fechaSolicitud
     * - solicitud.rolRegistro.nombreRol
     * - solicitud.configSla.codigoSla
     * - solicitud.configSla.diasUmbral
     */
    async fetchAlertas() {
      this.loading = true
      try {
        const response = await api.get('/api/alerta')
        // Asignar directamente la data anidada sin transformación
        this.alertas = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener alertas:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Elimina una alerta por ID
     * Realiza petición DELETE al backend y actualiza estado local
     */
    async eliminarAlerta(idAlerta) {
      try {
        console.log('Eliminando alerta con ID:', idAlerta)

        // Realizar petición DELETE al backend
        const response = await api.delete(`/api/alerta/${idAlerta}`)
        console.log('Respuesta del servidor:', response)

        // Actualizar estado local sin recargar (Optimistic UI)
        const index = this.alertas.findIndex((a) => a.idAlerta === idAlerta)
        if (index !== -1) {
          this.alertas.splice(index, 1)
          console.log(`Alerta ${idAlerta} eliminada del estado local`)
        }

        return true
      } catch (error) {
        console.error('Error al eliminar alerta:', error)
        console.error('Detalles del error:', error.response?.data)
        throw error
      }
    },

    /**
     * Marca una alerta como leída
     */
    async marcarComoLeida(idAlerta) {
      try {
        await api.put(`/api/alerta/${idAlerta}`, { estado: 'LEIDA' })

        // Actualizar estado local
        const alerta = this.alertas.find((a) => a.idAlerta === idAlerta)
        if (alerta) {
          alerta.estado = 'LEIDA'
        }

        return true
      } catch (error) {
        console.error('Error al marcar alerta como leída:', error)
        throw error
      }
    },
  },
})
