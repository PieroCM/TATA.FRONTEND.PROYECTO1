import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useSlaStore = defineStore('sla', {
  state: () => ({
    alertas: [],
    solicitudes: [],
    roles: [],
    configSla: [],
    lastFetchSolicitudes: 0,
    lastFetchRoles: 0,
    lastFetchConfigSla: 0,
    loading: false,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutos de caché
    apiPrefix: null, // Cachear si se usa /api o no
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
     * Determina el endpoint correcto
     */
    async _getEndpoint(resource) {
      if (this.apiPrefix === '/api') return `/api/${resource}`
      if (this.apiPrefix === '') return `/${resource}`

      // Si no sabemos, probamos
      try {
        await api.get(`/api/${resource}`, { params: { _limit: 1 } }) // Intento ligero
        this.apiPrefix = '/api'
        return `/api/${resource}`
      } catch (e) {
        this.apiPrefix = ''
        return `/${resource}`
      }
    },

    /**
     * Helper para hacer peticiones con fallback
     */
    async _fetchWithFallback(resource) {
      if (this.apiPrefix !== null) {
        const url = this.apiPrefix ? `${this.apiPrefix}/${resource}` : `/${resource}`
        return await api.get(url)
      }

      try {
        const res = await api.get(`/api/${resource}`)
        this.apiPrefix = '/api'
        return res
      } catch (e) {
        const res = await api.get(`/${resource}`)
        this.apiPrefix = ''
        return res
      }
    },

    /**
     * Obtiene todas las solicitudes con caché
     */
    async fetchSolicitudes(force = false) {
      const now = Date.now()
      if (
        !force &&
        this.solicitudes.length > 0 &&
        now - this.lastFetchSolicitudes < this.CACHE_DURATION
      ) {
        return this.solicitudes
      }

      try {
        const response = await this._fetchWithFallback('Solicitud')

        // Usar Object.freeze para mejorar rendimiento de Vue con grandes volúmenes de datos
        this.solicitudes = Object.freeze(response.data || [])
        this.lastFetchSolicitudes = now
        return this.solicitudes
      } catch (error) {
        console.error('Error al obtener solicitudes:', error)
        if (this.solicitudes.length > 0) return this.solicitudes
        throw error
      }
    },

    /**
     * Obtiene roles con caché
     */
    async fetchRoles(force = false) {
      const now = Date.now()
      if (!force && this.roles.length > 0 && now - this.lastFetchRoles < this.CACHE_DURATION) {
        return this.roles
      }

      try {
        const response = await this._fetchWithFallback('RolRegistro')

        this.roles = Object.freeze(response.data || [])
        this.lastFetchRoles = now
        return this.roles
      } catch (error) {
        console.error('Error al obtener roles:', error)
        if (this.roles.length > 0) return this.roles
        throw error
      }
    },

    /**
     * Obtiene configuración SLA con caché
     */
    async fetchConfigSla(force = false) {
      const now = Date.now()
      if (
        !force &&
        this.configSla.length > 0 &&
        now - this.lastFetchConfigSla < this.CACHE_DURATION
      ) {
        return this.configSla
      }

      try {
        const response = await this._fetchWithFallback('ConfigSla')

        this.configSla = Object.freeze(response.data || [])
        this.lastFetchConfigSla = now
        return this.configSla
      } catch (error) {
        console.error('Error al obtener config SLA:', error)
        if (this.configSla.length > 0) return this.configSla
        throw error
      }
    },

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
