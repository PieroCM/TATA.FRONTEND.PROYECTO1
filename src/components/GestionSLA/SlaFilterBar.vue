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
        <!-- Fecha Solicitud -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Fecha Solicitud</label>
          <input
            v-model="fechaInicio"
            type="date"
            class="sla-filter-bar__input"
            placeholder="Fecha solicitud"
          />
        </div>

        <!-- Fecha Ingreso -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Fecha Ingreso</label>
          <input
            v-model="fechaFin"
            type="date"
            class="sla-filter-bar__input"
            placeholder="Fecha ingreso"
          />
        </div>

        <!-- Estado Solicitud -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Estado Solicitud</label>
          <select v-model="estado" class="sla-filter-bar__select">
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="PREVENTIVO">Preventivo</option>
          </select>
        </div>

        <!-- Código SLA -->
        <div class="sla-filter-bar__filter">
          <label class="sla-filter-bar__label">Código SLA</label>
          <input
            v-model="codigoSla"
            type="text"
            class="sla-filter-bar__input"
            placeholder="Ej: SLA1"
          />
        </div>

        <!-- Botón Limpiar Filtros -->
        <button class="sla-filter-bar__btn-clear" @click="limpiarFiltros">Limpiar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import SlaSearchInput from './SlaSearchInput.vue'

const emit = defineEmits(['filtrar', 'exportar', 'nuevo-registro'])

const searchText = ref('')
const fechaInicio = ref('')
const fechaFin = ref('')
const estado = ref('')
const codigoSla = ref('')

// Emitir cambios de filtros
const emitirFiltros = () => {
  emit('filtrar', {
    searchText: searchText.value,
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    estado: estado.value,
    codigoSla: codigoSla.value,
  })
}

// Watchers para emitir cambios en tiempo real
watch([searchText, fechaInicio, fechaFin, estado, codigoSla], () => {
  emitirFiltros()
})

const limpiarFiltros = () => {
  searchText.value = ''
  fechaInicio.value = ''
  fechaFin.value = ''
  estado.value = ''
  codigoSla.value = ''
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
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
