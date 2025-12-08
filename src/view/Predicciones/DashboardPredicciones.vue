<template>
  <q-page class="dashboard-page">
    <!-- Loading Fullscreen -->
    <div v-if="initialLoading" class="fullscreen-loading">
      <div class="loading-content">
        <q-spinner-gears size="80px" color="primary" />
        <div class="text-h6 q-mt-lg text-primary">Cargando dashboard...</div>
      </div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="dashboard-header q-mb-lg">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="dashboard" size="40px" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h5 text-weight-medium">Dashboard de Predicciones</div>
              <div class="text-grey-7">
                Resumen ejecutivo de predicciones de riesgo SLA
              </div>
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              outline
              color="primary"
              icon="refresh"
              label="Actualizar"
              :loading="loading"
              @click="recargarDatos"
            />
          </div>
        </div>
      </div>

      <!-- Cards KPIs -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Total Analizadas -->
        <div class="col-12 col-md-2">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="text-center">
              <q-icon name="analytics" size="32px" color="primary" />
              <div class="text-h4 text-weight-bold q-mt-sm">{{ resumen?.totalAnalizadas || 0 }}</div>
              <div class="text-caption text-grey-7">Analizadas</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Críticas -->
        <div class="col-12 col-md-2">
          <q-card flat bordered class="kpi-card critical">
            <q-card-section class="text-center">
              <q-icon name="error" size="32px" color="negative" />
              <div class="text-h4 text-weight-bold text-negative q-mt-sm">{{ resumen?.criticas || 0 }}</div>
              <div class="text-caption text-grey-7">Críticas</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Altas -->
        <div class="col-12 col-md-2">
          <q-card flat bordered class="kpi-card warning">
            <q-card-section class="text-center">
              <q-icon name="warning" size="32px" color="warning" />
              <div class="text-h4 text-weight-bold text-warning q-mt-sm">{{ resumen?.altas || 0 }}</div>
              <div class="text-caption text-grey-7">Altas</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Medias -->
        <div class="col-12 col-md-2">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="text-center">
              <q-icon name="info" size="32px" color="orange" />
              <div class="text-h4 text-weight-bold text-orange q-mt-sm">{{ resumen?.medias || 0 }}</div>
              <div class="text-caption text-grey-7">Medias</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Bajas -->
        <div class="col-12 col-md-2">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="text-center">
              <q-icon name="check_circle" size="32px" color="positive" />
              <div class="text-h4 text-weight-bold text-positive q-mt-sm">{{ resumen?.bajas || 0 }}</div>
              <div class="text-caption text-grey-7">Bajas</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Promedio -->
        <div class="col-12 col-md-2">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="text-center">
              <q-icon name="speed" size="32px" color="info" />
              <div class="text-h4 text-weight-bold text-info q-mt-sm">{{ resumen?.promedioRiesgo?.toFixed(0) || 0 }}%</div>
              <div class="text-caption text-grey-7">Promedio</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Cards Estados de Solicitudes -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- En Proceso -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="status-card">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <q-icon name="hourglass_empty" size="32px" color="blue" />
                  <div class="text-h5 text-weight-bold q-mt-sm">{{ resumen?.enProceso || 0 }}</div>
                  <div class="text-caption text-grey-7">Solicitudes en Proceso</div>
                </div>
                <q-circular-progress
                  :value="calcularPorcentaje(resumen?.enProceso || 0)"
                  size="60px"
                  :thickness="0.15"
                  color="blue"
                  track-color="grey-3"
                  class="q-ma-sm"
                >
                  <div class="text-caption">{{ calcularPorcentaje(resumen?.enProceso || 0) }}%</div>
                </q-circular-progress>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Completadas -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="status-card">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <q-icon name="check_circle" size="32px" color="positive" />
                  <div class="text-h5 text-weight-bold q-mt-sm">{{ resumen?.completadas || 0 }}</div>
                  <div class="text-caption text-grey-7">Completadas</div>
                </div>
                <q-circular-progress
                  :value="calcularPorcentaje(resumen?.completadas || 0)"
                  size="60px"
                  :thickness="0.15"
                  color="positive"
                  track-color="grey-3"
                  class="q-ma-sm"
                >
                  <div class="text-caption">{{ calcularPorcentaje(resumen?.completadas || 0) }}%</div>
                </q-circular-progress>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Canceladas -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="status-card">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <q-icon name="cancel" size="32px" color="grey" />
                  <div class="text-h5 text-weight-bold q-mt-sm">{{ resumen?.canceladas || 0 }}</div>
                  <div class="text-caption text-grey-7">Canceladas</div>
                </div>
                <q-circular-progress
                  :value="calcularPorcentaje(resumen?.canceladas || 0)"
                  size="60px"
                  :thickness="0.15"
                  color="grey"
                  track-color="grey-3"
                  class="q-ma-sm"
                >
                  <div class="text-caption">{{ calcularPorcentaje(resumen?.canceladas || 0) }}%</div>
                </q-circular-progress>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Gráfico de distribución -->
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="pie_chart" class="q-mr-sm" />
                Distribución por Nivel de Riesgo
              </div>
              <q-separator class="q-mb-md" />

              <div class="chart-container">
                <canvas ref="chartPieRef"></canvas>
              </div>

              <!-- Leyenda -->
              <div class="legend-container q-mt-md">
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #f44336"></div>
                  <span>Crítico</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #ff9800"></div>
                  <span>Alto</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #ffc107"></div>
                  <span>Medio</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #4caf50"></div>
                  <span>Bajo</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Top Solicitudes Críticas -->
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6 text-weight-medium">
                  <q-icon name="priority_high" class="q-mr-sm" color="negative" />
                  Top Solicitudes Críticas
                </div>
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="Ver todas"
                  icon-right="arrow_forward"
                  :to="{ name: 'predicciones-riesgo' }"
                />
              </div>
              <q-separator class="q-mb-md" />

              <q-list separator>
                <q-item
                  v-for="pred in prediccionesCriticas.slice(0, 5)"
                  :key="pred.idSolicitud"
                  class="critical-item"
                >
                  <q-item-section avatar>
                    <q-avatar color="red-1" text-color="negative" size="40px">
                      <q-icon name="warning" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      #{{ pred.idSolicitud }} - {{ pred.nombreRol }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ pred.codigoSla }} | {{ pred.diasRestantes }} días restantes
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="text-center">
                      <div class="text-h6 text-negative text-weight-bold">
                        {{ (pred.probabilidadIncumplimiento * 100).toFixed(0) }}%
                      </div>
                      <q-badge :color="getNivelRiesgoColor(pred.nivelRiesgo)" :label="pred.nivelRiesgo" />
                    </div>
                  </q-item-section>
                </q-item>

                <q-item v-if="prediccionesCriticas.length === 0">
                  <q-item-section class="text-center text-grey-6 q-pa-lg">
                    <q-icon name="check_circle" size="48px" color="positive" class="q-mb-sm" />
                    <div>No hay solicitudes críticas</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Importancia de Variables del Modelo -->
      <q-card flat bordered class="q-mt-lg">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-weight-medium">
              <q-icon name="insights" class="q-mr-sm" color="primary" />
              Factores que Impactan las Predicciones
            </div>
            <q-btn
              flat
              dense
              icon="help_outline"
              color="primary"
              @click="mostrarAyudaImportancia = !mostrarAyudaImportancia"
            >
              <q-tooltip>¿Qué significa esto?</q-tooltip>
            </q-btn>
          </div>
          <q-separator class="q-mb-md" />

          <!-- Ayuda contextual -->
          <q-banner v-if="mostrarAyudaImportancia" rounded class="bg-blue-1 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="lightbulb" color="primary" />
            </template>
            <div class="text-body2">
              <strong>¿Cómo interpretar esta información?</strong><br>
              Las variables con mayor porcentaje tienen más influencia en las predicciones del modelo.
              Enfoca tus planes de acción en optimizar estos factores para reducir el riesgo de incumplimiento.
            </div>
          </q-banner>

          <div v-if="loadingImportancia" class="text-center q-pa-lg">
            <q-spinner color="primary" size="40px" />
            <div class="text-caption q-mt-sm">Analizando modelo...</div>
          </div>

          <div v-else-if="importanciaVariables.features && importanciaVariables.features.length > 0">
            <div v-for="feature in importanciaVariables.features" :key="feature.nombre" class="q-mb-md">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-weight-medium">{{ feature.descripcion }}</div>
                <div class="text-weight-bold text-primary">{{ feature.porcentaje.toFixed(1) }}%</div>
              </div>
              <q-linear-progress
                :value="feature.importancia"
                :color="getImportanciaColor(feature.porcentaje)"
                size="20px"
                class="rounded-borders"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge :color="getImportanciaColor(feature.porcentaje)" text-color="white">
                    {{ feature.nombre }}
                  </q-badge>
                </div>
              </q-linear-progress>
            </div>

            <!-- Recomendación -->
            <q-banner rounded class="bg-amber-1 q-mt-md">
              <template v-slot:avatar>
                <q-icon name="tips_and_updates" color="amber-8" />
              </template>
              <div class="text-body2">
                <strong>Recomendación:</strong> {{ importanciaVariables.recomendacion }}
              </div>
            </q-banner>

            <!-- Interpretación -->
            <div class="q-mt-md">
              <div class="text-caption text-grey-7 q-mb-xs">Niveles de impacto:</div>
              <div class="row q-gutter-sm">
                <q-chip dense color="red-2" text-color="red-10" size="sm">
                  <q-icon name="priority_high" left size="xs" />
                  Alto (&gt;40%): {{ importanciaVariables.interpretacion?.alto }}
                </q-chip>
                <q-chip dense color="orange-2" text-color="orange-10" size="sm">
                  <q-icon name="warning" left size="xs" />
                  Medio (20-40%): {{ importanciaVariables.interpretacion?.medio }}
                </q-chip>
                <q-chip dense color="blue-2" text-color="blue-10" size="sm">
                  <q-icon name="info" left size="xs" />
                  Bajo (&lt;20%): {{ importanciaVariables.interpretacion?.bajo }}
                </q-chip>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-grey-6 q-pa-lg">
            <q-icon name="error_outline" size="48px" />
            <div>No se pudo obtener la importancia de variables</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Gráfico de barras por SLA -->
      <q-card flat bordered class="q-mt-lg">
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            <q-icon name="bar_chart" class="q-mr-sm" />
            Predicciones por Tipo de SLA
          </div>
          <q-separator class="q-mb-md" />

          <div class="chart-container-bar">
            <canvas ref="chartBarRef"></canvas>
          </div>
        </q-card-section>
      </q-card>

      <!-- Información del modelo -->
      <q-card flat bordered class="q-mt-lg">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="psychology" size="24px" color="primary" class="q-mr-sm" />
              <span class="text-subtitle2">Estado del Modelo de Predicción</span>
            </div>
            <div class="row q-gutter-lg">
              <div class="text-center">
                <q-icon name="check_circle" :color="health?.modelLoaded ? 'positive' : 'negative'" size="24px" />
                <div class="text-caption">{{ health?.modelLoaded ? 'Modelo Activo' : 'Sin Modelo' }}</div>
              </div>
              <div class="text-center">
                <div class="text-h6 text-primary">{{ health?.version || 'N/A' }}</div>
                <div class="text-caption">Versión</div>
              </div>
              <div class="text-center">
                <div class="text-body2">{{ health?.timestamp ? formatFecha(health.timestamp) : 'N/A' }}</div>
                <div class="text-caption">Última verificación</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { usePrediccionStore } from 'stores/usePrediccionStore'
