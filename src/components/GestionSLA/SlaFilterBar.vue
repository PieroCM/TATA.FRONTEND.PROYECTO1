<!--
  Barra de filtros: incluye búsqueda, filtros por fecha, estado, código SLA y botón de exportar.
  Emite eventos 'filtrar' y 'exportar'.
-->
<template>
  <div class="sla-filter-bar">
    <div class="sla-filter-bar__content">
      <!-- Primera fila: Búsqueda + Botones -->
      <div class="sla-filter-bar__top-row">
        <div class="sla-filter-bar__search">
          <SlaSearchInput v-model="searchText" />
        </div>

        <div class="sla-filter-bar__actions">
          <button class="sla-filter-bar__btn-export" @click="emitExportar">
            <span class="sla-filter-bar__btn-icon">⬇</span>
            Exportar
          </button>
          <button class="sla-filter-bar__btn-primary" @click="emitNuevoRegistro">
            <span class="sla-filter-bar__btn-icon">+</span>
            Nueva Solicitud
          </button>
        </div>
      </div>

      <!-- Segunda fila: Filtros avanzados -->
      <div class="sla-filter-bar__filters">
        <!-- Fecha Solicitud Desde -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Fecha Solicitud (desde)</label>
          <input
            v-model="fechaSolicitudDesde"
            type="date"
            class="sla-filter-bar__input"
            placeholder="Desde"
          />
        </div>

        <!-- Fecha Solicitud Hasta -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Fecha Solicitud (hasta)</label>
          <input
            v-model="fechaSolicitudHasta"
            type="date"
            class="sla-filter-bar__input"
            placeholder="Hasta"
          />
        </div>

        <!-- Fecha Ingreso Desde -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Fecha Ingreso (desde)</label>
          <input
            v-model="fechaIngresoDesde"
            type="date"
            class="sla-filter-bar__input"
            placeholder="Desde"
          />
        </div>

        <!-- Fecha Ingreso Hasta -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Fecha Ingreso (hasta)</label>
          <input
            v-model="fechaIngresoHasta"
            type="date"
            class="sla-filter-bar__input"
            placeholder="Hasta"
          />
        </div>

        <!-- Estado SLA (Cumplimiento) -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Estado SLA (cumplimiento)</label>
          <select v-model="estadoCumplimientoSla" class="sla-filter-bar__select">
            <option value="TODOS">Todos los estados SLA</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="CUMPLE">Cumple SLA</option>
            <option value="NO_CUMPLE">No cumple SLA</option>
          </select>
        </div>

        <!-- Estado de la Solicitud -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Estado de la solicitud</label>
          <select v-model="estadoSolicitud" class="sla-filter-bar__select">
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVA">Activa</option>
            <option value="INACTIVA">Inactiva</option>
            <option value="VENCIDA">Vencida</option>
          </select>
        </div>

        <!-- Código SLA (Selector Múltiple) -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Código SLA</label>
          <q-select
            v-model="codigoSla"
            :options="opcionesCodigoSla"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            multiple
            outlined
            dense
            clearable
            use-chips
            :loading="loadingCodigos"
            placeholder="Seleccionar códigos"
            class="sla-filter-bar__q-select"
          />
        </div>

        <!-- Botón Limpiar Filtros -->
        <button class="sla-filter-bar__btn-clear" @click="limpiarFiltros">Limpiar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from 'boot/axios'
import SlaSearchInput from './SlaSearchInput.vue'

const emit = defineEmits(['filtrar', 'exportar', 'nuevo-registro'])

const searchText = ref('')
const fechaSolicitudDesde = ref('')
const fechaSolicitudHasta = ref('')
const fechaIngresoDesde = ref('')
const fechaIngresoHasta = ref('')
const estadoCumplimientoSla = ref('TODOS') // EN_PROCESO, CUMPLE, NO_CUMPLE, TODOS
const estadoSolicitud = ref('TODOS') // ACTIVA, INACTIVA, VENCIDA, TODOS
const codigoSla = ref([]) // Array de códigos seleccionados
const opcionesCodigoSla = ref([]) // Opciones cargadas desde /api/ConfigSla
const loadingCodigos = ref(false)

