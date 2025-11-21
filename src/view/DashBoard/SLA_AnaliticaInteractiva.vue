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

          <div class="row q-col-gutter-md">
            <!-- Rango de Meses -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="filtros.mesInicio"
                :options="mesesDisponibles"
                label="Mes Inicio"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
              <q-select
                v-model="filtros.mesFin"
                :options="mesesDisponibles"
                label="Mes Fin"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-select>
            </div>

            <!-- Rango de Años -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="filtros.anioInicio"
                :options="aniosDisponibles"
                label="Año Inicio"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-2">
              <q-select
                v-model="filtros.anioFin"
                :options="aniosDisponibles"
                label="Año Fin"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-select>
            </div>

            <!-- Tipo SLA (desde BD) -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="filtros.tipoSla"
                :options="tiposSlaDisponibles"
                label="Tipo SLA"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
            </div>

            <!-- Roles (desde BD) -->
            <div class="col-12 col-md-2">
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
                  <q-icon name="people" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Segunda fila de filtros -->
          <div class="row q-col-gutter-md q-mt-sm">
            <!-- Tipo de Gráfico -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="tipoGrafico"
                :options="tiposGraficoDisponibles"
                label="Tipo de Gráfico"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="show_chart" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-mt-md">
            <div class="col-auto">
              <q-btn
                color="primary"
                label="Aplicar Filtros"
                icon="search"
                @click="aplicarFiltros"
                :loading="loading"
              />
            </div>
            <div class="col-auto q-ml-sm">
              <q-btn
                outline
                color="grey-7"
                label="Restablecer"
                icon="refresh"
                @click="restablecerFiltros"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Gráfico Interactivo -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            <q-icon name="bar_chart" class="q-mr-sm" />
            {{ tituloGrafico }}
          </div>
          <q-separator class="q-mb-md" />

          <div v-if="datosGrafico.labels && datosGrafico.labels.length > 0">
            <div class="row">
              <!-- Gráfico -->
              <div class="col-12 col-md-9">
                <div class="chart-wrapper">
                  <canvas ref="chartCanvas"></canvas>
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

Chart.register(...registerables)

const $q = useQuasar()
const appStore = useAppStore()

// Estados
const loading = ref(false)
const initialLoading = computed(() => !appStore.hasInitiallyLoaded)
const chartCanvas = ref(null)
let chartInstance = null

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
  tipoSla: null,
  roles: [],
})

const tipoGrafico = ref({ label: 'Barras', value: 'bar' })
const aniosDisponibles = ref([])
const tiposSlaDisponibles = ref([])
const rolesDisponibles = ref([])

const datosGrafico = ref({
  labels: [],
  datasets: [],
})

const estadisticas = ref({
  totalSolicitudes: 0,
  promedioSla: 0,
  rolesAnalizados: 0,
})

// Computed
const tituloGrafico = computed(() => {
  let titulo = 'Análisis SLA'

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
})

// Watchers
watch(tipoGrafico, () => {
  if (datosGrafico.value.labels.length > 0) {
    crearGrafico()
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

    // Cargar tipos SLA
    const configSlaRes = await api.get('/api/ConfigSla')
    if (configSlaRes.data) {
      tiposSlaDisponibles.value = [
        ...new Set(configSlaRes.data.filter((c) => c.esActivo).map((c) => c.tipoSolicitud)),
      ]
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

    // Filtrar por tipo SLA
    if (filtros.value.tipoSla) {
      const configsFiltradas = configsSla.filter((c) => c.tipoSolicitud === filtros.value.tipoSla)
      const idsSla = configsFiltradas.map((c) => c.idSla)
      solicitudes = solicitudes.filter((s) => idsSla.includes(s.idSla))
    }

    // Filtrar por roles
    if (filtros.value.roles && filtros.value.roles.length > 0) {
      const rolesIds = todosRoles
        .filter((r) => filtros.value.roles.includes(r.nombreRol))
        .map((r) => r.idRolRegistro)
      solicitudes = solicitudes.filter((s) => rolesIds.includes(s.idRolRegistro))
    }

    // Calcular cumplimiento
    const solicitudesConSla = solicitudes.map((s) => {
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

    // Preparar datos para gráfico
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
        }
      })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.porcentaje - a.porcentaje)

    // Configurar datos según tipo de gráfico
    if (tipoGrafico.value.value === 'line') {
      // Para gráfico de líneas: una línea con todos los puntos (roles) con colores según SLA
      const labels = cumplimientoPorRol.map((r) => r.nombre)
      const data = cumplimientoPorRol.map((r) => r.porcentaje)
      const pointColors = cumplimientoPorRol.map((rol) => {
        if (rol.porcentaje >= 90) {
          return 'rgba(76, 175, 80, 1)' // Verde (Excelente)
        } else if (rol.porcentaje >= 70) {
          return 'rgba(255, 152, 0, 1)' // Amarillo (Aceptable)
        } else {
          return 'rgba(244, 67, 54, 1)' // Rojo (Bajo)
        }
      })

      datosGrafico.value = {
        labels: labels,
        datasets: [
          {
            label: 'Cumplimiento SLA (%)',
            data: data,
            borderColor: 'rgba(76, 175, 80, 0.5)', // Color de línea general
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: pointColors, // Colores individuales por punto
            pointBorderColor: pointColors,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: false,
            tension: 0.4,
          },
        ],
      }
    } else {
      // Para otros gráficos: dataset único con múltiples barras/puntos
      datosGrafico.value = {
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

    // Estadísticas
    estadisticas.value.totalSolicitudes = solicitudesConSla.length
    estadisticas.value.promedioSla =
      cumplimientoPorRol.length > 0
        ? parseFloat(
            (
              cumplimientoPorRol.reduce((sum, r) => sum + r.porcentaje, 0) /
              cumplimientoPorRol.length
            ).toFixed(1),
          )
        : 0
    estadisticas.value.rolesAnalizados = cumplimientoPorRol.length

    await nextTick()
    crearGrafico()
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

const crearGrafico = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  if (!chartCanvas.value || !datosGrafico.value.labels.length) return

  const ctx = chartCanvas.value.getContext('2d')

  // Convertir 'area' a 'line' para Chart.js (área es línea con fill)
  const chartType = tipoGrafico.value.value === 'area' ? 'line' : tipoGrafico.value.value

  chartInstance = new Chart(ctx, {
    type: chartType,
    data: datosGrafico.value,
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
            label: function (context) {
              if (tipoGrafico.value.value === 'line') {
                return context.dataset.label + ': ' + context.parsed.y + '%'
              }
              return context.dataset.label + ': ' + context.parsed.y + '%'
            },
          },
        },
      },
      scales:
        tipoGrafico.value.value !== 'doughnut'
          ? {
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
}

const restablecerFiltros = () => {
  filtros.value = {
    mesInicio: null,
    mesFin: null,
    anioInicio: null,
    anioFin: null,
    tipoSla: null,
    roles: [],
  }
  tipoGrafico.value = { label: 'Barras', value: 'bar' }

  // Limpiar gráfico
  datosGrafico.value = {
    labels: [],
    datasets: [],
  }
  estadisticas.value = {
    totalSolicitudes: 0,
    promedioSla: 0,
    rolesAnalizados: 0,
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
  if (chartInstance) {
    chartInstance.destroy()
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

/* Responsive: en móvil la leyenda va abajo */
@media (max-width: 768px) {
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
