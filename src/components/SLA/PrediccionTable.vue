<template>
  <div class="prediccion-table-container">
    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6 text-subtitle1-sm">
            <q-icon name="filter_list" class="q-mr-sm" />
            Filtros
          </div>
          <q-btn
            v-if="hayFiltrosActivos"
            flat
            dense
            size="sm"
            color="negative"
            icon="clear_all"
            label="Limpiar"
            @click="limpiarFiltros"
          />
        </div>

        <div class="row q-col-gutter-sm q-col-gutter-md-md">
          <!-- Filtro por Rol -->
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-select
              v-model="filtroLocal.rol"
              :options="rolesUnicos"
              label="Rol"
              outlined
              dense
              clearable
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-select>
          </div>

          <!-- Filtro por Tipo SLA -->
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-select
              v-model="filtroLocal.codigoSla"
              :options="slaUnicos"
              label="Tipo SLA"
              outlined
              dense
              clearable
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>
          </div>

          <!-- Filtro por Predicción -->
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-select
              v-model="filtroLocal.prediccion"
              :options="['Todos', 'VA A CUMPLIR', 'NO VA A CUMPLIR']"
              label="Predicción"
              outlined
              dense
              clearable
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="psychology" />
              </template>
            </q-select>
          </div>

          <!-- Filtro por Estado Cumplimiento -->
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-select
              v-model="filtroLocal.estadoCumplimiento"
              :options="estadosCumplimientoUnicos"
              label="Estado Cumplimiento"
              outlined
              dense
              clearable
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="fact_check" />
              </template>
            </q-select>
          </div>

          <!-- Búsqueda por ID -->
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-input
              v-model="filtroLocal.busqueda"
              label="Buscar por ID Solicitud"
              outlined
              dense
              clearable
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de Predicciones -->
    <q-table
      :rows="prediccionesFiltradas"
      :columns="columnas"
      row-key="idSolicitud"
      :loading="loading"
      :pagination="paginacion"
      flat
      bordered
      binary-state-sort
      :grid="$q.screen.lt.md"
      class="prediccion-table"
    >
      <!-- Slot de loading -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary">
          <q-spinner-gears size="50px" color="primary" />
          <div class="text-primary q-mt-md">Cargando predicciones...</div>
        </q-inner-loading>
      </template>

      <!-- Sin datos -->
      <template v-slot:no-data="{ message }">
        <div class="full-width row flex-center text-grey-7 q-gutter-sm q-pa-lg">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>{{ message || 'No hay predicciones disponibles' }}</span>
        </div>
      </template>

      <!-- ID Solicitud -->
      <template v-slot:body-cell-idSolicitud="props">
        <q-td :props="props">
          <q-badge color="blue-grey-7" text-color="white">
            <q-icon name="tag" size="xs" class="q-mr-xs" />
            {{ props.row.idSolicitud }}
          </q-badge>
        </q-td>
      </template>

      <!-- Código SLA -->
      <template v-slot:body-cell-codigoSla="props">
        <q-td :props="props">
          <q-badge color="primary" text-color="white" size="md">
            {{ props.row.codigoSla }}
          </q-badge>
        </q-td>
      </template>

      <!-- Estado Cumplimiento SLA -->
      <template v-slot:body-cell-estadoSla="props">
        <q-td :props="props">
          <q-chip
            :color="getColorEstadoSla(props.row.estadoCumplimientoSla)"
            text-color="white"
            :icon="getIconoEstadoSla(props.row.estadoCumplimientoSla)"
            size="sm"
            dense
          >
            {{ props.row.estadoCumplimientoSla || 'N/A' }}
          </q-chip>
        </q-td>
      </template>

      <!-- Días Restantes -->
      <template v-slot:body-cell-diasRestantes="props">
        <q-td :props="props">
          <div class="text-center">
            <q-badge
              :color="props.row.diasRestantes < 0 ? 'negative' : props.row.diasRestantes < 5 ? 'warning' : 'positive'"
              text-color="white"
              size="md"
            >
              <q-icon name="schedule" size="xs" class="q-mr-xs" />
              {{ props.row.diasRestantes }} días
            </q-badge>
            <div class="text-caption text-grey-7 q-mt-xs">
              {{ props.row.diasRestantes < 0 ? '¡VENCIDO!' : props.row.diasRestantes < 5 ? 'Crítico' : 'Normal' }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- PREDICCIÓN - Columna principal clara -->
      <template v-slot:body-cell-prediccion="props">
        <q-td :props="props" class="text-center">
          <q-chip
            :color="props.row.probabilidadIncumplimiento >= 0.5 ? 'negative' : 'positive'"
            text-color="white"
            :icon="props.row.probabilidadIncumplimiento >= 0.5 ? 'cancel' : 'check_circle'"
            size="md"
            class="text-weight-bold"
          >
            {{ props.row.probabilidadIncumplimiento >= 0.5 ? 'NO VA A CUMPLIR' : 'VA A CUMPLIR' }}
          </q-chip>
        </q-td>
      </template>

      <!-- Probabilidad de Incumplimiento -->
      <template v-slot:body-cell-probabilidad="props">
        <q-td :props="props">
          <div class="column items-center q-gutter-xs">
            <q-circular-progress
              :value="props.row.probabilidadIncumplimiento * 100"
              size="60px"
              :color="getColorProbabilidad(props.row.probabilidadIncumplimiento)"
              track-color="grey-3"
              :thickness="0.15"
              show-value
              class="text-weight-bold"
            >
              {{ (props.row.probabilidadIncumplimiento * 100).toFixed(1) }}%
            </q-circular-progress>
            <div class="text-caption text-grey-7">
              de no cumplir
            </div>
          </div>
        </q-td>
      </template>

      <!-- Nivel de Riesgo -->
      <template v-slot:body-cell-nivel="props">
        <q-td :props="props">
          <q-chip
            :color="getColorNivel(props.row.nivelRiesgo)"
            text-color="white"
            :icon="getIconoNivel(props.row.nivelRiesgo)"
            size="md"
          >
            {{ props.row.nivelRiesgo }}
          </q-chip>
        </q-td>
      </template>

      <!-- Factores de Riesgo -->
      <template v-slot:body-cell-factores="props">
        <q-td :props="props">
          <div v-if="props.row.factoresRiesgo && props.row.factoresRiesgo.length > 0" class="q-gutter-xs">
            <q-chip
              v-for="(factor, index) in props.row.factoresRiesgo"
              :key="index"
              dense
              color="orange-2"
              text-color="orange-9"
              size="sm"
              icon="warning"
            >
              {{ factor }}
            </q-chip>
          </div>
          <div v-else class="text-grey-6 text-caption">
            Sin factores identificados
          </div>
        </q-td>
      </template>

      <!-- Modo Grid para móviles -->
      <template v-slot:item="props">
        <div class="col-12">
          <q-card flat bordered class="q-mb-sm">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-badge color="blue-grey-7" text-color="white">
                  <q-icon name="tag" size="xs" class="q-mr-xs" />
                  ID: {{ props.row.idSolicitud }}
                </q-badge>
                <q-space />
                <q-badge color="primary" text-color="white">
                  {{ props.row.codigoSla }}
                </q-badge>
              </div>

              <q-separator class="q-my-sm" />

              <div class="q-gutter-sm">
                <!-- Rol -->
                <div class="row items-center">
                  <q-icon name="person" size="sm" color="grey-7" class="q-mr-sm" />
                  <span class="text-caption text-grey-7">Rol:</span>
                  <span class="text-body2 q-ml-xs text-weight-medium">{{ props.row.nombreRol }}</span>
                </div>

                <!-- Estado Cumplimiento -->
                <div class="row items-center">
                  <q-icon name="fact_check" size="sm" color="grey-7" class="q-mr-sm" />
                  <span class="text-caption text-grey-7">Estado:</span>
                  <q-chip
                    :color="getColorEstadoSla(props.row.estadoCumplimientoSla)"
                    text-color="white"
                    :icon="getIconoEstadoSla(props.row.estadoCumplimientoSla)"
                    size="sm"
                    dense
                    class="q-ml-xs"
                  >
                    {{ props.row.estadoCumplimientoSla || 'N/A' }}
                  </q-chip>
                </div>

                <!-- Días Restantes -->
                <div class="row items-center">
                  <q-icon name="schedule" size="sm" color="grey-7" class="q-mr-sm" />
                  <span class="text-caption text-grey-7">Días restantes:</span>
                  <q-badge
                    :color="props.row.diasRestantes < 0 ? 'negative' : props.row.diasRestantes < 5 ? 'warning' : 'positive'"
                    text-color="white"
                    class="q-ml-xs"
                  >
                    {{ props.row.diasRestantes }} días
                  </q-badge>
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <!-- Predicción destacada -->
              <div class="text-center q-py-sm">
                <q-chip
                  :color="props.row.probabilidadIncumplimiento >= 0.5 ? 'negative' : 'positive'"
                  text-color="white"
                  :icon="props.row.probabilidadIncumplimiento >= 0.5 ? 'cancel' : 'check_circle'"
                  size="lg"
                  class="text-weight-bold"
                >
                  {{ props.row.probabilidadIncumplimiento >= 0.5 ? 'NO VA A CUMPLIR' : 'VA A CUMPLIR' }}
                </q-chip>
              </div>

              <!-- Probabilidad y Riesgo -->
              <div class="row q-gutter-md justify-around q-mt-sm">
                <div class="text-center">
                  <q-circular-progress
                    :value="props.row.probabilidadIncumplimiento * 100"
                    size="60px"
                    :color="getColorProbabilidad(props.row.probabilidadIncumplimiento)"
                    track-color="grey-3"
                    :thickness="0.15"
                    show-value
                    class="text-weight-bold"
                  >
                    {{ (props.row.probabilidadIncumplimiento * 100).toFixed(1) }}%
                  </q-circular-progress>
                  <div class="text-caption text-grey-7 q-mt-xs">Prob. incumplir</div>
                </div>
                <div class="text-center">
                  <q-chip
                    :color="getColorNivel(props.row.nivelRiesgo)"
                    text-color="white"
                    :icon="getIconoNivel(props.row.nivelRiesgo)"
                    size="md"
                  >
                    {{ props.row.nivelRiesgo }}
                  </q-chip>
                  <div class="text-caption text-grey-7 q-mt-xs">Nivel de riesgo</div>
                </div>
              </div>

              <!-- Factores de riesgo -->
              <div v-if="props.row.factoresRiesgo && props.row.factoresRiesgo.length > 0" class="q-mt-sm">
                <div class="text-caption text-grey-7 q-mb-xs">Factores de riesgo:</div>
                <div class="q-gutter-xs">
                  <q-chip
                    v-for="(factor, index) in props.row.factoresRiesgo"
                    :key="index"
                    dense
                    color="orange-2"
                    text-color="orange-9"
                    size="sm"
                    icon="warning"
                  >
                    {{ factor }}
                  </q-chip>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  predicciones: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['filtros-cambiados'])

