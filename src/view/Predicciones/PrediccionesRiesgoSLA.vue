<template>
  <q-page class="dashboard-page">
    <!-- Loading Fullscreen -->
    <div v-if="initialLoading" class="fullscreen-loading">
      <div class="loading-content">
        <q-spinner-gears size="80px" color="primary" />
        <div class="text-h6 q-mt-lg text-primary">Cargando predicciones...</div>
      </div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="dashboard-header q-mb-lg">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="psychology" size="40px" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h5 text-weight-medium">Predicción de Riesgo SLA</div>
              <div class="text-grey-7">
                Análisis predictivo de solicitudes con probabilidad de incumplimiento
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
            <q-btn
              color="primary"
              icon="model_training"
              label="Reentrenar Modelo"
              :loading="reentrenando"
              @click="reentrenarModelo"
            />
          </div>
        </div>
      </div>

      <!-- Cards de resumen -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="row items-center">
                <q-icon name="analytics" size="40px" color="primary" class="q-mr-md" />
                <div>
                  <div class="text-h4 text-weight-bold text-primary">
                    {{ resumen?.totalAnalizadas || 0 }}
                  </div>
                  <div class="text-caption text-grey-7">Total Analizadas</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card critical">
            <q-card-section>
              <div class="row items-center">
                <q-icon name="error" size="40px" color="negative" class="q-mr-md" />
                <div>
                  <div class="text-h4 text-weight-bold text-negative">
                    {{ resumen?.criticas || 0 }}
                  </div>
                  <div class="text-caption text-grey-7">Riesgo Crítico</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card warning">
            <q-card-section>
              <div class="row items-center">
                <q-icon name="warning" size="40px" color="warning" class="q-mr-md" />
                <div>
                  <div class="text-h4 text-weight-bold text-warning">
                    {{ resumen?.altas || 0 }}
                  </div>
                  <div class="text-caption text-grey-7">Riesgo Alto</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="row items-center">
                <q-icon name="speed" size="40px" color="info" class="q-mr-md" />
                <div>
                  <div class="text-h4 text-weight-bold text-info">
                    {{ resumen?.promedioRiesgo?.toFixed(1) || 0 }}%
                  </div>
                  <div class="text-caption text-grey-7">Promedio Riesgo</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Card de Filtros -->
      <q-card flat bordered class="filters-card q-mb-lg">
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            <q-icon name="filter_list" class="q-mr-sm" />
            Filtros de Predicción
          </div>
          <q-separator class="q-mb-md" />

          <div class="row q-col-gutter-md">
            <!-- Nivel de Riesgo -->
            <div class="col-12 col-md-3">
              <q-select
                v-model="filtros.nivelRiesgo"
                :options="nivelesRiesgoOptions"
                label="Nivel de Riesgo"
                outlined
                dense
                clearable
                emit-value
                map-options
                behavior="menu"
              >
                <template v-slot:prepend>
                  <q-icon name="warning" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Código SLA -->
            <div class="col-12 col-md-3">
              <q-select
                v-model="filtros.codigoSla"
                :options="codigosSlaOptions"
                label="Código SLA"
                outlined
                dense
                clearable
                emit-value
                map-options
                behavior="menu"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="primary" />
                </template>
              </q-select>
            </div>

            <!-- Búsqueda por Rol -->
            <div class="col-12 col-md-3">
              <q-input
                v-model="filtros.busqueda"
                label="Buscar por Rol"
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
              </q-input>
            </div>

            <!-- Días restantes -->
            <div class="col-12 col-md-3">
              <q-select
                v-model="filtros.diasRestantes"
                :options="diasRestantesOptions"
                label="Días Restantes"
                outlined
                dense
                clearable
                emit-value
                map-options
                behavior="menu"
              >
                <template v-slot:prepend>
                  <q-icon name="schedule" color="primary" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Chips de filtros activos -->
          <div v-if="filtrosActivos.length > 0" class="q-mt-md filters-summary">
            <div class="filters-summary-title text-caption q-mb-sm">Filtros aplicados:</div>
            <div class="row q-gutter-sm">
              <q-chip
                v-for="chip in filtrosActivos"
                :key="chip.key"
                color="grey-7"
                text-color="white"
                class="chip-padding"
                :icon="chip.icon"
                removable
                @remove="removerFiltro(chip.key)"
              >
                {{ chip.label }}
              </q-chip>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row q-gutter-md">
            <q-btn
              color="primary"
              label="Aplicar Filtros"
              icon="search"
              @click="aplicarFiltros"
              :loading="loading"
            />
            <q-btn
              outline
              color="grey-7"
              label="Limpiar filtros"
              icon="refresh"
              @click="limpiarFiltros"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla de Predicciones -->
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-weight-medium">
              <q-icon name="table_chart" class="q-mr-sm" />
              Predicciones de Riesgo
            </div>
            <div class="text-caption text-grey-7">
              Mostrando {{ prediccionesFiltradas.length }} de {{ paginacion.totalRegistros }} registros
            </div>
          </div>
          <q-separator class="q-mb-md" />

          <!-- Loading -->
          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>

          <!-- Sin datos -->
          <div v-if="!loading && prediccionesFiltradas.length === 0" class="text-center q-pa-xl">
            <q-icon name="psychology" size="80px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">
              No hay predicciones disponibles
            </div>
            <div class="text-body2 text-grey-6 q-mt-sm">
              El modelo aún no ha generado predicciones o no hay solicitudes activas.
            </div>
          </div>

          <!-- Tabla -->
          <q-table
            v-else
            :rows="prediccionesFiltradas"
            :columns="columnas"
            row-key="idSolicitud"
            flat
            bordered
            :loading="loading"
            :pagination="tablePagination"
            @request="onRequest"
            class="prediccion-table"
          >
            <!-- ID Solicitud -->
            <template v-slot:body-cell-idSolicitud="props">
              <q-td :props="props">
                <span class="text-weight-medium">#{{ props.row.idSolicitud }}</span>
              </q-td>
            </template>

            <!-- Código SLA -->
            <template v-slot:body-cell-codigoSla="props">
              <q-td :props="props">
                <q-badge color="primary" :label="props.row.codigoSla" />
              </q-td>
            </template>

            <!-- Nombre Rol -->
            <template v-slot:body-cell-nombreRol="props">
              <q-td :props="props">
                <div class="ellipsis" style="max-width: 200px;">
                  {{ props.row.nombreRol }}
                </div>
              </q-td>
            </template>

            <!-- Probabilidad -->
            <template v-slot:body-cell-probabilidadIncumplimiento="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-sm">
                  <q-linear-progress
                    :value="props.row.probabilidadIncumplimiento"
                    :color="getProgressColor(props.row.probabilidadIncumplimiento)"
                    class="progress-bar"
                    rounded
                    size="8px"
                    style="width: 80px;"
                  />
                  <span class="text-weight-medium">
                    {{ (props.row.probabilidadIncumplimiento * 100).toFixed(1) }}%
                  </span>
                </div>
              </q-td>
            </template>

            <!-- Nivel de Riesgo -->
            <template v-slot:body-cell-nivelRiesgo="props">
              <q-td :props="props">
                <q-badge
                  :color="getNivelRiesgoColor(props.row.nivelRiesgo)"
                  :label="props.row.nivelRiesgo"
                />
              </q-td>
            </template>

            <!-- Días Restantes -->
            <template v-slot:body-cell-diasRestantes="props">
              <q-td :props="props">
                <span :class="getDiasRestantesClass(props.row.diasRestantes)">
                  {{ props.row.diasRestantes }} días
                </span>
              </q-td>
            </template>

            <!-- Factores de Riesgo -->
            <template v-slot:body-cell-factoresRiesgo="props">
              <q-td :props="props">
                <div v-if="props.row.factoresRiesgo?.length > 0">
                  <q-chip
                    v-for="(factor, idx) in props.row.factoresRiesgo.slice(0, 2)"
                    :key="idx"
                    size="sm"
                    color="orange-2"
                    text-color="orange-10"
                    class="q-mr-xs"
                  >
                    {{ truncate(factor, 25) }}
                  </q-chip>
                  <q-tooltip v-if="props.row.factoresRiesgo.length > 0">
                    <div v-for="(f, i) in props.row.factoresRiesgo" :key="i">• {{ f }}</div>
                  </q-tooltip>
                </div>
                <span v-else class="text-grey-6">-</span>
              </q-td>
            </template>

            <!-- Fecha Predicción -->
            <template v-slot:body-cell-fechaPrediccion="props">
              <q-td :props="props">
                {{ formatFecha(props.row.fechaPrediccion) }}
              </q-td>
            </template>
          </q-table>

          <!-- Botón cargar más -->
          <div v-if="hayMasPaginas" class="row justify-center q-mt-md">
            <q-btn
              outline
              color="primary"
              label="Cargar más predicciones"
              icon="expand_more"
              :loading="loadingMore"
              @click="cargarMas"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Información del modelo -->
      <q-card flat bordered class="q-mt-lg">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-icon name="info" size="24px" color="info" class="q-mr-sm" />
              <span class="text-subtitle2">Información del Modelo ML</span>
            </div>
            <div class="row q-gutter-md text-caption text-grey-7">
              <span><strong>Precisión:</strong> {{ modelInfo?.accuracy ? (modelInfo.accuracy * 100).toFixed(1) + '%' : 'N/A' }}</span>
              <span><strong>Muestras:</strong> {{ modelInfo?.samplesUsed || 'N/A' }}</span>
              <span><strong>Última actualización:</strong> {{ modelInfo?.timestamp ? formatFecha(modelInfo.timestamp) : 'N/A' }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePrediccionStore } from 'stores/usePrediccionStore'
