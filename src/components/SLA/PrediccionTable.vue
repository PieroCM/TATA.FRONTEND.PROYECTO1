<template>
  <div class="prediccion-table-container">
    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="filter_list" class="q-mr-sm" />
          Filtros
        </div>

        <div class="row q-col-gutter-md">
          <!-- Filtro por Rol -->
          <div class="col-12 col-sm-6 col-md-3">
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
          <div class="col-12 col-sm-6 col-md-3">
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

          <!-- Filtro por Estado -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="filtroLocal.estado"
              :options="estadosUnicos"
              label="Estado"
              outlined
              dense
              clearable
              @update:model-value="aplicarFiltros"
            >
              <template v-slot:prepend>
                <q-icon name="flag" />
              </template>
            </q-select>
          </div>

          <!-- Búsqueda por ID -->
          <div class="col-12 col-sm-6 col-md-3">
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
          <q-badge color="grey-8" :label="'#' + props.row.id_solicitud" />
        </q-td>
      </template>

      <!-- Probabilidad NO Cumple -->
      <template v-slot:body-cell-prob_no_cumple="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-sm">
            <q-circular-progress
              :value="props.row.probabilidad_incumplimiento * 100"
              size="45px"
              :color="getColorProbabilidad(props.row.probabilidad_incumplimiento)"
              track-color="grey-3"
              :thickness="0.2"
              show-value
              class="text-caption"
            >
              {{ (props.row.probabilidad_incumplimiento * 100).toFixed(0) }}%
            </q-circular-progress>
            <div class="text-caption text-grey-7">
              {{ (props.row.probabilidad_incumplimiento * 100).toFixed(2) }}%
            </div>
          </div>
        </q-td>
      </template>

      <!-- Nivel de Riesgo -->
      <template v-slot:body-cell-nivel="props">
        <q-td :props="props">
          <q-chip
            :color="getColorNivel(props.row.nivel_riesgo)"
            text-color="white"
            :icon="getIconoNivel(props.row.nivel_riesgo)"
            dense
          >
            {{ props.row.nivel_riesgo }}
          </q-chip>
        </q-td>
      </template>

      <!-- Código SLA -->
      <template v-slot:body-cell-codigoSla="props">
        <q-td :props="props">
          <q-badge color="primary" :label="props.row.codigo_sla" />
        </q-td>
      </template>

      <!-- Días Restantes -->
      <template v-slot:body-cell-diasRestantes="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.dias_restantes < 0 ? 'negative' : props.row.dias_restantes < 5 ? 'warning' : 'positive'"
            :label="props.row.dias_restantes + ' días'"
          />
        </q-td>
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
  estado: null,
  busqueda: ''
})

// Paginación (ordenar por probabilidad de incumplimiento por defecto)
const paginacion = ref({
  sortBy: 'prob_no_cumple',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

// Columnas de la tabla (adaptadas a la respuesta de Python)
const columnas = [
  {
    name: 'idSolicitud',
    required: true,
    label: 'Solicitud',
    align: 'center',
    field: 'id_solicitud',
    sortable: true
  },
  {
    name: 'rolRegistro',
    label: 'Rol',
    align: 'left',
    field: 'nombre_rol',
    sortable: true
  },
  {
    name: 'codigoSla',
    label: 'SLA',
    align: 'center',
    field: 'codigo_sla',
    sortable: true
  },
  {
    name: 'diasRestantes',
    label: 'Días Restantes',
    align: 'center',
    field: 'dias_restantes',
    sortable: true
  },
  {
    name: 'prob_no_cumple',
    label: 'Probabilidad',
    align: 'center',
    field: 'probabilidad_incumplimiento',
    sortable: true
  },
  {
    name: 'nivel',
    label: 'Nivel Riesgo',
    align: 'center',
    field: 'nivel_riesgo',
    sortable: true
  },
  {
    name: 'fechaPrediccion',
    label: 'Fecha Predicción',
    align: 'center',
    field: 'fecha_prediccion',
    sortable: true,
    format: (val) => new Date(val).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
]

// Computed - Opciones únicas para filtros (adaptadas a campos Python)
const rolesUnicos = computed(() => {
  const roles = [...new Set(props.predicciones.map(p => p.nombre_rol))]
  return ['Todos', ...roles.filter(Boolean)]
})

const slaUnicos = computed(() => {
  const slas = [...new Set(props.predicciones.map(p => p.codigo_sla))]
  return ['Todos', ...slas.filter(Boolean)]
})

const estadosUnicos = computed(() => {
  const estados = [...new Set(props.predicciones.map(p => p.nivel_riesgo))]
  return ['Todos', ...estados.filter(Boolean)]
})

// Computed - Predicciones filtradas (adaptadas a campos Python)
const prediccionesFiltradas = computed(() => {
  let resultado = [...props.predicciones]

  // Filtro por rol
  if (filtroLocal.value.rol && filtroLocal.value.rol !== 'Todos') {
    resultado = resultado.filter(p => p.nombre_rol === filtroLocal.value.rol)
  }

  // Filtro por SLA
  if (filtroLocal.value.codigoSla && filtroLocal.value.codigoSla !== 'Todos') {
    resultado = resultado.filter(p => p.codigo_sla === filtroLocal.value.codigoSla)
  }

  // Filtro por nivel de riesgo
  if (filtroLocal.value.estado && filtroLocal.value.estado !== 'Todos') {
    resultado = resultado.filter(p => p.nivel_riesgo === filtroLocal.value.estado)
  }

  // Búsqueda por ID
  if (filtroLocal.value.busqueda) {
    const busqueda = filtroLocal.value.busqueda.toLowerCase()
    resultado = resultado.filter(p =>
      p.id_solicitud.toString().includes(busqueda)
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
</style>
