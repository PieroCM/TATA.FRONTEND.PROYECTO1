<template>
  <q-page class="dashboard-page">
    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
      <div class="q-mt-md">Cargando análisis...</div>
    </q-inner-loading>

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
          <!-- Mes/Año -->
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.mes"
              :options="mesesDisponibles"
              label="Mes"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-select
              v-model="filtros.anio"
              :options="aniosDisponibles"
              label="Año"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" />
              </template>
            </q-select>
          </div>

          <!-- Tipo SLA -->
          <div class="col-12 col-md-3">
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

          <!-- Roles (multi-selección) -->
          <div class="col-12 col-md-3">
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

        <div v-if="datosGrafico.labels && datosGrafico.labels.length > 0" class="chart-wrapper">
          <canvas ref="chartCanvas"></canvas>
        </div>
        <div v-else class="text-center text-grey-7 q-pa-xl">
          <q-icon name="insert_chart_outlined" size="64px" color="grey-5" />
          <div class="text-h6 q-mt-md">No existen registros para los filtros seleccionados</div>
          <div class="text-body2 q-mt-sm">Intenta ajustar los filtros o seleccionar otro período</div>
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
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const $q = useQuasar()

// Estados
const loading = ref(false)
const chartCanvas = ref(null)
let chartInstance = null

const mesesDisponibles = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const tiposGraficoDisponibles = [
  { label: 'Barras', value: 'bar' },
  { label: 'Líneas', value: 'line' },
  { label: 'Área', value: 'line' },
  { label: 'Donut', value: 'doughnut' },
  { label: 'Radar', value: 'radar' }
]

const filtros = ref({
  mes: mesesDisponibles[new Date().getMonth()],
  anio: new Date().getFullYear(),
  tipoSla: null,
  roles: []
})

const tipoGrafico = ref({ label: 'Barras', value: 'bar' })
const aniosDisponibles = ref([])
const tiposSlaDisponibles = ref([])
const rolesDisponibles = ref([])

const datosGrafico = ref({
  labels: [],
  datasets: []
})

const estadisticas = ref({
  totalSolicitudes: 0,
  promedioSla: 0,
  rolesAnalizados: 0
})

// Computed
const tituloGrafico = computed(() => {
  const mes = filtros.value.mes
  const anio = filtros.value.anio
  return `Análisis SLA - ${mes} ${anio}`
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
    const solicitudesRes = await api.get('/Solicitud')
    if (solicitudesRes.data && solicitudesRes.data.length > 0) {
      const aniosUnicos = [...new Set(solicitudesRes.data
        .filter(s => s.fechaSolicitud)
        .map(s => new Date(s.fechaSolicitud).getFullYear())
      )].sort((a, b) => b - a)
      aniosDisponibles.value = aniosUnicos.length > 0 ? aniosUnicos : [new Date().getFullYear()]
    }

    // Cargar roles
    const rolesRes = await api.get('/RolRegistro')
    if (rolesRes.data) {
      rolesDisponibles.value = rolesRes.data
        .filter(r => r.esActivo)
        .map(r => r.nombreRol)
    }

    // Cargar tipos SLA
    const configSlaRes = await api.get('/ConfigSla')
    if (configSlaRes.data) {
      tiposSlaDisponibles.value = [...new Set(configSlaRes.data
        .filter(c => c.esActivo)
        .map(c => c.tipoSolicitud)
      )]
    }
  } catch (error) {
    console.error('Error al cargar configuraciones:', error)
  }
}