import { useAppStore } from 'stores/app-store'

const $q = useQuasar()
const prediccionStore = usePrediccionStore()
const appStore = useAppStore()

// Estados
const loading = ref(false)
const loadingMore = ref(false)
const reentrenando = ref(false)
const initialLoading = computed(() => !appStore.hasInitiallyLoaded)

// Datos
const resumen = ref(null)
const predicciones = ref([])
const modelInfo = ref(null)

// Paginación
const paginacion = ref({
  pagina: 1,
  tamanoPagina: 50,
  totalRegistros: 0,
  totalPaginas: 0
})

const tablePagination = ref({
  sortBy: 'probabilidadIncumplimiento',
  descending: true,
  page: 1,
  rowsPerPage: 20
})

// Filtros
const filtros = ref({
  nivelRiesgo: null,
  codigoSla: null,
  busqueda: '',
  diasRestantes: null
})

// Opciones de filtros
const nivelesRiesgoOptions = [
  { label: 'Todos', value: null },
  { label: 'Crítico', value: 'CRITICO' },
  { label: 'Alto', value: 'ALTO' },
  { label: 'Medio', value: 'MEDIO' },
  { label: 'Bajo', value: 'BAJO' }
]

// Opciones dinámicas desde la BD
const codigosSlaOptions = ref([{ label: 'Todos', value: null }])