import { useAppStore } from 'stores/app-store'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const $q = useQuasar()
const prediccionStore = usePrediccionStore()
const appStore = useAppStore()

// Estados
const loading = ref(false)
const initialLoading = computed(() => !appStore.hasInitiallyLoaded)
const loadingImportancia = ref(false)
const mostrarAyudaImportancia = ref(false)

// Datos
const resumen = ref(null)
const prediccionesCriticas = ref([])
const health = ref(null)
const importanciaVariables = ref({ features: [], interpretacion: {}, recomendacion: '' })

// Refs para gráficos
const chartPieRef = ref(null)
const chartBarRef = ref(null)
let chartPieInstance = null
let chartBarInstance = null

// Métodos
const cargarDatos = async () => {
  loading.value = true
  loadingImportancia.value = true
  try {
    const [resumenData, criticasData, healthData] = await Promise.all([
      prediccionStore.fetchResumen(true),
      prediccionStore.fetchPrediccionesCriticas(10, true),
      prediccionStore.checkHealth()
    ])

    resumen.value = resumenData
    prediccionesCriticas.value = criticasData || []
    health.value = healthData

    // Cargar importancia de variables
    await cargarImportanciaVariables()

    await nextTick()
    renderCharts()

  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos del dashboard',
      caption: error.message,
      position: 'top-right'
    })
  } finally {
    loading.value = false
    loadingImportancia.value = false
    appStore.markAsLoaded()
  }
}