const aplicarFiltros = async () => {
  loading.value = true

  try {
    const mesNumero = mesesDisponibles.indexOf(filtros.value.mes) + 1

    const [solicitudesRes, rolesRes, configSlaRes] = await Promise.all([
      api.get('/Solicitud'),
      api.get('/RolRegistro'),
      api.get('/ConfigSla')
    ])

    let solicitudes = solicitudesRes.data || []
    const todosRoles = rolesRes.data || []
    const configsSla = configSlaRes.data || []

    // Filtrar por mes/año
    solicitudes = solicitudes.filter(s => {
      if (!s.fechaSolicitud) return false
      const fecha = new Date(s.fechaSolicitud)
      return fecha.getFullYear() === filtros.value.anio &&
             (fecha.getMonth() + 1) === mesNumero
    })

    // Filtrar por tipo SLA
    if (filtros.value.tipoSla) {
      const configsFiltradas = configsSla.filter(c => c.tipoSolicitud === filtros.value.tipoSla)
      const idsSla = configsFiltradas.map(c => c.idSla)
      solicitudes = solicitudes.filter(s => idsSla.includes(s.idSla))
    }

    // Filtrar por roles
    if (filtros.value.roles && filtros.value.roles.length > 0) {
      const rolesIds = todosRoles
        .filter(r => filtros.value.roles.includes(r.nombreRol))
        .map(r => r.idRolRegistro)
      solicitudes = solicitudes.filter(s => rolesIds.includes(s.idRolRegistro))
    }

    // Calcular cumplimiento
    const solicitudesConSla = solicitudes.map(s => {
      const config = configsSla.find(c => c.idSla === s.idSla)
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
      .filter(r => r.esActivo)
      .map(rol => {
        const solicitudesRol = solicitudesConSla.filter(s => s.idRolRegistro === rol.idRolRegistro)
        const totalRol = solicitudesRol.length
        const cumplenRol = solicitudesRol.filter(s => s.cumpleSla).length
        const porcentaje = totalRol > 0 ? (cumplenRol / totalRol) * 100 : 0

        return {
          nombre: rol.nombreRol,
          porcentaje: parseFloat(porcentaje.toFixed(1)),
          total: totalRol
        }
      })
      .filter(r => r.total > 0)
      .sort((a, b) => b.porcentaje - a.porcentaje)

    datosGrafico.value = {
      labels: cumplimientoPorRol.map(r => r.nombre),
      datasets: [{
        label: 'Cumplimiento SLA (%)',
        data: cumplimientoPorRol.map(r => r.porcentaje),
        backgroundColor: cumplimientoPorRol.map(r => getColorByPercentage(r.porcentaje)),
        borderColor: cumplimientoPorRol.map(r => getColorByPercentage(r.porcentaje)),
        borderWidth: 2,
        fill: tipoGrafico.value.label === 'Área'
      }]
    }

    // Estadísticas
    estadisticas.value.totalSolicitudes = solicitudesConSla.length
    estadisticas.value.promedioSla = cumplimientoPorRol.length > 0
      ? parseFloat((cumplimientoPorRol.reduce((sum, r) => sum + r.porcentaje, 0) / cumplimientoPorRol.length).toFixed(1))
      : 0
    estadisticas.value.rolesAnalizados = cumplimientoPorRol.length

    await nextTick()
    crearGrafico()

    $q.notify({
      type: 'positive',
      message: `${solicitudesConSla.length} registros encontrados`,
      position: 'top-right',
      timeout: 2000
    })

  } catch (error) {
    console.error('Error al aplicar filtros:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos analíticos',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

const crearGrafico = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  if (!chartCanvas.value || !datosGrafico.value.labels.length) return

  const ctx = chartCanvas.value.getContext('2d')

  chartInstance = new Chart(ctx, {
    type: tipoGrafico.value.value,
    data: datosGrafico.value,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: tipoGrafico.value.value === 'doughnut',
          position: 'bottom'
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y + '%'
            }
          }
        }
      },
      scales: tipoGrafico.value.value !== 'doughnut' ? {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%'
            }
          }
        }
      } : {}
    }
  })
}

const restablecerFiltros = () => {
  filtros.value = {
    mes: mesesDisponibles[new Date().getMonth()],
    anio: new Date().getFullYear(),
    tipoSla: null,
    roles: []
  }
  tipoGrafico.value = { label: 'Barras', value: 'bar' }
  aplicarFiltros()
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
  max-height: 500px;
}
</style>