const diasRestantesOptions = [
  { label: 'Todos', value: null },
  { label: 'Vencidos', value: 'vencido' },
  { label: 'Menos de 3 días', value: '3' },
  { label: 'Menos de 7 días', value: '7' },
  { label: 'Menos de 15 días', value: '15' },
  { label: 'Más de 15 días', value: '15+' }
]

// Columnas de la tabla
const columnas = [
  { name: 'idSolicitud', label: 'ID', field: 'idSolicitud', align: 'center', sortable: true },
  { name: 'codigoSla', label: 'SLA', field: 'codigoSla', align: 'center', sortable: true },
  { name: 'nombreRol', label: 'Rol', field: 'nombreRol', align: 'left', sortable: true },
  { name: 'probabilidadIncumplimiento', label: 'Probabilidad', field: 'probabilidadIncumplimiento', align: 'center', sortable: true },
  { name: 'nivelRiesgo', label: 'Nivel Riesgo', field: 'nivelRiesgo', align: 'center', sortable: true },
  { name: 'diasRestantes', label: 'Días Restantes', field: 'diasRestantes', align: 'center', sortable: true },
  { name: 'factoresRiesgo', label: 'Factores de Riesgo', field: 'factoresRiesgo', align: 'left' },
  { name: 'fechaPrediccion', label: 'Fecha Predicción', field: 'fechaPrediccion', align: 'center', sortable: true }
]

