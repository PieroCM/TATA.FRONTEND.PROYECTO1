import { defineStore } from 'pinia'
import { api } from 'boot/axios'

/**
 * Store para el módulo de predicción de SLA
 * Se conecta al microservicio de predicción (Docker/Python)
 */
export const usePrediccionStore = defineStore('prediccion', {
  state: () => ({
    predicciones: [],
    prediccionesCriticas: [],
    resumen: null,
    tendencias: [],
    paginacion: {
      pagina: 1,
      tamanoPagina: 50,
      totalRegistros: 0,
      totalPaginas: 0
    },
    loading: false,
    loadingCriticas: false,
    loadingResumen: false,
    error: null,
    // Filtros dinámicos desde la BD
    filtrosDisponibles: {
      codigosSla: [],
      roles: [],
      bloquesTech: []
    },
    loadingFiltros: false,
    // Caché local para evitar llamadas repetidas
    lastFetch: {
      criticas: 0,
      resumen: 0,
      tendencias: 0,
      filtros: 0
    },
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
    // URL del microservicio de predicción
    prediccionApiUrl: null
  }),

  getters: {
    /**
     * Predicciones filtradas por nivel de riesgo
     */
    porNivelRiesgo: (state) => (nivel) => {
      return state.predicciones.filter(p => p.nivelRiesgo === nivel)
    },

    /**
     * Conteo por nivel de riesgo
     */
    conteoPorRiesgo: (state) => {
      return {
        critico: state.predicciones.filter(p => p.nivelRiesgo === 'CRITICO').length,
        alto: state.predicciones.filter(p => p.nivelRiesgo === 'ALTO').length,
        medio: state.predicciones.filter(p => p.nivelRiesgo === 'MEDIO').length,
        bajo: state.predicciones.filter(p => p.nivelRiesgo === 'BAJO').length
      }
    },

    /**
     * Promedio de riesgo calculado localmente
     */
    promedioRiesgo: (state) => {
      if (!state.predicciones.length) return 0
      const suma = state.predicciones.reduce((acc, p) => acc + p.probabilidadIncumplimiento, 0)
      return (suma / state.predicciones.length * 100).toFixed(1)
    },

    /**
     * Hay más páginas disponibles?
     */
    hayMasPaginas: (state) => {
      return state.paginacion.pagina < state.paginacion.totalPaginas
    },

    /**
     * Total de predicciones críticas y altas
     */
    totalAlertasPrediccion: (state) => {
      return state.prediccionesCriticas.filter(
        p => p.nivelRiesgo === 'CRITICO' || p.nivelRiesgo === 'ALTO'
      ).length
    }
  },

  actions: {
    /**
     * Determina la URL del servicio de predicción
     * Intenta primero el proxy de la API .NET, luego directo al microservicio
     */
    async _getPrediccionUrl() {
      if (this.prediccionApiUrl) return this.prediccionApiUrl

      // Primero intentar directo al microservicio Docker (más confiable durante desarrollo)
      try {
        const directUrl = import.meta.env.VITE_PREDICCION_API_URL || 'http://localhost:8000'
        const response = await fetch(`${directUrl}/health`)
        if (response.ok) {
          this.prediccionApiUrl = directUrl
          return this.prediccionApiUrl
        }
      } catch (e) {
        console.log('Microservicio directo no disponible, intentando proxy...')
      }

      // Si falla, intentar a través de la API .NET (proxy)
      try {
        await api.get('/api/prediccion/health')
        this.prediccionApiUrl = '/api/prediccion'
        return this.prediccionApiUrl
      } catch (e2) {
        console.warn('Servicio de predicción no disponible')
        this.prediccionApiUrl = 'http://localhost:8000' // fallback al microservicio directo
        return this.prediccionApiUrl
      }
    },

    /**
     * Obtiene predicciones paginadas (para tabla completa)
     * NO carga todo de una vez - optimizado para grandes volúmenes
     * Por defecto incluye todas las solicitudes (activas e históricas)
     */
    async fetchPrediccionesPaginadas(pagina = 1, tamanoPagina = 50, incluirHistoricas = true, codigoSla = null) {
      this.loading = true
      this.error = null

      try {
        const baseUrl = await this._getPrediccionUrl()
        let url = `${baseUrl}/predecir/paginado?pagina=${pagina}&tamano=${tamanoPagina}&incluir_historicas=${incluirHistoricas}`

        // Agregar filtro de SLA si está presente
        if (codigoSla) {
          url += `&codigo_sla=${codigoSla}`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        const { data, pagina: pag, tamano_pagina: tam, total_registros, total_paginas } = responseData

        // Mapear campos de snake_case a camelCase
        this.predicciones = (data || []).map(p => this._mapearPrediccion(p))
        this.paginacion = {
          pagina: pag || 1,
          tamanoPagina: tam || tamanoPagina,
          totalRegistros: total_registros || 0,
          totalPaginas: total_paginas || 0
        }

        return this.predicciones
      } catch (error) {
        console.error('Error al obtener predicciones:', error)
        this.error = error.message
        return []
      } finally {
        this.loading = false
      }
    },

    /**
     * Carga siguiente página (para scroll infinito o botón "cargar más")
     */
    async cargarMasPaginas() {
      if (!this.hayMasPaginas || this.loading) return

      const siguientePagina = this.paginacion.pagina + 1

      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/predecir/paginado?pagina=${siguientePagina}&tamano=${this.paginacion.tamanoPagina}&incluir_historicas=true`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        const nuevasPredicciones = (responseData.data || []).map(p => this._mapearPrediccion(p))

        // Agregar a las existentes, no reemplazar
        this.predicciones = [...this.predicciones, ...nuevasPredicciones]
        this.paginacion.pagina = siguientePagina

        return nuevasPredicciones
      } catch (error) {
        console.error('Error al cargar más predicciones:', error)
        return []
      }
    },

    /**
     * Solo predicciones críticas - Para dashboard (muy rápido)
     * Usa caché local para evitar llamadas repetidas
     */
    async fetchPrediccionesCriticas(limite = 20, force = false) {
      const now = Date.now()

      // Usar caché si no ha expirado
      if (!force &&
          this.prediccionesCriticas.length > 0 &&
          now - this.lastFetch.criticas < this.CACHE_DURATION) {
        return this.prediccionesCriticas
      }

      this.loadingCriticas = true

      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/predecir/criticas?limite=${limite}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        this.prediccionesCriticas = (responseData || []).map(p => this._mapearPrediccion(p))
        this.lastFetch.criticas = now

        return this.prediccionesCriticas
      } catch (error) {
        console.error('Error al obtener predicciones críticas:', error)
        // Retornar caché si existe aunque haya error
        if (this.prediccionesCriticas.length > 0) {
          return this.prediccionesCriticas
        }
        return []
      } finally {
        this.loadingCriticas = false
      }
    },

    /**
     * Resumen para KPIs - Muy ligero, ideal para header/sidebar
     */
    async fetchResumen(force = false) {
      const now = Date.now()

      if (!force &&
          this.resumen &&
          now - this.lastFetch.resumen < this.CACHE_DURATION) {
        return this.resumen
      }

      this.loadingResumen = true

      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/resumen`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()

        // Mapear campos
        this.resumen = {
          totalAnalizadas: responseData.total_analizadas || 0,
          criticas: responseData.criticas || 0,
          altas: responseData.altas || 0,
          medias: responseData.medias || 0,
          bajas: responseData.bajas || 0,
          promedioRiesgo: responseData.promedio_riesgo || 0
        }
        this.lastFetch.resumen = now

        return this.resumen
      } catch (error) {
        console.error('Error al obtener resumen:', error)
        return this.resumen || { totalAnalizadas: 0, criticas: 0, altas: 0, medias: 0, bajas: 0, promedioRiesgo: 0 }
      } finally {
        this.loadingResumen = false
      }
    },

    /**
     * Obtiene tendencias históricas para gráficos
     */
    async fetchTendencias(meses = 6, force = false) {
      const now = Date.now()

      if (!force &&
          this.tendencias.length > 0 &&
          now - this.lastFetch.tendencias < this.CACHE_DURATION) {
        return this.tendencias
      }

      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/tendencias?meses=${meses}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        this.tendencias = responseData || []
        this.lastFetch.tendencias = now

        return this.tendencias
      } catch (error) {
        console.error('Error al obtener tendencias:', error)
        return []
      }
    },

    /**
     * Predicción individual (para detalle de una solicitud)
     */
    async predecirSolicitud(solicitud) {
      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/predecir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_solicitud: solicitud.idSolicitud,
            dias_transcurridos: solicitud.diasTranscurridos,
            dias_umbral: solicitud.diasUmbral,
            id_rol: solicitud.idRol
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        return this._mapearPrediccion(responseData)
      } catch (error) {
        console.error('Error al predecir solicitud:', error)
        throw error
      }
    },

    /**
     * Forzar reentrenamiento del modelo (admin)
     */
    async reentrenarModelo() {
      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/modelo/reentrenar`, {
          method: 'POST'
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()

        // Limpiar caché para obtener nuevas predicciones
        this.lastFetch = { criticas: 0, resumen: 0, tendencias: 0 }

        return responseData
      } catch (error) {
        console.error('Error al reentrenar modelo:', error)
        throw error
      }
    },

    /**
     * Verifica si el servicio de predicción está disponible
     */
    async verificarServicio() {
      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/health`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        return {
          disponible: true,
          ...responseData
        }
      } catch (error) {
        return {
          disponible: false,
          error: error.message
        }
      }
    },

    /**
     * Verifica el estado de salud del servicio (alias para componentes)
     */
    async checkHealth() {
      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/health`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        return {
          status: responseData.status,
          modelLoaded: responseData.model_loaded,
          timestamp: responseData.timestamp,
          version: responseData.version
        }
      } catch (error) {
        return {
          status: 'error',
          modelLoaded: false,
          error: error.message
        }
      }
    },

    /**
     * Obtiene los filtros disponibles desde la BD
     * Códigos SLA, Roles y Bloques Tech
     */
    async fetchFiltrosDisponibles(force = false) {
      const now = Date.now()

      // Usar caché si no ha expirado
      if (!force &&
          this.filtrosDisponibles.codigosSla.length > 0 &&
          now - this.lastFetch.filtros < this.CACHE_DURATION) {
        return this.filtrosDisponibles
      }

      this.loadingFiltros = true

      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/filtros`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()

        this.filtrosDisponibles = {
          codigosSla: (responseData.codigos_sla || []).map(sla => ({
            codigo: sla.codigo_sla,
            descripcion: sla.descripcion,
            diasUmbral: sla.dias_umbral,
            tipoSolicitud: sla.tipo_solicitud
          })),
          roles: (responseData.roles || []).map(rol => ({
            id: rol.id_rol_registro,
            nombre: rol.nombre_rol,
            bloqueTech: rol.bloque_tech
          })),
          bloquesTech: responseData.bloques_tech || []
        }
        this.lastFetch.filtros = now

        return this.filtrosDisponibles
      } catch (error) {
        console.error('Error al obtener filtros disponibles:', error)
        // Retornar valores por defecto si hay error
        return this.filtrosDisponibles
      } finally {
        this.loadingFiltros = false
      }
    },

    /**
     * Mapea campos de snake_case (Python) a camelCase (JS)
     */
    _mapearPrediccion(p) {
      return {
        idSolicitud: p.id_solicitud,
        codigoSla: p.codigo_sla,
        nombreRol: p.nombre_rol,
        probabilidadIncumplimiento: p.probabilidad_incumplimiento,
        nivelRiesgo: p.nivel_riesgo,
        diasRestantes: p.dias_restantes,
        fechaPrediccion: p.fecha_prediccion,
        factoresRiesgo: p.factores_riesgo || []
      }
    },

    /**
     * Obtiene la importancia de las variables del modelo
     * Para mostrar qué factores tienen más peso en las predicciones
     */
    async fetchImportanciaVariables() {
      try {
        const baseUrl = await this._getPrediccionUrl()
        const response = await fetch(`${baseUrl}/modelo/importancia`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        return {
          features: responseData.features || [],
          interpretacion: responseData.interpretacion || {},
          recomendacion: responseData.recomendacion || ''
        }
      } catch (error) {
        console.error('Error al obtener importancia de variables:', error)
        return {
          features: [],
          interpretacion: {},
          recomendacion: 'No se pudo obtener la importancia de variables'
        }
      }
    },

    /**
     * Limpia el estado (útil al cerrar sesión)
     */
    limpiarEstado() {
      this.predicciones = []
      this.prediccionesCriticas = []
      this.resumen = null
      this.tendencias = []
      this.paginacion = {
        pagina: 1,
        tamanoPagina: 50,
        totalRegistros: 0,
        totalPaginas: 0
      }
      this.lastFetch = { criticas: 0, resumen: 0, tendencias: 0, filtros: 0 }
      this.error = null
    }
  }
})
