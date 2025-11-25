<template>
  <q-page class="dashboard-page">
    <!-- Loading Fullscreen -->
    <div v-if="initialLoading" class="fullscreen-loading">
      <div class="loading-content">
        <q-spinner-gears size="80px" color="primary" />
        <div class="text-h6 q-mt-lg text-primary">Cargando análisis...</div>
      </div>
    </div>

    <!-- Contenido -->
    <div v-else>
      <!-- Header -->
      <div class="dashboard-header q-mb-lg">
        <div class="row items-center">
          <q-icon name="insights" size="40px" color="primary" class="q-mr-md" />
          <div>
            <div class="text-h5 text-weight-medium">Visualización Analítica Interactiva SLA</div>
            <div class="text-grey-7">Análisis detallado y comparativas por período</div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <q-card flat bordered class="filters-card q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="filter_list" class="q-mr-sm" />
            Filtros
          </div>

          <!-- Fila 1: Rango de Fechas -->
          <div class="row q-col-gutter-md q-mb-md">
            <!-- Mes Inicio -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.mesInicio"
                :options="mesesDisponibles"
                label="Mes Inicio"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Mes Fin -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.mesFin"
                :options="mesesDisponibles"
                label="Mes Fin"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Año Inicio -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.anioInicio"
                :options="aniosDisponibles"
                label="Año Inicio"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Año Fin -->
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filtros.anioFin"
                :options="aniosDisponibles"
                label="Año Fin"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" color="primary" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Fila 2: Filtros de Datos -->
          <div class="row q-col-gutter-md q-mb-md">
            <!-- Tipos SLA -->
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="filtros.tiposSla"
                :options="tiposSlaDisponibles"
                label="Tipos SLA"
                outlined
                dense
                multiple
                use-chips
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Roles -->
            <div class="col-12 col-sm-6 col-md-4">
              <q-select
                v-model="filtros.roles"
                :options="rolesDisponibles"
                label="Roles/Áreas"
                outlined
                dense
                multiple
                use-chips
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="people" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Tipo de Gráfico -->
            <div class="col-12 col-sm-6 col-md-2">
              <q-select
                v-model="tipoGrafico"
                :options="tiposGraficoDisponibles"
                label="Tipo Gráfico"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="show_chart" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Vista de Gráficos (Toggle Switch) -->
            <div class="col-12 col-sm-6 col-md-2">
              <q-field outlined dense stack-label label="Vista de Gráficos">
                <template v-slot:prepend>
                  <q-icon name="view_module" color="primary" />
                </template>
                <template v-slot:control>
                  <div class="self-center full-width no-outline q-px-sm">
                    <q-toggle
                      v-model="vistaUnificada"
                      color="primary"
                      size="sm"
                      :label="vistaUnificada ? 'Unificado' : 'Separado'"
                      dense
                    />
                  </div>
                </template>
              </q-field>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-12 col-sm-4 col-md-auto">
              <q-btn
                color="primary"
                label="Aplicar Filtros"
                icon="search"
                @click="aplicarFiltros"
                :loading="loading"
                class="full-width"
              />
            </div>
            <div class="col-12 col-sm-4 col-md-auto">
              <q-btn
                outline
                color="grey-7"
                label="Restablecer"
                icon="refresh"
                @click="restablecerFiltros"
                class="full-width"
              />
            </div>
            <div class="col-12 col-sm-4 col-md-auto">
              <q-btn
                outline
                color="positive"
                label="Exportar PDF"
                icon="picture_as_pdf"
                @click="exportarPDF"
                :disable="graficos.length === 0"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Gráficos Interactivos -->
      <div v-if="graficos.length > 0">
        <!-- Vista Unificada: Un solo gráfico con todos los SLAs -->
        <q-card v-if="vistaUnificada" flat bordered class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 text-weight-medium q-mb-md">
              <q-icon name="bar_chart" class="q-mr-sm" />
              Comparación Unificada de Tipos SLA
            </div>
            <q-separator class="q-mb-md" />

            <div class="row">
              <!-- Gráfico Unificado - Ancho completo sin leyenda -->
              <div class="col-12">
                <div class="chart-wrapper">
                  <canvas id="chartUnificadoCanvas" ref="chartUnificadoCanvas"></canvas>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Vista Separada: Un gráfico por cada tipo SLA -->
        <template v-else>
          <q-card
            v-for="(grafico, index) in graficos"
            :key="index"
            flat
            bordered
            :class="{ 'q-mb-lg': index < graficos.length - 1 }"
          >
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="bar_chart" class="q-mr-sm" />
                {{ grafico.titulo }}
              </div>
              <q-separator class="q-mb-md" />

              <div v-if="grafico.datos.labels && grafico.datos.labels.length > 0">
                <div class="row">
                  <!-- Gráfico -->
                  <div class="col-12 col-md-9">
                    <div class="chart-wrapper">
                      <canvas :id="`chartCanvas_${grafico.codigoSla}`" :ref="(el) => setChartRef(el, index)"></canvas>
                    </div>
                  </div>

                  <!-- Leyenda de colores a la derecha -->
                  <div class="col-12 col-md-3">
                    <div class="color-legend">
                      <div class="text-subtitle2 text-weight-medium q-mb-md">
                        Leyenda de Estado SLA:
                      </div>
                      <div class="legend-items">
                        <div class="legend-item q-mb-sm">
                          <q-chip color="positive" text-color="white" dense>
                            <q-icon name="check_circle" left />
                            Excelente
                          </q-chip>
                          <div class="text-caption text-grey-7 q-mt-xs">≥ 90%</div>
                        </div>
                        <div class="legend-item q-mb-sm">
                          <q-chip color="orange" text-color="white" dense>
                            <q-icon name="warning" left />
                            Aceptable
                          </q-chip>
                          <div class="text-caption text-grey-7 q-mt-xs">≥ 70%</div>
                        </div>
                        <div class="legend-item">
                          <q-chip color="negative" text-color="white" dense>
                            <q-icon name="error" left />
                            Bajo
                          </q-chip>
                          <div class="text-caption text-grey-7 q-mt-xs">&lt; 70%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-grey-7 q-pa-xl">
                <q-icon name="insert_chart_outlined" size="64px" color="grey-5" />
                <div class="text-h6 q-mt-md">No existen registros para este tipo SLA</div>
              </div>
            </q-card-section>
          </q-card>
        </template>
      </div>

      <!-- Mensaje cuando no hay datos -->
      <q-card v-else flat bordered>
        <q-card-section>
          <div class="text-center text-grey-7 q-pa-xl">
            <q-icon name="insert_chart_outlined" size="64px" color="grey-5" />
            <div class="text-h6 q-mt-md">No existen registros para los filtros seleccionados</div>
            <div class="text-body2 q-mt-sm">
              Intenta ajustar los filtros o seleccionar otro período
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Estadísticas Rápidas -->
      <div class="row q-col-gutter-md q-mt-lg">
        <div class="col-12 col-md-4">
          <q-card flat bordered class="stat-card">
            <q-card-section>
              <div class="text-grey-7 text-subtitle2">Total Solicitudes</div>
              <div class="text-h4 text-weight-bold text-primary q-mt-sm">
                {{ estadisticas.totalSolicitudes }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered class="stat-card">
            <q-card-section>
              <div class="text-grey-7 text-subtitle2">Promedio SLA</div>
              <div class="text-h4 text-weight-bold text-primary q-mt-sm">
                {{ estadisticas.promedioSla }}%
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered class="stat-card">
            <q-card-section>
              <div class="text-grey-7 text-subtitle2">Roles Analizados</div>
              <div class="text-h4 text-weight-bold text-primary q-mt-sm">
                {{ estadisticas.rolesAnalizados }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { Chart, registerables } from 'chart.js'
import { useAppStore } from 'stores/app-store'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

Chart.register(...registerables)

const $q = useQuasar()
const appStore = useAppStore()

// Estados
const loading = ref(false)
const initialLoading = computed(() => !appStore.hasInitiallyLoaded)
const chartCanvasRefs = ref([])
const chartInstances = ref([])
const chartUnificadoCanvas = ref(null)
let chartUnificadoInstance = null

const setChartRef = (el, index) => {
  if (el) {
    chartCanvasRefs.value[index] = el
  }
}

const mesesDisponibles = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const tiposGraficoDisponibles = [
  { label: 'Barras', value: 'bar' },
  { label: 'Líneas', value: 'line' },
  { label: 'Área', value: 'area' },
  { label: 'Donut', value: 'doughnut' },
  { label: 'Radar', value: 'radar' },
]

const filtros = ref({
  mesInicio: null,
  mesFin: null,
  anioInicio: null,
  anioFin: null,
  tiposSla: [],
  roles: [],
})

const tipoGrafico = ref({ label: 'Barras', value: 'bar' })
const vistaUnificada = ref(false) // false = separado, true = unificado
const aniosDisponibles = ref([])
const tiposSlaDisponibles = ref([])
const rolesDisponibles = ref([])

const graficos = ref([])

const estadisticas = ref({
  totalSolicitudes: 0,
  promedioSla: 0,
  rolesAnalizados: 0,
})

// Computed
const construirTitulo = (codigoSla) => {
  let titulo = `Análisis ${codigoSla}`

  // Rango de meses
  if (filtros.value.mesInicio && filtros.value.mesFin) {
    titulo += ` - ${filtros.value.mesInicio} a ${filtros.value.mesFin}`
  } else if (filtros.value.mesInicio) {
    titulo += ` - ${filtros.value.mesInicio}`
  } else if (filtros.value.mesFin) {
    titulo += ` - hasta ${filtros.value.mesFin}`
  }

  // Rango de años
  if (filtros.value.anioInicio && filtros.value.anioFin) {
    titulo += ` (${filtros.value.anioInicio} - ${filtros.value.anioFin})`
  } else if (filtros.value.anioInicio) {
    titulo += ` (${filtros.value.anioInicio})`
  } else if (filtros.value.anioFin) {
    titulo += ` (hasta ${filtros.value.anioFin})`
  }

  return titulo
}

// Watchers
watch(tipoGrafico, () => {
  if (graficos.value.length > 0) {
    if (vistaUnificada.value) {
      crearGraficoUnificado()
    } else {
      crearGraficos()
    }
  }
})

watch(vistaUnificada, () => {
  if (graficos.value.length > 0) {
    nextTick(() => {
      if (vistaUnificada.value) {
        crearGraficoUnificado()
      } else {
        crearGraficos()
      }
    })
  }
})

// Métodos
const cargarConfiguracionesIniciales = async () => {
  try {
    // Cargar años
    const solicitudesRes = await api.get('/api/Solicitud')
    if (solicitudesRes.data && solicitudesRes.data.length > 0) {
      const aniosUnicos = [
        ...new Set(
          solicitudesRes.data
            .filter((s) => s.fechaSolicitud)
            .map((s) => new Date(s.fechaSolicitud).getFullYear()),
        ),
      ].sort((a, b) => b - a)
      aniosDisponibles.value = aniosUnicos.length > 0 ? aniosUnicos : [new Date().getFullYear()]
    }

    // Cargar roles
    const rolesRes = await api.get('/api/RolRegistro')
    if (rolesRes.data) {
      rolesDisponibles.value = rolesRes.data.filter((r) => r.esActivo).map((r) => r.nombreRol)
    }

    // Cargar códigos SLA
    const configSlaRes = await api.get('/api/ConfigSla')
    if (configSlaRes.data) {
      tiposSlaDisponibles.value = [
        ...new Set(configSlaRes.data.filter((c) => c.esActivo).map((c) => c.codigoSla)),
      ].sort((a, b) => {
        // Extraer el número del código (ej: "SLA1" -> 1)
        const numA = parseInt(a.replace(/\D/g, ''), 10)
        const numB = parseInt(b.replace(/\D/g, ''), 10)
        return numA - numB // Orden ascendente: SLA1, SLA2, SLA3, etc.
      })
    }
  } catch (error) {
    console.error('Error al cargar configuraciones:', error)
  }
}

const aplicarFiltros = async () => {
  // Validar rangos de fechas
  if (filtros.value.anioInicio && filtros.value.anioFin) {
    if (filtros.value.anioInicio > filtros.value.anioFin) {
      $q.notify({
        type: 'negative',
        message: 'El año de inicio no puede ser mayor al año final',
        position: 'top-right',
        timeout: 3000,
      })
      return
    }
  }

  // Validar rango de meses si están en el mismo año
  if (filtros.value.mesInicio && filtros.value.mesFin) {
    const mesInicioNum = mesesDisponibles.indexOf(filtros.value.mesInicio)
    const mesFinNum = mesesDisponibles.indexOf(filtros.value.mesFin)

    // Si hay mismo año o no hay filtro de años, validar meses
    if (
      !filtros.value.anioInicio ||
      !filtros.value.anioFin ||
      filtros.value.anioInicio === filtros.value.anioFin
    ) {
      if (mesInicioNum > mesFinNum) {
        $q.notify({
          type: 'negative',
          message: 'El mes de inicio no puede ser mayor al mes final',
          position: 'top-right',
          timeout: 3000,
        })
        return
      }
    }
  }

  loading.value = true

  try {
    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/api/Solicitud'),
      api.get('/api/RolRegistro'),
      api.get('/api/ConfigSla'),
    ])

    let solicitudes = solicitudesRes.data || []
    const todosRoles = rolesRes.data || []
    const configsSla = configSlaRes.data || []

    // Filtrar por rango de fechas (mes y año)
    solicitudes = solicitudes.filter((s) => {
      if (!s.fechaSolicitud) return false
      const fecha = new Date(s.fechaSolicitud)
      const anio = fecha.getFullYear()
      const mes = fecha.getMonth() + 1 // 1-12

      // Filtrar por rango de años
      if (filtros.value.anioInicio && anio < filtros.value.anioInicio) return false
      if (filtros.value.anioFin && anio > filtros.value.anioFin) return false

      // Filtrar por rango de meses (solo si están en el mismo año o sin filtro de año)
      if (filtros.value.mesInicio || filtros.value.mesFin) {
        const mesInicioNum = filtros.value.mesInicio
          ? mesesDisponibles.indexOf(filtros.value.mesInicio) + 1
          : 1
        const mesFinNum = filtros.value.mesFin
          ? mesesDisponibles.indexOf(filtros.value.mesFin) + 1
          : 12

        // Si hay rango de años, aplicar lógica más compleja
        if (filtros.value.anioInicio && filtros.value.anioFin) {
          // Primer año: desde mesInicio hasta diciembre
          if (anio === filtros.value.anioInicio && mes < mesInicioNum) return false
          // Último año: desde enero hasta mesFin
          if (anio === filtros.value.anioFin && mes > mesFinNum) return false
        } else {
          // Sin rango de años, filtrar solo por meses
          if (mes < mesInicioNum || mes > mesFinNum) return false
        }
      }

      return true
    })

    // Determinar tipos SLA a procesar
    const tiposSlaProcesar = filtros.value.tiposSla && filtros.value.tiposSla.length > 0
      ? filtros.value.tiposSla
      : tiposSlaDisponibles.value

    // Limpiar gráficos anteriores
    graficos.value = []
    let totalSolicitudesGlobal = 0
    let sumaPromedios = 0
    let totalRolesAnalizados = 0

    // Procesar cada tipo de SLA seleccionado
    for (const codigoSla of tiposSlaProcesar) {
      // Filtrar configuraciones y solicitudes por este código SLA
      const configsFiltradas = configsSla.filter((c) => c.codigoSla === codigoSla)
      const idsSla = configsFiltradas.map((c) => c.idSla)
      let solicitudesTipo = solicitudes.filter((s) => idsSla.includes(s.idSla))

      // Filtrar por roles si están seleccionados
      if (filtros.value.roles && filtros.value.roles.length > 0) {
        const rolesIds = todosRoles
          .filter((r) => filtros.value.roles.includes(r.nombreRol))
          .map((r) => r.idRolRegistro)
        solicitudesTipo = solicitudesTipo.filter((s) => rolesIds.includes(s.idRolRegistro))
      }

      // Calcular cumplimiento para este tipo SLA
      const solicitudesConSla = solicitudesTipo.map((s) => {
        const config = configsSla.find((c) => c.idSla === s.idSla)
        const diasUmbral = config?.diasUmbral || 0

        let cumpleSla = false
        if (s.fechaSolicitud && s.fechaIngreso) {
          const fechaSol = new Date(s.fechaSolicitud)
          const fechaIng = new Date(s.fechaIngreso)
          const diasTranscurridos = Math.floor((fechaIng - fechaSol) / (1000 * 60 * 60 * 24))
          cumpleSla = diasTranscurridos <= diasUmbral
        }

        return { ...s, cumpleSla }
      })

      // Preparar datos por rol para este tipo SLA
      const cumplimientoPorRol = todosRoles
        .filter((r) => r.esActivo)
        .map((rol) => {
          const solicitudesRol = solicitudesConSla.filter(
            (s) => s.idRolRegistro === rol.idRolRegistro,
          )
          const totalRol = solicitudesRol.length
          const cumplenRol = solicitudesRol.filter((s) => s.cumpleSla).length
          const porcentaje = totalRol > 0 ? (cumplenRol / totalRol) * 100 : 0

          return {
            nombre: rol.nombreRol,
            porcentaje: parseFloat(porcentaje.toFixed(1)),
            total: totalRol,
            cumplidos: cumplenRol,
          }
        })
        .filter((r) => r.total > 0)
        .sort((a, b) => b.porcentaje - a.porcentaje)

      // Solo agregar gráfico si hay datos
      if (cumplimientoPorRol.length > 0) {
        // Configurar datos según tipo de gráfico
        let datosGrafico
        if (tipoGrafico.value.value === 'line') {
          const labels = cumplimientoPorRol.map((r) => r.nombre)
          const data = cumplimientoPorRol.map((r) => r.porcentaje)
          const pointColors = cumplimientoPorRol.map((rol) => {
            if (rol.porcentaje >= 90) return 'rgba(76, 175, 80, 1)'
            else if (rol.porcentaje >= 70) return 'rgba(255, 152, 0, 1)'
            else return 'rgba(244, 67, 54, 1)'
          })

          datosGrafico = {
            labels: labels,
            datasets: [
              {
                label: 'Cumplimiento SLA (%)',
                data: data,
                borderColor: 'rgba(76, 175, 80, 0.5)',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: pointColors,
                pointBorderColor: pointColors,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: false,
                tension: 0.4,
              },
            ],
          }
        } else {
          datosGrafico = {
            labels: cumplimientoPorRol.map((r) => r.nombre),
            datasets: [
              {
                label: 'Cumplimiento SLA (%)',
                data: cumplimientoPorRol.map((r) => r.porcentaje),
                backgroundColor: cumplimientoPorRol.map((r) => getColorByPercentage(r.porcentaje)),
                borderColor: cumplimientoPorRol.map((r) => getColorByPercentage(r.porcentaje)),
                borderWidth: 2,
                fill: tipoGrafico.value.value === 'area',
              },
            ],
          }
        }

        graficos.value.push({
          codigoSla: codigoSla,
          titulo: construirTitulo(codigoSla),
          datos: datosGrafico,
          datosRoles: cumplimientoPorRol,
        })

        // Acumular estadísticas globales
        totalSolicitudesGlobal += solicitudesConSla.length
        sumaPromedios += cumplimientoPorRol.reduce((sum, r) => sum + r.porcentaje, 0) / cumplimientoPorRol.length
        totalRolesAnalizados += cumplimientoPorRol.length
      }
    }

    // Estadísticas globales
    estadisticas.value.totalSolicitudes = totalSolicitudesGlobal
    estadisticas.value.promedioSla = graficos.value.length > 0
      ? parseFloat((sumaPromedios / graficos.value.length).toFixed(1))
      : 0
    estadisticas.value.rolesAnalizados = totalRolesAnalizados

    await nextTick()
    if (vistaUnificada.value) {
      crearGraficoUnificado()
    } else {
      crearGraficos()
    }
  } catch (error) {
    console.error('Error al aplicar filtros:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos analíticos',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    loading.value = false
    appStore.markAsLoaded()
  }
}

const crearGraficos = () => {
  // Destruir gráficos anteriores
  chartInstances.value.forEach(chart => {
    if (chart) chart.destroy()
  })
  chartInstances.value = []

  // Crear un gráfico para cada tipo SLA
  graficos.value.forEach((grafico, index) => {
    const canvas = chartCanvasRefs.value[index]
    if (!canvas || !grafico.datos.labels.length) return

    const ctx = canvas.getContext('2d')
    const chartType = tipoGrafico.value.value === 'area' ? 'line' : tipoGrafico.value.value

    const chart = new Chart(ctx, {
      type: chartType,
      data: grafico.datos,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: tipoGrafico.value.value === 'doughnut' || tipoGrafico.value.value === 'line',
            position: 'bottom',
          },
          tooltip: {
            enabled: true,
            callbacks: {
              title: function (context) {
                const idx = context[0].dataIndex
                const rol = grafico.datosRoles[idx]
                return rol ? rol.nombre : ''
              },
              label: function (context) {
                const idx = context.dataIndex
                const rol = grafico.datosRoles[idx]
                return rol ? `Cumplimiento: ${rol.porcentaje}%` : ''
              },
              afterLabel: function (context) {
                const idx = context.dataIndex
                const rol = grafico.datosRoles[idx]
                return rol ? `Usuarios: ${rol.cumplidos}/${rol.total}` : ''
              },
            },
          },
        },
        scales:
          tipoGrafico.value.value !== 'doughnut'
            ? {
                x: {
                  ticks: {
                    callback: function (value, idx) {
                      const rol = grafico.datosRoles[idx]
                      if (!rol) return ''
                      return [rol.nombre, `Usuarios: ${rol.cumplidos}/${rol.total}`]
                    },
                    font: function (context) {
                      if (context.tick && context.tick.label) {
                        const label = context.tick.label
                        if (typeof label === 'object' && label.length > 1 && context.index === 1) {
                          return { size: 10 }
                        }
                      }
                      return { size: 12 }
                    },
                  },
                },
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function (value) {
                      return value + '%'
                    },
                  },
                },
              }
            : {},
      },
    })

    chartInstances.value[index] = chart
  })
}

