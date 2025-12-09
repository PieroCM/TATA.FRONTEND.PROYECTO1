import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const usePrediccionStore = defineStore('prediccion', {
  state: () => ({
    predicciones: [],
    modeloActual: null,
    loading: false,
    reentrenando: false,
    error: null,
    prediccionesCargadas: false
  }),

  getters: {
    // Resumen estadístico de predicciones
    resumenPredicciones: (state) => {
      if (!state.predicciones || state.predicciones.length === 0) {
        return {
          totalAnalizadas: 0,
          criticas: 0,
          altas: 0,
          medias: 0,
          bajas: 0,
          promedioRiesgo: 0
        }
      }

      const total = state.predicciones.length
      const criticas = state.predicciones.filter(p => p.probNoCumple >= 0.80).length
      const altas = state.predicciones.filter(p => p.probNoCumple >= 0.60 && p.probNoCumple < 0.80).length
      const medias = state.predicciones.filter(p => p.probNoCumple >= 0.40 && p.probNoCumple < 0.60).length
      const bajas = state.predicciones.filter(p => p.probNoCumple < 0.40).length
      const promedioRiesgo = state.predicciones.reduce((sum, p) => sum + (p.probNoCumple * 100), 0) / total

      return {
        totalAnalizadas: total,
        criticas,
        altas,
        medias,
        bajas,
        promedioRiesgo: promedioRiesgo || 0
      }
    },

    // Predicciones por nivel de riesgo
    prediccionesPorRiesgo: (state) => {
      return {
        criticas: state.predicciones.filter(p => p.probNoCumple >= 0.80),
        altas: state.predicciones.filter(p => p.probNoCumple >= 0.60 && p.probNoCumple < 0.80),
        medias: state.predicciones.filter(p => p.probNoCumple >= 0.40 && p.probNoCumple < 0.60),
        bajas: state.predicciones.filter(p => p.probNoCumple < 0.40)
      }
    },

    // Predicciones agrupadas por rol
    prediccionesPorRol: (state) => {
      const grupos = {}
      state.predicciones.forEach(p => {
        if (!grupos[p.rolRegistro]) {
          grupos[p.rolRegistro] = []
        }
        grupos[p.rolRegistro].push(p)
      })
      return grupos
    },

    // Predicciones agrupadas por tipo de SLA
    prediccionesPorSLA: (state) => {
      const grupos = {}
      state.predicciones.forEach(p => {
        if (!grupos[p.codigoSla]) {
          grupos[p.codigoSla] = []
        }
        grupos[p.codigoSla].push(p)
      })
      return grupos
    },

  },

  actions: {
    /**
     * Obtener predicciones actuales del backend
     */
    async obtenerPredicciones() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/api/SlaML/PrediccionesActuales')

        if (response.data.success) {
          // Mapear los datos del backend al formato del frontend
          this.predicciones = response.data.data.map(p => ({
            idSolicitud: p.idSolicitud,
            rolRegistro: p.rolRegistro,
            codigoSla: p.codigoSla,
            diasTranscurridos: p.diasTranscurridos,
            diasUmbral: p.diasUmbral,
            probNoCumple: p.probNoCumple,
            prediccion: p.prediccion,
            modeloVersion: p.modeloVersion,
            tipoSolicitud: p.tipoSolicitud,
            estadoSolicitud: p.estadoSolicitud,
            // Campos calculados
            probCumple: 1 - p.probNoCumple,
            riesgoNivel: this.calcularNivelRiesgo(p.probNoCumple),
            riesgoColor: this.obtenerColorRiesgo(p.probNoCumple),
            diasRestantes: p.diasUmbral - p.diasTranscurridos,
            porcentajeTiempo: ((p.diasTranscurridos / p.diasUmbral) * 100).toFixed(1)
          }))

          // Guardar versión del modelo
          if (this.predicciones.length > 0) {
            this.modeloActual = this.predicciones[0].modeloVersion
          }

          console.log('✅ Predicciones cargadas:', this.predicciones.length)
          return this.predicciones
        } else {
          throw new Error(response.data.mensaje || 'Error al obtener predicciones')
        }
      } catch (error) {
        console.error('❌ Error al obtener predicciones:', error)
        this.error = error.response?.data?.mensaje || error.message || 'Error desconocido'

        // Si no hay predicciones, usar datos de ejemplo
        if (error.response?.status === 404) {
          this.predicciones = []
          console.warn('⚠️ No hay solicitudes activas para predecir')
        }

        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Entrenar el modelo ML
     */
    async entrenarModelo(fechaDesde = null, fechaHasta = null) {
      this.reentrenando = true
      this.error = null

      try {
        const params = {}
        if (fechaDesde) params.desde = fechaDesde
        if (fechaHasta) params.hasta = fechaHasta

        const response = await api.post('/api/SlaML/Entrenar', null, { params })

        if (response.data.success) {
          const resultado = response.data.data

          console.log('✅ Modelo entrenado exitosamente:', resultado)

          // Actualizar predicciones con el nuevo modelo
          await this.obtenerPredicciones()

          return resultado
        } else {
          throw new Error(response.data.mensaje || 'Error al entrenar el modelo')
        }
      } catch (error) {
        console.error('❌ Error al entrenar modelo:', error)
        this.error = error.response?.data?.mensaje || error.message || 'Error desconocido'
        throw error
      } finally {
        this.reentrenando = false
      }
    },

    /**
     * Calcular nivel de riesgo basado en probabilidad
     */
    calcularNivelRiesgo(probabilidad) {
      if (probabilidad >= 0.80) return 'CRÍTICO'
      if (probabilidad >= 0.60) return 'ALTO'
      if (probabilidad >= 0.40) return 'MEDIO'
      return 'BAJO'
    },

    /**
     * Obtener color según nivel de riesgo
     */
    obtenerColorRiesgo(probabilidad) {
      if (probabilidad >= 0.80) return 'negative'
      if (probabilidad >= 0.60) return 'warning'
      if (probabilidad >= 0.40) return 'orange'
      return 'positive'
    },

    /**
     * Limpiar store (se llama al salir de la sección)
     */
    limpiar() {
      this.predicciones = []
      this.error = null
      this.prediccionesCargadas = false
    },

    /**
     * Inicializar store (cargar todos los datos)
     * Solo carga si no se han cargado antes en esta sesión
     */
    async inicializar() {
      if (!this.prediccionesCargadas) {
        await this.obtenerPredicciones()
        this.prediccionesCargadas = true
      }
    }
  }
})
