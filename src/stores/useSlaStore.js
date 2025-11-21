import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useSlaStore = defineStore('sla', {
  state: () => ({
    alertas: [],
    loading: false,
  }),

  getters: {
    /**
     * Alertas preventivas: nivel WARNING o tipo VENCIMIENTO_PROXIMO
     */
    alertasPreventivas: (state) => {
      return state.alertas.filter(
        (alerta) => alerta.nivel === 'WARNING' || alerta.tipoAlerta === 'VENCIMIENTO_PROXIMO',
      )
    },

    /**
     * Alertas de incumplimiento: nivel CRITICAL o tipo SLA_EXCEDIDO
     */
    alertasIncumplimiento: (state) => {
      return state.alertas.filter(
        (alerta) => alerta.nivel === 'CRITICAL' || alerta.tipoAlerta === 'SLA_EXCEDIDO',
      )
    },

    /**
     * Total de alertas
     */
    totalAlertas: (state) => {
      return state.alertas.length
    },
  },

  actions: {
    /**
     * Obtiene todas las alertas desde el backend
     */
    async fetchAlertas() {
      this.loading = true
      try {
        const response = await api.get('/api/alerta')
        this.alertas = response.data
      } catch (error) {
        console.error('Error al obtener alertas:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Marca una alerta como leída
     */
    async marcarComoLeida(id) {
      try {
        await api.put('/api/alerta/' + id, { estado: 'LEIDA' })

        // Actualizar estado local sin recargar
        const alerta = this.alertas.find((a) => a.idAlerta === id)
        if (alerta) {
          alerta.estado = 'LEIDA'
        }
      } catch (error) {
        console.error('Error al marcar alerta como leída:', error)
        throw error
      }
    },

    /**
     * Elimina una alerta
     */
    async eliminarAlerta(id) {
      try {
        await api.delete('/api/alerta/' + id)

        // Remover del estado local sin recargar
        const index = this.alertas.findIndex((a) => a.idAlerta === id)
        if (index !== -1) {
          this.alertas.splice(index, 1)
        }
      } catch (error) {
        console.error('Error al eliminar alerta:', error)
        throw error
      }
    },
  },
})