const cargarImportanciaVariables = async () => {
  try {
    const data = await prediccionStore.fetchImportanciaVariables()
    importanciaVariables.value = data
  } catch (error) {
    console.error('Error al cargar importancia de variables:', error)
  }
}

const calcularPorcentaje = (valor) => {
  if (!resumen.value?.totalAnalizadas || resumen.value.totalAnalizadas === 0) return 0
  return Math.round((valor / resumen.value.totalAnalizadas) * 100)
}

const getImportanciaColor = (porcentaje) => {
  if (porcentaje >= 40) return 'negative'
  if (porcentaje >= 20) return 'warning'
  return 'info'
}

const recargarDatos = async () => {
  await cargarDatos()
  $q.notify({
    type: 'positive',
    message: 'Dashboard actualizado',
    position: 'top-right',
    timeout: 2000
  })
}

const renderCharts = () => {
  renderPieChart()
  renderBarChart()
}

const renderPieChart = () => {
  if (!chartPieRef.value || !resumen.value) return

  if (chartPieInstance) {
    chartPieInstance.destroy()
  }

  const ctx = chartPieRef.value.getContext('2d')
  const data = [
    resumen.value.criticas || 0,
    resumen.value.altas || 0,
    resumen.value.medias || 0,
    resumen.value.bajas || 0
  ]

  chartPieInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Crítico', 'Alto', 'Medio', 'Bajo'],
      datasets: [{
        data: data,
        backgroundColor: ['#f44336', '#ff9800', '#ffc107', '#4caf50'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const porcentaje = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0
              return `${context.label}: ${context.raw} (${porcentaje}%)`
            }
          }
        }
      },
      cutout: '60%'
    }
  })
}

