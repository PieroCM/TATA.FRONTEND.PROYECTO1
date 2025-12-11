<!--
  Tabla de registros SLA: muestra una tarjeta con la tabla paginada.
  Recibe un array de registros y renderiza las filas usando SlaTableRow.
  Propaga eventos 'editar' y 'eliminar' hacia arriba.
  Incluye paginación en el pie de tabla (10 registros por página).
  
  RESPONSIVE:
  - Desktop: Tabla completa normal
  - Tablet: Tabla con scroll horizontal
  - Mobile: Cards expandibles con detalles
-->
<template>
  <div class="sla-table-wrapper">
    <!-- VISTA DESKTOP/TABLET: Tabla con scroll horizontal -->
    <div class="sla-table-container desktop-tablet-view">
      <div class="sla-table-card">
        <div class="table-scroll-wrapper">
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
    </div>

    <!-- VISTA MOBILE: Cards expandibles -->
    <div class="mobile-cards-view">
      <div v-if="registros.length === 0" class="empty-state">
        <q-icon name="inbox" size="48px" color="grey-4" />
        <p class="text-grey-6 q-mt-sm">No se encontraron registros</p>
      </div>

      <div v-else class="cards-container">
        <q-card
          v-for="(registro, index) in paginatedRegistros"
          :key="registro.id || index"
          flat
          bordered
          class="registro-card q-mb-md"
        >
          <!-- Header del card: Info principal -->
          <q-card-section class="card-header" @click="toggleCard(registro.id)">
            <div class="card-header__content">
              <div class="card-header__main">
                <div class="card-title">
                  <q-icon name="person" size="18px" class="q-mr-xs" color="primary" />
                  {{ registro.rol }}
                </div>
                <div class="card-badges">
                  <q-badge
                    :color="getEstadoColor(registro.estadoSolicitud)"
                    :label="registro.estadoSolicitud"
                    class="q-mr-xs"
                  />
                  <q-badge
                    :color="getCumplimientoColor(registro.cumplimientoSla)"
                    :label="getCumplimientoLabel(registro.cumplimientoSla)"
                  />
                </div>
              </div>
              <q-btn
                flat
                round
                dense
                :icon="isCardExpanded(registro.id) ? 'expand_less' : 'expand_more'"
                color="grey-7"
              />
            </div>
          </q-card-section>

          <!-- Detalles expandibles -->
          <q-slide-transition>
            <div v-show="isCardExpanded(registro.id)">
              <q-separator />
              <q-card-section class="card-details">
                <div class="detail-row">
                  <span class="detail-label">Fecha Solicitud:</span>
                  <span class="detail-value">{{ formatFecha(registro.fechaSolicitud) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha Ingreso:</span>
                  <span class="detail-value">{{
                    registro.fechaIngreso ? formatFecha(registro.fechaIngreso) : 'N/A'
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Código SLA:</span>
                  <span class="detail-value">{{ registro.codigoSla }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tipo:</span>
                  <span class="detail-value">{{ registro.tipo }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Días:</span>
                  <span class="detail-value">{{ registro.dias ?? 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Resumen:</span>
                  <span class="detail-value">{{ registro.resumenSla || 'Sin resumen' }}</span>
                </div>
              </q-card-section>

              <q-separator />

              <!-- Acciones en mobile -->
              <q-card-actions align="right" class="q-pa-md">
                <q-btn
                  flat
                  icon="edit"
                  label="Editar"
                  color="primary"
                  @click="handleEditar(registro)"
                />
                <q-btn
                  flat
                  icon="delete"
                  label="Eliminar"
                  color="negative"
                  @click="handleEliminar(registro)"
                />
              </q-card-actions>
            </div>
          </q-slide-transition>
        </q-card>
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
import {
  getCumplimientoSlaColor,
  getCumplimientoSlaLabel,
  getEstadoSolicitudColor,
} from 'src/utils/slaMappers'

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

// Estado para cards expandidos (mobile)
const expandedCards = ref(new Set())

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
    expandedCards.value.clear() // Limpiar cards expandidos
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

// Métodos para cards expandibles (mobile)
const toggleCard = (id) => {
  if (expandedCards.value.has(id)) {
    expandedCards.value.delete(id)
  } else {
    expandedCards.value.add(id)
  }
}

const isCardExpanded = (id) => {
  return expandedCards.value.has(id)
}

// Métodos auxiliares para formateo
const formatFecha = (fecha) => {
  if (!fecha) return 'N/A'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Usar mappers centralizados para cards en mobile
const getEstadoColor = (estado) => getEstadoSolicitudColor(estado)

const getCumplimientoColor = (cumplimiento) => getCumplimientoSlaColor(cumplimiento)

const getCumplimientoLabel = (cumplimiento) => getCumplimientoSlaLabel(cumplimiento)

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

/* ===== VISTA DESKTOP/TABLET ===== */
.desktop-tablet-view {
  display: block;
}

.mobile-cards-view {
  display: none;
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

/* Wrapper con scroll horizontal */
.table-scroll-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling en iOS */
}

.sla-table {
  width: 100%;
  min-width: 1000px; /* Ancho mínimo para forzar scroll en tablets */
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
  white-space: nowrap; /* Evita que los headers se rompan */
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

/* Scrollbar personalizada para el scroll horizontal */
.table-scroll-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-scroll-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ===== VISTA MOBILE: CARDS ===== */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.registro-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.registro-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  cursor: pointer;
  padding: 16px;
  background: linear-gradient(to right, #f8f9fa, #ffffff);
}

.card-header__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header__main {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-details {
  padding: 16px;
  background-color: #fafafa;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
}

.detail-value {
  color: #1e293b;
  font-size: 14px;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

/* ===== PIE DE TABLA ===== */
.sla-table-footer {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  margin-top: 12px;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

/* Tablet: 768px - 1024px - Scroll horizontal */
@media (max-width: 1024px) and (min-width: 768px) {
  .sla-table {
    min-width: 900px;
  }
}

/* Mobile: < 768px - Modo cards */
@media (max-width: 767px) {
  /* Ocultar tabla, mostrar cards */
  .desktop-tablet-view {
    display: none;
  }

  .mobile-cards-view {
    display: block;
  }

  /* Ajustar paginación para mobile */
  .sla-table-footer {
    flex-direction: column;
    gap: 12px;
    align-items: center !important;
  }

  .sla-table-footer > div:first-child {
    order: 2;
  }

  .sla-table-footer > div:last-child {
    order: 1;
  }
}

/* Mobile pequeño: < 480px */
@media (max-width: 480px) {
  .card-title {
    font-size: 14px;
  }

  .detail-row {
    flex-direction: column;
    gap: 4px;
  }

  .detail-value {
    text-align: left;
    max-width: 100%;
  }

  .card-details {
    padding: 12px;
  }

  .card-header {
    padding: 12px;
  }
}
</style>