const crearGraficoUnificado = () => {
  // Destruir gráfico unificado anterior
  if (chartUnificadoInstance) {
    chartUnificadoInstance.destroy()
    chartUnificadoInstance = null
  }

  if (!chartUnificadoCanvas.value || graficos.value.length === 0) return

  const ctx = chartUnificadoCanvas.value.getContext('2d')
  const chartType = tipoGrafico.value.value === 'area' ? 'line' : tipoGrafico.value.value

  // Si es gráfico de líneas, crear un dataset por cada tipo SLA
  if (tipoGrafico.value.value === 'line' || tipoGrafico.value.value === 'area') {
    // Obtener todos los roles únicos
    const todosLosRoles = new Set()
    graficos.value.forEach(grafico => {
      grafico.datosRoles.forEach(rol => todosLosRoles.add(rol.nombre))
    })
    const rolesUnicos = Array.from(todosLosRoles)

    // Crear un dataset por cada tipo SLA
    const datasets = graficos.value.map((grafico, idx) => {
      const colores = [
        'rgba(33, 150, 243, 0.8)',   // Azul
        'rgba(156, 39, 176, 0.8)',   // Morado
        'rgba(255, 87, 34, 0.8)',    // Naranja oscuro
        'rgba(0, 150, 136, 0.8)',    // Verde azulado
        'rgba(255, 193, 7, 0.8)',    // Amarillo
        'rgba(121, 85, 72, 0.8)',    // Marrón
      ]
      const color = colores[idx % colores.length]

      // Mapear datos para cada rol
      const data = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        return rol ? rol.porcentaje : null
      })

      // Colores de puntos según nivel de cumplimiento
      const pointColors = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        if (!rol) return 'rgba(200, 200, 200, 0.5)'
        return getColorByPercentage(rol.porcentaje)
      })

      return {
        label: grafico.codigoSla,
        data: data,
        datosRoles: grafico.datosRoles,
        borderColor: color,
        backgroundColor: color.replace('0.8', '0.1'),
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointBorderWidth: 2,
        fill: tipoGrafico.value.value === 'area',
        tension: 0.4,
      }
    })

    chartUnificadoInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels: rolesUnicos,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const dataset = context.dataset
                const dataIndex = context.dataIndex
                const rolNombre = rolesUnicos[dataIndex]
                const rol = dataset.datosRoles.find(r => r.nombre === rolNombre)

                if (!rol) return `${dataset.label}: Sin datos`
                return `${dataset.label}: ${rol.porcentaje}% (${rol.cumplidos}/${rol.total} usuarios)`
              },
              afterLabel: function(context) {
                const porcentaje = context.parsed.y
                if (porcentaje >= 90) return '✓ Excelente (≥90%)'
                if (porcentaje >= 70) return '⚠ Aceptable (≥70%)'
                if (porcentaje > 0) return '✗ Bajo (<70%)'
                return ''
              }
            }
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + '%'
              },
            },
          },
        },
      },
    })
  } else if (tipoGrafico.value.value === 'bar') {
    // Para barras: agrupar por roles con colores según nivel de cumplimiento
    const todosLosRoles = new Set()
    graficos.value.forEach(grafico => {
      grafico.datosRoles.forEach(rol => todosLosRoles.add(rol.nombre))
    })
    const rolesUnicos = Array.from(todosLosRoles)

    const datasets = graficos.value.map((grafico) => {
      const data = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        return rol ? rol.porcentaje : 0
      })

      // Asignar colores según el porcentaje de cada rol
      const backgroundColors = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        if (!rol || rol.porcentaje === 0) return 'rgba(200, 200, 200, 0.3)'
        return getColorByPercentage(rol.porcentaje)
      })

      const borderColors = rolesUnicos.map(rolNombre => {
        const rol = grafico.datosRoles.find(r => r.nombre === rolNombre)
        if (!rol || rol.porcentaje === 0) return 'rgba(200, 200, 200, 0.5)'
        return getColorByPercentage(rol.porcentaje).replace('0.8', '1')
      })

      return {
        label: grafico.codigoSla,
        data: data,
        datosRoles: grafico.datosRoles,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
      }
    })

    chartUnificadoInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: rolesUnicos,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const dataset = context.dataset
                const dataIndex = context.dataIndex
                const rolNombre = rolesUnicos[dataIndex]
                const rol = dataset.datosRoles.find(r => r.nombre === rolNombre)

                if (!rol) return `${dataset.label}: Sin datos`
                return `${dataset.label}: ${rol.porcentaje}% (${rol.cumplidos}/${rol.total} usuarios)`
              },
              afterLabel: function(context) {
                const porcentaje = context.parsed.y
                if (porcentaje >= 90) return '✓ Excelente'
                if (porcentaje >= 70) return '⚠ Aceptable'
                if (porcentaje > 0) return '✗ Bajo'
                return ''
              }
            }
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + '%'
              },
            },
          },
        },
      },
    })
  } else {
    // Para otros tipos (doughnut, radar): mostrar promedio por tipo SLA con colores según nivel
    const labels = graficos.value.map(g => g.codigoSla)
    const data = graficos.value.map(g => {
      const promedio = g.datosRoles.reduce((sum, r) => sum + r.porcentaje, 0) / g.datosRoles.length
      return parseFloat(promedio.toFixed(1))
    })

    // Calcular totales de usuarios por SLA
    const usuariosTotales = graficos.value.map(g => {
      return g.datosRoles.reduce((sum, r) => sum + r.total, 0)
    })

    const usuariosCumplidos = graficos.value.map(g => {
      return g.datosRoles.reduce((sum, r) => sum + r.cumplidos, 0)
    })

    // Colores según el promedio de cada SLA
    const backgroundColors = data.map(promedio => getColorByPercentage(promedio))

    chartUnificadoInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Cumplimiento Promedio SLA (%)',
          data: data,
          usuariosTotales: usuariosTotales,
          usuariosCumplidos: usuariosCumplidos,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(c => c.replace('0.8', '1')),
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const dataset = context.dataset
                const index = context.dataIndex
                const porcentaje = context.parsed.y || context.parsed
                const total = dataset.usuariosTotales[index]
                const cumplidos = dataset.usuariosCumplidos[index]
                return `${context.label}: ${porcentaje}% (${cumplidos}/${total} usuarios)`
              },
              afterLabel: function(context) {
                const porcentaje = context.parsed.y || context.parsed
                if (porcentaje >= 90) return 'Excelente (≥90%)'
                if (porcentaje >= 70) return 'Aceptable (≥70%)'
                return 'Bajo (<70%)'
              }
            }
          }
        },
        scales: chartType !== 'doughnut' ? {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + '%'
              },
            },
          },
        } : {},
      },
    })
  }
}