// Cargar códigos SLA activos desde la API
const loadCodigosSla = async () => {
  loadingCodigos.value = true
  try {
    const { data } = await api.get('/api/ConfigSla')
    // Filtrar solo los activos y mapear a formato de opciones
    opcionesCodigoSla.value = data
      .filter((config) => config.esActivo === true)
      .map((config) => ({
        value: config.codigoSla,
        label: `${config.codigoSla} - ${config.tipoSolicitud || 'Sin tipo'}`,
      }))
  } catch (error) {
    console.error('Error cargando códigos SLA:', error)
    opcionesCodigoSla.value = []
  } finally {
    loadingCodigos.value = false
  }
}

onMounted(() => {
  loadCodigosSla()
})

// Emitir cambios de filtros
const emitirFiltros = () => {
  emit('filtrar', {
    texto: searchText.value,
    fechaSolicitudDesde: fechaSolicitudDesde.value,
    fechaSolicitudHasta: fechaSolicitudHasta.value,
    fechaIngresoDesde: fechaIngresoDesde.value,
    fechaIngresoHasta: fechaIngresoHasta.value,
    estadoCumplimientoSla: estadoCumplimientoSla.value,
    estadoSolicitud: estadoSolicitud.value,
    codigoSla: codigoSla.value, // Array de códigos seleccionados
  })
}

// Watchers para emitir cambios en tiempo real
watch(
  [
    searchText,
    fechaSolicitudDesde,
    fechaSolicitudHasta,
    fechaIngresoDesde,
    fechaIngresoHasta,
    estadoCumplimientoSla,
    estadoSolicitud,
    codigoSla,
  ],
  () => {
    emitirFiltros()
  },
  { deep: true },
)

const limpiarFiltros = () => {
  searchText.value = ''
  fechaSolicitudDesde.value = ''
  fechaSolicitudHasta.value = ''
  fechaIngresoDesde.value = ''
  fechaIngresoHasta.value = ''
  estadoCumplimientoSla.value = 'TODOS'
  estadoSolicitud.value = 'TODOS'
  codigoSla.value = []
}

const emitExportar = () => {
  emit('exportar')
}

const emitNuevoRegistro = () => {
  emit('nuevo-registro')
}
</script>

<style scoped>
.sla-filter-bar {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.sla-filter-bar__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sla-filter-bar__top-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sla-filter-bar__search {
  flex: 1;
}

.sla-filter-bar__actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sla-filter-bar__filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;
}

@media (min-width: 1400px) {
  .sla-filter-bar__filters {
    grid-template-columns: repeat(4, 1fr);
  }
}

.sla-filter-bar__filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sla-filter-bar__label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
}

.sla-filter-bar__input,
.sla-filter-bar__select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background-color: white;
  transition: all 0.2s;
}

.sla-filter-bar__input:focus,
.sla-filter-bar__select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.sla-filter-bar__select {
  cursor: pointer;
}

.sla-filter-bar__q-select {
  min-width: 200px;
}

.sla-filter-bar__q-select :deep(.q-field__control) {
  min-height: 40px;
}

.sla-filter-bar__btn-clear {
  padding: 10px 16px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  height: 40px;
}

.sla-filter-bar__btn-clear:hover {
  background-color: #e8e8e8;
  border-color: #b0b0b0;
}

.sla-filter-bar__btn-export {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  background-color: white;
  color: #1976d2;
  border: 1px solid #1976d2;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  align-self: flex-end;
}

.sla-filter-bar__btn-export:hover {
  background-color: #1976d2;
  color: white;
}

.sla-filter-bar__btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.sla-filter-bar__btn-primary:hover {
  background-color: #1565c0;
}

.sla-filter-bar__btn-icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .sla-filter-bar__top-row {
    flex-direction: column;
    align-items: stretch;
  }

  .sla-filter-bar__actions {
    flex-direction: column;
  }

  .sla-filter-bar__filters {
    grid-template-columns: 1fr;
  }
}
</style>