// Computeds
const prediccionesFiltradas = computed(() => {
  let resultado = [...predicciones.value]

  // Filtro por nivel de riesgo
  if (filtros.value.nivelRiesgo) {
    resultado = resultado.filter(p => p.nivelRiesgo === filtros.value.nivelRiesgo)
  }

  // Filtro por código SLA
  if (filtros.value.codigoSla) {
    resultado = resultado.filter(p => p.codigoSla === filtros.value.codigoSla)
  }

  // Filtro por búsqueda (rol)
  if (filtros.value.busqueda?.trim()) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(p =>
      p.nombreRol?.toLowerCase().includes(busqueda) ||
      p.codigoSla?.toLowerCase().includes(busqueda)
    )
  }

  // Filtro por días restantes
  if (filtros.value.diasRestantes) {
    switch (filtros.value.diasRestantes) {
      case 'vencido':
        resultado = resultado.filter(p => p.diasRestantes < 0)
        break
      case '3':
        resultado = resultado.filter(p => p.diasRestantes >= 0 && p.diasRestantes <= 3)
        break
      case '7':
        resultado = resultado.filter(p => p.diasRestantes >= 0 && p.diasRestantes <= 7)
        break
      case '15':
        resultado = resultado.filter(p => p.diasRestantes >= 0 && p.diasRestantes <= 15)
        break
      case '15+':
        resultado = resultado.filter(p => p.diasRestantes > 15)
        break
    }
  }

  return resultado
})

const hayMasPaginas = computed(() => {
  return paginacion.value.pagina < paginacion.value.totalPaginas
})

const filtrosActivos = computed(() => {
  const activos = []

  if (filtros.value.nivelRiesgo) {
    activos.push({
      key: 'nivelRiesgo',
      label: `Riesgo: ${filtros.value.nivelRiesgo}`,
      icon: 'warning'
    })
  }

  if (filtros.value.codigoSla) {
    activos.push({
      key: 'codigoSla',
      label: `SLA: ${filtros.value.codigoSla}`,
      icon: 'category'
    })
  }

  if (filtros.value.busqueda?.trim()) {
    activos.push({
      key: 'busqueda',
      label: `Búsqueda: ${filtros.value.busqueda}`,
      icon: 'search'
    })
  }

  if (filtros.value.diasRestantes) {
    const opcion = diasRestantesOptions.find(o => o.value === filtros.value.diasRestantes)
    activos.push({
      key: 'diasRestantes',
      label: `Días: ${opcion?.label || filtros.value.diasRestantes}`,
      icon: 'schedule'
    })
  }

  return activos
})

// Métodos
const cargarDatos = async (codigoSlaFiltro = null) => {
  loading.value = true
  try {
    // Cargar resumen y predicciones en paralelo
    // Si hay filtro de SLA, enviarlo al servidor
    const [resumenData, prediccionesData] = await Promise.all([
      prediccionStore.fetchResumen(true),
      prediccionStore.fetchPrediccionesPaginadas(1, 100, true, codigoSlaFiltro)
    ])

    resumen.value = resumenData
    predicciones.value = prediccionesData || []
    paginacion.value = { ...prediccionStore.paginacion }

  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar predicciones',
      caption: error.message || 'Error desconocido',
      position: 'top-right'
    })
  } finally {
    loading.value = false
    appStore.markAsLoaded()
  }
}

const recargarDatos = async () => {
  // Recargar con el filtro de SLA actual si existe
  await cargarDatos(filtros.value.codigoSla)
  $q.notify({
    type: 'positive',
    message: 'Datos actualizados',
    position: 'top-right',
    timeout: 2000
  })
}