const renderBarChart = () => {
  if (!chartBarRef.value) return

  if (chartBarInstance) {
    chartBarInstance.destroy()
  }

  // Agrupar predicciones por SLA
  const porSla = {}
  prediccionesCriticas.value.forEach(p => {
    const sla = p.codigoSla || 'Sin SLA'
    if (!porSla[sla]) {
      porSla[sla] = { critico: 0, alto: 0, medio: 0, bajo: 0 }
    }
    const nivel = p.nivelRiesgo?.toLowerCase() || 'bajo'
    if (porSla[sla][nivel] !== undefined) {
      porSla[sla][nivel]++
    }
  })

  const labels = Object.keys(porSla).sort()
  const ctx = chartBarRef.value.getContext('2d')

  chartBarInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length > 0 ? labels : ['SLA1', 'SLA2', 'SLA3', 'SLA4', 'SLA5', 'SLA6'],
      datasets: [
        {
          label: 'Crítico',
          data: labels.map(sla => porSla[sla]?.critico || 0),
          backgroundColor: '#f44336'
        },
        {
          label: 'Alto',
          data: labels.map(sla => porSla[sla]?.alto || 0),
          backgroundColor: '#ff9800'
        },
        {
          label: 'Medio',
          data: labels.map(sla => porSla[sla]?.medio || 0),
          backgroundColor: '#ffc107'
        },
        {
          label: 'Bajo',
          data: labels.map(sla => porSla[sla]?.bajo || 0),
          backgroundColor: '#4caf50'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true
        }
      }
    }
  })
}

// Utilidades
const formatFecha = (valor) => {
  if (!valor) return ''
  const d = new Date(valor)
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getNivelRiesgoColor = (nivel) => {
  switch (nivel) {
    case 'CRITICO': return 'negative'
    case 'ALTO': return 'warning'
    case 'MEDIO': return 'orange'
    case 'BAJO': return 'positive'
    default: return 'grey'
  }
}

// Lifecycle
onMounted(async () => {
  await cargarDatos()
})

onBeforeUnmount(() => {
  if (chartPieInstance) chartPieInstance.destroy()
  if (chartBarInstance) chartBarInstance.destroy()
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

.kpi-card {
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kpi-card.critical {
  border-top: 3px solid #f44336;
}

.kpi-card.warning {
  border-top: 3px solid #ff9800;
}

.status-card {
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.chart-container {
  position: relative;
  height: 250px;
}

.chart-container-bar {
  position: relative;
  height: 300px;
}

.legend-container {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.critical-item {
  border-left: 3px solid #f44336;
  margin-bottom: 8px;
  border-radius: 4px;
  background: #fff5f5;
}

.critical-item:hover {
  background: #ffebee;
}
</style>
