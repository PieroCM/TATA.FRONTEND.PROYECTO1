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
     * Obtiene todas las alertas desde el backend para el dashboard
     * Endpoint: GET /api/alertas/dashboard
     * La respuesta incluye la estructura anidada completa con cálculos del backend:
     * - solicitud (con todos sus datos relacionados)
     * - porcentajeProgreso (calculado por el backend)
     * - diasRestantes (calculado por el backend)
     * - nivel (WARNING/CRITICAL)
     * - estado (NUEVA/LEIDA)
     */
    async fetchAlertas() {
      this.loading = true
      try {
        // Consumir el endpoint del dashboard que devuelve datos enriquecidos
        const response = await api.get('/api/alertas/dashboard')

        // Validar que la respuesta tenga datos
        if (response.data && Array.isArray(response.data)) {
          // Asignar directamente la data del backend
          this.alertas = response.data
          // console.log(`✅ ${this.alertas.length} alertas cargadas desde el backend`)
        } else {
          // console.warn('⚠️ La respuesta del backend no contiene un array de alertas')
          this.alertas = []
        }

        return response.data
      } catch (error) {
        // console.error('❌ Error al obtener alertas desde /api/alertas/dashboard:', error)

        // Si el backend no está disponible, usar datos de desarrollo
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
          // console.warn('⚠️ Usando datos de prueba (backend no disponible)')
          this.alertas = this.generarDatosPrueba()
          return this.alertas
        }

        // Limpiar el estado en caso de otro error
        this.alertas = []
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Genera datos de prueba para desarrollo
     */
    generarDatosPrueba() {
      const hoy = new Date()
      const roles = [
        'Desarrollador .NET',
        'Analista',
        'QA Tester',
        'Project Manager',
        'DevOps Engineer',
      ]
      const slas = [
        { codigo: 'SLA1', nombre: 'SLA Crítico', umbral: 3 },
        { codigo: 'SLA2', nombre: 'SLA Alto', umbral: 7 },
        { codigo: 'SLA3', nombre: 'SLA Medio', umbral: 15 },
      ]
      const estados = ['NUEVA', 'LEIDA', 'PENDIENTE']

      const alertas = []

      for (let i = 1; i <= 50; i++) {
        const sla = slas[Math.floor(Math.random() * slas.length)]
        const diasTranscurridos = Math.floor(Math.random() * 20)
        const diasRestantes = sla.umbral - diasTranscurridos
        const porcentajeProgreso = Math.min(100, (diasTranscurridos / sla.umbral) * 100)
        const fechaSolicitud = new Date(hoy.getTime() - diasTranscurridos * 24 * 60 * 60 * 1000)

        alertas.push({
          idAlerta: i,
          nivel: diasRestantes < 0 ? 'CRITICAL' : diasRestantes <= 2 ? 'WARNING' : 'INFO',
          estado: estados[Math.floor(Math.random() * estados.length)],
          mensaje: `Solicitud ${1000 + i} está próxima a vencer`,
          fechaRegistro: fechaSolicitud.toISOString(),
          diasRestantes: diasRestantes,
          porcentajeProgreso: Math.round(porcentajeProgreso),
          solicitud: {
            idSolicitud: 1000 + i,
            fechaSolicitud: fechaSolicitud.toISOString(),
            descripcion: `Solicitud de desarrollo #${1000 + i}`,
            estado: 'ACTIVA',
            configSla: {
              idConfigSla: sla.codigo === 'SLA1' ? 1 : sla.codigo === 'SLA2' ? 2 : 3,
              nombreSla: sla.nombre,
              codigoSla: sla.codigo,
              diasUmbral: sla.umbral,
              descripcion: `Configuración ${sla.nombre}`,
            },
            rolRegistro: {
              idRol: Math.floor(Math.random() * roles.length) + 1,
              nombreRol: roles[Math.floor(Math.random() * roles.length)],
              descripcion: 'Rol asignado',
            },
          },
        })
      }

      return alertas
    },

    /**
     * Elimina una alerta por ID
     * Realiza petición DELETE al backend y actualiza estado local
     */
    async eliminarAlerta(idAlerta) {
      // console.log('Eliminando alerta con ID:', idAlerta)

      // Realizar petición DELETE al backend
      await api.delete(`/api/alerta/${idAlerta}`)
      // console.log('Respuesta del servidor:', _response)

      // Actualizar estado local sin recargar (Optimistic UI)
      const index = this.alertas.findIndex((a) => a.idAlerta === idAlerta)
      if (index !== -1) {
        this.alertas.splice(index, 1)
        // console.log(`Alerta ${idAlerta} eliminada del estado local`)
      }

      return true
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