const cargarMas = async () => {
  loadingMore.value = true
  try {
    const nuevas = await prediccionStore.cargarMasPaginas()
    if (nuevas?.length) {
      predicciones.value = [...predicciones.value, ...nuevas]
      paginacion.value = { ...prediccionStore.paginacion }
    }
  } catch (error) {
    console.error('Error al cargar más:', error)
  } finally {
    loadingMore.value = false
  }
}

const reentrenarModelo = async () => {
  reentrenando.value = true
  try {
    const resultado = await prediccionStore.reentrenarModelo()
    modelInfo.value = resultado

    $q.notify({
      type: 'positive',
      message: 'Modelo reentrenado exitosamente',
      caption: `Precisión: ${(resultado.accuracy * 100).toFixed(1)}% con ${resultado.samplesUsed} muestras`,
      position: 'top-right',
      timeout: 5000
    })

    // Recargar predicciones con el nuevo modelo
    await cargarDatos()
  } catch (error) {
    console.error('Error al reentrenar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al reentrenar el modelo',
      caption: error.message,
      position: 'top-right'
    })
  } finally {
    reentrenando.value = false
  }
}

const aplicarFiltros = async () => {
  // Si hay filtro de SLA, recargar datos desde el servidor
  if (filtros.value.codigoSla) {
    await cargarDatos(filtros.value.codigoSla)
  }
  $q.notify({
    type: 'info',
    message: 'Filtros aplicados',
    position: 'top-right',
    timeout: 1500
  })
}

const limpiarFiltros = async () => {
  filtros.value = {
    nivelRiesgo: null,
    codigoSla: null,
    busqueda: '',
    diasRestantes: null
  }
  // Recargar sin filtro de SLA
  await cargarDatos(null)
}

const removerFiltro = (key) => {
  if (key === 'busqueda') {
    filtros.value.busqueda = ''
  } else {
    filtros.value[key] = null
  }
}

const onRequest = (props) => {
  tablePagination.value = props.pagination
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

const truncate = (str, maxLength) => {
  if (!str) return ''
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}

const getProgressColor = (probabilidad) => {
  if (probabilidad >= 0.8) return 'negative'
  if (probabilidad >= 0.6) return 'warning'
  if (probabilidad >= 0.4) return 'orange'
  return 'positive'
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

const getDiasRestantesClass = (dias) => {
  if (dias < 0) return 'text-negative text-weight-bold'
  if (dias <= 3) return 'text-warning text-weight-bold'
  if (dias <= 7) return 'text-orange text-weight-medium'
  return 'text-positive'
}

// Cargar filtros dinámicos desde la BD
const cargarFiltros = async () => {
  try {
    const filtrosData = await prediccionStore.fetchFiltrosDisponibles()

    // Actualizar opciones de SLA - Solo mostrar el código
    codigosSlaOptions.value = [
      { label: 'Todos', value: null },
      ...filtrosData.codigosSla.map(sla => ({
        label: sla.codigo,
        value: sla.codigo
      }))
    ]
  } catch (error) {
    console.error('Error al cargar filtros:', error)
  }
}

// Lifecycle
onMounted(async () => {
  // Cargar filtros y datos en paralelo
  await Promise.all([
    cargarFiltros(),
    cargarDatos()
  ])
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
  border-radius: 8px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-card.critical {
  border-left: 4px solid #f44336;
}

.summary-card.warning {
  border-left: 4px solid #ff9800;
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

.filters-summary {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}

.filters-summary-title {
  color: #666;
  font-weight: 500;
}

.chip-padding {
  padding: 17px 20px !important;
}

.progress-bar {
  border-radius: 4px;
}

.ellipsis {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.prediccion-table thead tr th) {
  background-color: #eaf2f9 !important;
  font-weight: 600;
}

:deep(.q-table__card) {
  font-size: 14px;
}

:deep(.q-table th),
:deep(.q-table td) {
  font-size: 14px;
}
</style>