// Estado local de filtros
const filtroLocal = ref({
  rol: null,
  codigoSla: null,
  prediccion: null,
  estadoCumplimiento: null,
  busqueda: ''
})

// Paginación (ordenar por probabilidad de incumplimiento por defecto)
const paginacion = ref({
  sortBy: 'prob_no_cumple',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

// Columnas de la tabla - Predicción clara y fácil de entender
const columnas = [
  {
    name: 'idSolicitud',
    required: true,
    label: 'ID Solicitud',
    align: 'center',
    field: 'idSolicitud',
    sortable: true,
    style: 'width: 110px'
  },
  {
    name: 'codigoSla',
    label: 'Tipo SLA',
    align: 'center',
    field: 'codigoSla',
    sortable: true,
    style: 'width: 90px'
  },
  {
    name: 'estadoSla',
    label: 'Estado Cumplimiento SLA',
    align: 'center',
    field: 'estadoCumplimientoSla',
    sortable: true,
    style: 'width: 180px'
  },
  {
    name: 'rolRegistro',
    label: 'Rol',
    align: 'left',
    field: 'nombreRol',
    sortable: true,
    style: 'width: 180px'
  },
  {
    name: 'diasRestantes',
    label: 'Días Restantes',
    align: 'center',
    field: 'diasRestantes',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'prediccion',
    label: 'PREDICCIÓN',
    align: 'center',
    field: row => row.probabilidadIncumplimiento >= 0.5 ? 'NO VA A CUMPLIR' : 'VA A CUMPLIR',
    sortable: true,
    style: 'width: 170px; font-weight: bold;'
  },
  {
    name: 'probabilidad',
    label: 'Probabilidad Incumplimiento',
    align: 'center',
    field: 'probabilidadIncumplimiento',
    sortable: true,
    style: 'width: 200px',
    format: (val) => `${(val * 100).toFixed(1)}%`
  },
  {
    name: 'nivel',
    label: 'Nivel Riesgo',
    align: 'center',
    field: 'nivelRiesgo',
    sortable: true,
    style: 'width: 130px'
  },
  {
    name: 'factores',
    label: 'Factores de Riesgo',
    align: 'left',
    field: 'factoresRiesgo',
    sortable: false,
    style: 'min-width: 220px'
  }
]// Computed - Opciones únicas para filtros (PascalCase)
const rolesUnicos = computed(() => {
  const roles = [...new Set(props.predicciones.map(p => p.nombreRol))]
  return ['Todos', ...roles.filter(Boolean)]
})

const slaUnicos = computed(() => {
  const slas = [...new Set(props.predicciones.map(p => p.codigoSla))]
  // Ordenar SLAs numéricamente (SLA1, SLA2, SLA3, etc.)
  const slasOrdenados = slas.filter(Boolean).sort((a, b) => {
    const numA = parseInt(a.replace('SLA', '')) || 0
    const numB = parseInt(b.replace('SLA', '')) || 0
    return numA - numB
  })
  return ['Todos', ...slasOrdenados]
})

const estadosCumplimientoUnicos = computed(() => {
  const estados = [...new Set(props.predicciones.map(p => p.estadoCumplimientoSla))]
  // Ordenar estados numéricamente (EN_PROCESO_SLA1, EN_PROCESO_SLA2, etc.)
  const estadosOrdenados = estados.filter(Boolean).sort((a, b) => {
    const numA = parseInt(a.match(/SLA(\d+)/)?.[1]) || 0
    const numB = parseInt(b.match(/SLA(\d+)/)?.[1]) || 0
    return numA - numB
  })
  return ['Todos', ...estadosOrdenados]
})

// Computed - Predicciones filtradas
const hayFiltrosActivos = computed(() => {
  return (
    (filtroLocal.value.rol && filtroLocal.value.rol !== 'Todos') ||
    (filtroLocal.value.codigoSla && filtroLocal.value.codigoSla !== 'Todos') ||
    (filtroLocal.value.prediccion && filtroLocal.value.prediccion !== 'Todos') ||
    (filtroLocal.value.estadoCumplimiento && filtroLocal.value.estadoCumplimiento !== 'Todos') ||
    filtroLocal.value.busqueda
  )
})

const limpiarFiltros = () => {
  filtroLocal.value = {
    rol: 'Todos',
    codigoSla: 'Todos',
    prediccion: 'Todos',
    estadoCumplimiento: 'Todos',
    busqueda: ''
  }
  aplicarFiltros()
}

const prediccionesFiltradas = computed(() => {
  let resultado = [...props.predicciones]

  // Filtro por rol
  if (filtroLocal.value.rol && filtroLocal.value.rol !== 'Todos') {
    resultado = resultado.filter(p => p.nombreRol === filtroLocal.value.rol)
  }

  // Filtro por SLA
  if (filtroLocal.value.codigoSla && filtroLocal.value.codigoSla !== 'Todos') {
    resultado = resultado.filter(p => p.codigoSla === filtroLocal.value.codigoSla)
  }

  // Filtro por predicción (VA A CUMPLIR / NO VA A CUMPLIR)
  if (filtroLocal.value.prediccion && filtroLocal.value.prediccion !== 'Todos') {
    if (filtroLocal.value.prediccion === 'NO VA A CUMPLIR') {
      resultado = resultado.filter(p => p.probabilidadIncumplimiento >= 0.5)
    } else if (filtroLocal.value.prediccion === 'VA A CUMPLIR') {
      resultado = resultado.filter(p => p.probabilidadIncumplimiento < 0.5)
    }
  }

  // Filtro por estado de cumplimiento SLA
  if (filtroLocal.value.estadoCumplimiento && filtroLocal.value.estadoCumplimiento !== 'Todos') {
    resultado = resultado.filter(p => p.estadoCumplimientoSla === filtroLocal.value.estadoCumplimiento)
  }

  // Búsqueda por ID
  if (filtroLocal.value.busqueda) {
    const busqueda = filtroLocal.value.busqueda.toLowerCase()
    resultado = resultado.filter(p =>
      p.idSolicitud.toString().includes(busqueda)
    )
  }

  return resultado
})

// Métodos
const getColorProbabilidad = (prob) => {
  if (prob >= 0.80) return 'negative' // Rojo
  if (prob >= 0.60) return 'warning'  // Naranja
  if (prob >= 0.40) return 'orange'   // Amarillo
  return 'positive'                    // Verde
}

const getColorNivel = (nivel) => {
  switch (nivel) {
    case 'CRITICO': return 'negative'
    case 'ALTO': return 'warning'
    case 'MEDIO': return 'orange'
    case 'BAJO': return 'positive'
    default: return 'grey'
  }
}

const getIconoNivel = (nivel) => {
  switch (nivel) {
    case 'CRITICO': return 'error'
    case 'ALTO': return 'warning'
    case 'MEDIO': return 'info'
    case 'BAJO': return 'check_circle'
    default: return 'help'
  }
}

const getColorEstadoSla = (estado) => {
  if (!estado) return 'grey'
  if (estado.startsWith('EN_PROCESO')) return 'blue-7'
  if (estado.startsWith('CUMPLE')) return 'positive'
  if (estado.startsWith('NO_CUMPLE')) return 'negative'
  return 'grey'
}

const getIconoEstadoSla = (estado) => {
  if (!estado) return 'help_outline'
  if (estado.startsWith('EN_PROCESO')) return 'hourglass_empty'
  if (estado.startsWith('CUMPLE')) return 'check_circle'
  if (estado.startsWith('NO_CUMPLE')) return 'cancel'
  return 'help_outline'
}

const aplicarFiltros = () => {
  emit('filtros-cambiados', filtroLocal.value)
}

// Watch para emitir cambios
watch(() => filtroLocal.value, (newVal) => {
  emit('filtros-cambiados', newVal)
}, { deep: true })
</script>

<style scoped>
.prediccion-table-container {
  width: 100%;
}

:deep(.prediccion-table .q-table__top) {
  padding: 12px;
}

:deep(.prediccion-table thead tr th) {
  background-color: #1976d2;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

:deep(.prediccion-table tbody td) {
  font-size: 13px;
}

:deep(.prediccion-table) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Estilos responsive */
@media (max-width: 599px) {
  .text-subtitle1-sm {
    font-size: 1rem !important;
  }
}

/* Grid mode cards en móviles */
:deep(.prediccion-table.q-table--grid) {
  box-shadow: none;
}

:deep(.prediccion-table.q-table--grid .q-table__grid-content) {
  padding: 0;
}

:deep(.prediccion-table.q-table--grid .q-table__grid-item) {
  padding: 0;
}

/* Mejorar espaciado en tarjetas grid */
.prediccion-table-container :deep(.q-card) {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.prediccion-table-container :deep(.q-card:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Ajustar tamaño de chips en móvil */
@media (max-width: 599px) {
  :deep(.q-chip) {
    font-size: 0.75rem;
  }

  :deep(.q-badge) {
    font-size: 0.7rem;
  }
}
</style>