const restablecerFiltros = () => {
  filtros.value = {
    mesInicio: null,
    mesFin: null,
    anioInicio: null,
    anioFin: null,
    tiposSla: [],
    roles: [],
  }
  tipoGrafico.value = { label: 'Barras', value: 'bar' }

  // Limpiar gráficos
  graficos.value = []
  chartInstances.value.forEach(chart => {
    if (chart) chart.destroy()
  })
  chartInstances.value = []

  estadisticas.value = {
    totalSolicitudes: 0,
    promedioSla: 0,
    rolesAnalizados: 0,
  }
}

const exportarPDF = async () => {
  try {
    // Validar que haya gráficos para exportar
    if (!graficos.value || graficos.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'No hay datos para exportar. Por favor aplique los filtros primero.',
        position: 'top-right',
      })
      return
    }

    $q.loading.show({ message: 'Generando PDF...' })

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    let yPos = margin
    let currentPage = 1

    // Cargar logo
    const logoUrl = '/src/assets/Tata_logo.png'
    let logoData = null
    try {
      const img = new Image()
      img.src = logoUrl
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      logoData = canvas.toDataURL('image/png')
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error)
    }

    // Función para agregar header con logo
    const addHeader = () => {
      // Logo (esquina superior derecha)
      if (logoData) {
        const logoWidth = 40
        const logoHeight = 20
        pdf.addImage(logoData, 'PNG', pageWidth - margin - logoWidth, margin, logoWidth, logoHeight)
      }

      // Título
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'bold')
      pdf.text('Reporte de Análisis SLA', margin, margin + 7)

      // Subtítulo con información
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(80, 80, 80)

      let infoText = ''
      if (filtros.value.tiposSla && filtros.value.tiposSla.length > 0) {
        const totalRegistros = graficos.value.reduce((sum, g) => {
          return sum + (g.datosRoles?.reduce((s, r) => s + r.total, 0) || 0)
        }, 0)
        infoText = `Registros exportados: ${totalRegistros}`
      } else {
        infoText = 'Todos los tipos SLA'
      }
      pdf.text(infoText, margin, margin + 13)

      return margin + 20
    }

    // Función para agregar footer
    const addFooter = () => {
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text(
        `Página ${currentPage}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Función para verificar page break
    const checkPageBreak = (requiredHeight) => {
      if (yPos + requiredHeight > pageHeight - 20) {
        addFooter()
        pdf.addPage()
        currentPage++
        yPos = addHeader()
        return true
      }
      return false
    }

    // PRIMERA PÁGINA - Información general y datos tabulares
    yPos = addHeader()
    yPos += 5

    // Preparar datos para tabla estilo logs
    const tableData = []

    graficos.value.forEach((grafico, idx) => {
      if (grafico.datosRoles && grafico.datosRoles.length > 0) {
        grafico.datosRoles.forEach((rol) => {
          tableData.push({
            id: idx + 1,
            codigoSla: grafico.codigoSla,
            rol: rol.nombre,
            porcentaje: `${rol.porcentaje}%`,
            cumplidos: rol.cumplidos,
            total: rol.total,
            nivel: rol.porcentaje >= 90 ? 'EXCELENTE' : rol.porcentaje >= 70 ? 'ACEPTABLE' : 'BAJO'
          })
        })
      }
    })

    // Dibujar tabla
    const colWidths = {
      id: 15,
      codigoSla: 25,
      rol: 50,
      porcentaje: 25,
      usuarios: 30,
      nivel: 35
    }

    // Header de tabla
    pdf.setFillColor(66, 139, 202) // Color azul del header
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'bold')

    let xPos = margin + 2
    pdf.text('ID', xPos, yPos + 6.5)
    xPos += colWidths.id
    pdf.text('Código SLA', xPos, yPos + 6.5)
    xPos += colWidths.codigoSla
    pdf.text('Rol', xPos, yPos + 6.5)
    xPos += colWidths.rol
    pdf.text('SLA %', xPos, yPos + 6.5)
    xPos += colWidths.porcentaje
    pdf.text('Usuarios', xPos, yPos + 6.5)
    xPos += colWidths.usuarios
    pdf.text('Nivel', xPos, yPos + 6.5)

    yPos += 10

    // Filas de datos
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(8)

    tableData.forEach((row, index) => {
      checkPageBreak(8)

      // Fila alternada
      const fillColor = index % 2 === 0 ? 255 : 245
      pdf.setFillColor(fillColor, fillColor, fillColor)
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')

      pdf.setTextColor(0, 0, 0)

      xPos = margin + 2
      pdf.text(String(row.id), xPos, yPos + 5.5)
      xPos += colWidths.id
      pdf.text(row.codigoSla, xPos, yPos + 5.5)
      xPos += colWidths.codigoSla

      // Truncar rol si es muy largo
      const rolText = row.rol.length > 25 ? row.rol.substring(0, 22) + '...' : row.rol
      pdf.text(rolText, xPos, yPos + 5.5)
      xPos += colWidths.rol
      pdf.text(row.porcentaje, xPos, yPos + 5.5)
      xPos += colWidths.porcentaje
      pdf.text(`${row.cumplidos}/${row.total}`, xPos, yPos + 5.5)
      xPos += colWidths.usuarios
      pdf.text(row.nivel, xPos, yPos + 5.5)

      yPos += 8
    })

    yPos += 10

    // Resumen de KPIs
    checkPageBreak(50)

    pdf.setFontSize(11)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Resumen Ejecutivo', margin, yPos)
    yPos += 8

    // Tabla de KPIs con estilo similar
    const kpiData = [
      { label: 'Total de Solicitudes', value: estadisticas.value.totalSolicitudes.toLocaleString() },
      { label: 'Promedio SLA General', value: `${estadisticas.value.promedioSla}%` },
      { label: 'Roles Analizados', value: estadisticas.value.rolesAnalizados.toLocaleString() },
    ]

    // Header KPI
    pdf.setFillColor(66, 139, 202)
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'bold')
    pdf.text('Indicador', margin + 2, yPos + 5.5)
    pdf.text('Valor', margin + (pageWidth - 2 * margin) * 0.65, yPos + 5.5)
    yPos += 8

    // Datos KPI
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(8)
    kpiData.forEach((kpi, index) => {
      const fillColor = index % 2 === 0 ? 255 : 245
      pdf.setFillColor(fillColor, fillColor, fillColor)
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F')
      pdf.setTextColor(0, 0, 0)
      pdf.text(kpi.label, margin + 2, yPos + 4.5)
      pdf.text(kpi.value, margin + (pageWidth - 2 * margin) * 0.65, yPos + 4.5)
      yPos += 7
    })

    addFooter()

    // PÁGINAS SIGUIENTES: Gráficos (si hay espacio o en nuevas páginas)
    const graficosOrdenados = [...graficos.value].sort((a, b) => {
      const numA = parseInt(a.codigoSla.replace(/\D/g, '')) || 0
      const numB = parseInt(b.codigoSla.replace(/\D/g, '')) || 0
      return numA - numB
    })

    for (const grafico of graficosOrdenados) {
      pdf.addPage()
      currentPage++
      yPos = addHeader()
      yPos += 5

      // Título del gráfico
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(66, 139, 202)
      pdf.text(grafico.titulo, margin, yPos)
      yPos += 10

      // Buscar el canvas del gráfico
      let canvas = null
      if (vistaUnificada.value) {
        canvas = document.getElementById('chartUnificadoCanvas')
      } else {
        const canvasId = `chartCanvas_${grafico.codigoSla}`
        canvas = document.getElementById(canvasId)
      }

      if (canvas) {
        try {
          const canvasImage = await html2canvas(canvas, {
            scale: 2,
            backgroundColor: '#ffffff',
          })

          const imgData = canvasImage.toDataURL('image/png')
          const imgWidth = pageWidth - 2 * margin
          const imgHeight = (canvasImage.height * imgWidth) / canvasImage.width
          const maxHeight = pageHeight - yPos - 30
          const finalHeight = Math.min(imgHeight, maxHeight)
          const finalWidth = (finalHeight * canvasImage.width) / canvasImage.height

          pdf.addImage(imgData, 'PNG', margin, yPos, finalWidth, finalHeight)
          yPos += finalHeight + 5
        } catch (error) {
          console.error('Error al capturar gráfico:', error)
          pdf.setFontSize(9)
          pdf.setTextColor(200, 0, 0)
          pdf.text('Error al capturar gráfico', margin, yPos)
          yPos += 10
        }
      }

      addFooter()

      if (vistaUnificada.value) break
    }

    // Guardar PDF
    const fileName = `Analisis_SLA_${new Date().getTime()}.pdf`
    pdf.save(fileName)

    $q.notify({
      type: 'positive',
      message: 'PDF exportado correctamente',
      position: 'top-right',
      timeout: 2000,
    })
  } catch (error) {
    console.error('Error al exportar PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el PDF',
      position: 'top-right',
    })
  } finally {
    $q.loading.hide()
  }
}

const getColorByPercentage = (percentage) => {
  if (percentage >= 90) return 'rgba(76, 175, 80, 0.8)'
  if (percentage >= 70) return 'rgba(255, 152, 0, 0.8)'
  return 'rgba(244, 67, 54, 0.8)'
}

// Lifecycle
onMounted(async () => {
  await cargarConfiguracionesIniciales()
  await aplicarFiltros()
})

onBeforeUnmount(() => {
  chartInstances.value.forEach(chart => {
    if (chart) chart.destroy()
  })
  chartInstances.value = []

  if (chartUnificadoInstance) {
    chartUnificadoInstance.destroy()
    chartUnificadoInstance = null
  }
})
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: #f5f7fa;
}

.dashboard-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.filters-card {
  background: white;
}

.stat-card {
  background: white;
  border-radius: 8px;
  min-height: 100px;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.color-legend {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-page {
    padding: 16px;
  }

  .dashboard-header {
    padding: 16px;
  }

  .chart-wrapper {
    min-height: 350px;
  }

  .color-legend {
    min-height: 350px;
  }

  .stat-card {
    min-height: 80px;
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 12px;
  }

  .dashboard-header {
    padding: 12px;
  }

  .dashboard-header .text-h5 {
    font-size: 1.25rem;
  }

  .chart-wrapper {
    min-height: 300px;
  }

  .color-legend {
    min-height: auto;
    margin-top: 16px;
  }

  .legend-items {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .legend-item {
    align-items: center;
  }

  .stat-card {
    min-height: 70px;
  }

  .text-h6 {
    font-size: 1.1rem;
  }

  .text-h4 {
    font-size: 1.75rem;
  }
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 8px;
  }

  .dashboard-header {
    padding: 10px;
  }

  .dashboard-header .row {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .dashboard-header .q-icon {
    margin-bottom: 8px;
  }

  .chart-wrapper {
    min-height: 250px;
  }

  .stat-card .text-h4 {
    font-size: 1.5rem;
  }

  .filters-card .q-gutter-md {
    gap: 8px;
  }

  .text-h6 {
    font-size: 1rem;
  }
}

@media (max-width: 400px) {
  .dashboard-page {
    padding: 4px;
  }

  .chart-wrapper {
    min-height: 200px;
  }

  .stat-card .text-h4 {
    font-size: 1.25rem;
  }

  .stat-card .text-subtitle2 {
    font-size: 0.85rem;
  }
}

.fullscreen-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
