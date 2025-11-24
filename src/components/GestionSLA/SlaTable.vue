<!--
  Tabla de registros SLA: muestra una tarjeta con la tabla paginada.
  Recibe un array de registros y renderiza las filas usando SlaTableRow.
  Propaga eventos 'editar' y 'eliminar' hacia arriba.
  Incluye paginación en el pie de tabla (10 registros por página).
-->
<template>
  <div class="sla-table-wrapper">
    <div class="sla-table-container">
      <div class="sla-table-card">
        <table class="sla-table">
          <thead class="sla-table__head">
            <tr>
              <th class="sla-table__header">Rol</th>
              <th class="sla-table__header">Fecha Solicitud</th>
              <th class="sla-table__header">Fecha Ingreso</th>
              <th class="sla-table__header">Código SLA</th>
              <th class="sla-table__header">Tipo</th>
              <th class="sla-table__header">Días</th>
              <th class="sla-table__header">Estado Solicitud</th>
              <th class="sla-table__header">Cumplimiento SLA</th>
              <th class="sla-table__header sla-table__header--center">Acciones</th>
            </tr>
          </thead>
          <tbody class="sla-table__body">
            <SlaTableRow
              v-for="(registro, index) in paginatedRegistros"
              :key="registro.id || index"
              :registro="registro"
              @editar="handleEditar"
              @eliminar="handleEliminar"
            />
            <tr v-if="registros.length === 0">
              <td colspan="9" class="sla-table__empty">No se encontraron registros</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pie de tabla: paginación -->
    <div
      v-if="totalRegistros > 0"
      class="sla-table-footer row items-center justify-between q-mt-md"
    >
      <div class="text-caption text-grey-7">
        Mostrando {{ startIndexDisplay }}–{{ endIndexDisplay }} de {{ totalRegistros }} registros
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          flat
          round
          dense
          icon="chevron_left"
          :disable="currentPage === 1 || totalRegistros === 0"
          @click="goPrevPage"
          title="Página anterior"
        />
        <span class="text-caption"> Página {{ currentPage }} de {{ totalPages }} </span>
        <q-btn
          flat
          round
          dense
          icon="chevron_right"
          :disable="currentPage === totalPages || totalRegistros === 0"
          @click="goNextPage"
          title="Página siguiente"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SlaTableRow from './SlaTableRow.vue'

const props = defineProps({
  registros: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['editar', 'eliminar'])

// Estado de paginación
const pageSize = ref(10) // 10 registros por página
const currentPage = ref(1) // página actual

// Computados
const totalRegistros = computed(() => props.registros.length)

const totalPages = computed(() => {
  return totalRegistros.value === 0 ? 1 : Math.ceil(totalRegistros.value / pageSize.value)
})

// Si cambia la lista de registros, regresamos a la página 1
watch(
  () => props.registros,
  () => {
    currentPage.value = 1
  },
)

const paginatedRegistros = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.registros.slice(start, end)
})

const startIndexDisplay = computed(() => {
  if (totalRegistros.value === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const endIndexDisplay = computed(() => {
  const end = currentPage.value * pageSize.value
  return end > totalRegistros.value ? totalRegistros.value : end
})

// Métodos de navegación
const goPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const handleEditar = (registro) => {
  emit('editar', registro)
}

const handleEliminar = (registro) => {
  emit('eliminar', registro)
}
</script>

<style scoped>
.sla-table-wrapper {
  width: 100%;
}

.sla-table-container {
  width: 100%;
}

.sla-table-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.sla-table {
  width: 100%;
  border-collapse: collapse;
}

.sla-table__head {
  background-color: #f5f5f5;
}

.sla-table__header {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
}

.sla-table__header--center {
  text-align: center;
}

.sla-table__body {
  background-color: white;
}

.sla-table__empty {
  padding: 40px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* Pie de tabla: paginación */
.sla-table-footer {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  margin-top: 12px;
}
</style>
