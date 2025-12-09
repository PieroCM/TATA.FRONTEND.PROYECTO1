<!--
  Barra de filtros: incluye búsqueda, filtros por fecha, estado, código SLA y botón de exportar.
  Emite eventos 'filtrar' y 'exportar'.
-->
<template>
  <q-card flat bordered class="filtros-card">
    <q-card-section>
      <!-- Header con título y acciones -->
      <div class="filtros-header q-mb-lg">
        <div class="filtros-header__title">
          <q-icon name="filter_list" color="primary" size="24px" class="q-mr-sm" />
          <h2 class="text-h6 text-weight-semibold q-ma-none">Filtros y Búsqueda</h2>
        </div>
        <div class="filtros-header__actions">
          <q-btn
            outline
            color="primary"
            icon="download"
            label="Plantilla Excel"
            @click="emitDescargarPlantilla"
            unelevated
            class="q-mr-sm"
          />
          <q-btn
            outline
            color="grey-7"
            icon="file_download"
            label="Exportar"
            @click="emitExportar"
            unelevated
            class="q-mr-sm"
          />
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Nueva Solicitud"
            @click="emitNuevoRegistro"
          />
        </div>
      </div>

      <!-- Barra de búsqueda global -->
      <div class="filtros-search q-mb-lg">
        <SlaSearchInput v-model="searchText" />
      </div>

      <!-- Tabs de filtros -->
      <div class="filtros-tabs-container q-mb-md">
        <q-btn-toggle
          v-model="tabActivo"
          spread
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="grey-3"
          text-color="grey-7"
          :options="[
            { label: 'Fechas', value: 'fechas', icon: 'event' },
            { label: 'Estados', value: 'estados', icon: 'assignment' },
            { label: 'Códigos SLA', value: 'codigos', icon: 'tag' },
          ]"
          class="filtros-tabs"
        />
      </div>

      <!-- Contenido de cada tab -->
      <transition name="fade" mode="out-in">
        <!-- Tab: Fechas -->
        <div v-if="tabActivo === 'fechas'" key="fechas" class="filtros-content">
          <div class="filtros-grid">
            <!-- Fecha Solicitud -->
            <div class="filtros-group">
              <label class="filtros-label">
                <q-icon name="calendar_today" size="18px" class="q-mr-xs" />
                Fecha Solicitud
              </label>
              <div class="filtros-date-range">
                <q-input
                  outlined
                  dense
                  v-model="fechaSolicitudDesde"
                  type="date"
                  label="Desde"
                  stack-label
                />
                <q-input
                  outlined
                  dense
                  v-model="fechaSolicitudHasta"
                  type="date"
                  label="Hasta"
                  stack-label
                />
              </div>
            </div>

            <!-- Fecha Ingreso -->
            <div class="filtros-group">
              <label class="filtros-label">
                <q-icon name="login" size="18px" class="q-mr-xs" />
                Fecha Ingreso
              </label>
              <div class="filtros-date-range">
                <q-input
                  outlined
                  dense
                  v-model="fechaIngresoDesde"
                  type="date"
                  label="Desde"
                  stack-label
                />
                <q-input
                  outlined
                  dense
                  v-model="fechaIngresoHasta"
                  type="date"
                  label="Hasta"
                  stack-label
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Estados -->
        <div v-else-if="tabActivo === 'estados'" key="estados" class="filtros-content">
          <div class="filtros-grid">
            <!-- Estado SLA (Cumplimiento) -->
            <div class="filtros-group">
              <label class="filtros-label">
                <q-icon name="trending_up" size="18px" class="q-mr-xs" />
                Estado SLA (Cumplimiento)
              </label>
              <q-select
                outlined
                dense
                v-model="estadoCumplimientoSla"
                :options="opcionesEstadoCumplimiento"
                option-value="value"
                option-label="label"
                emit-value
                map-options
              />
            </div>

            <!-- Estado de la Solicitud -->
            <div class="filtros-group">
              <label class="filtros-label">
                <q-icon name="assignment_turned_in" size="18px" class="q-mr-xs" />
                Estado de la Solicitud
              </label>
              <q-select
                outlined
                dense
                v-model="estadoSolicitud"
                :options="opcionesEstadoSolicitud"
                option-value="value"
                option-label="label"
                emit-value
                map-options
              />
            </div>
          </div>
        </div>

        <!-- Tab: Códigos SLA -->
        <div v-else-if="tabActivo === 'codigos'" key="codigos" class="filtros-content">
          <div class="filtros-group">
            <label class="filtros-label">
              <q-icon name="tag" size="18px" class="q-mr-xs" />
              Códigos SLA (Selección múltiple)
            </label>
            <q-select
              outlined
              dense
              v-model="codigoSla"
              :options="opcionesCodigoSla"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              multiple
              clearable
              use-chips
              :loading="loadingCodigos"
              placeholder="Seleccionar uno o más códigos"
            />
          </div>
        </div>
      </transition>

      <!-- Resumen de filtros activos y botón limpiar -->
      <div class="filtros-footer q-mt-lg">
        <div class="filtros-summary">
          <q-chip v-if="filtrosActivos > 0" color="primary" text-color="white" icon="filter_list">
            {{ filtrosActivos }} filtro(s) activo(s)
          </q-chip>
        </div>
        <q-btn
          v-if="filtrosActivos > 0"
          outline
          color="grey-7"
          icon="clear"
          label="Limpiar filtros"
          @click="limpiarFiltros"
          size="sm"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import SlaSearchInput from './SlaSearchInput.vue'

const emit = defineEmits(['filtrar', 'exportar', 'nuevo-registro', 'descargar-plantilla'])

// Tab activo
const tabActivo = ref('fechas')

// Filtros
const searchText = ref('')
const fechaSolicitudDesde = ref('')
const fechaSolicitudHasta = ref('')
const fechaIngresoDesde = ref('')
const fechaIngresoHasta = ref('')
const estadoCumplimientoSla = ref('TODOS')
const estadoSolicitud = ref('TODOS')
const codigoSla = ref([])
const opcionesCodigoSla = ref([])
const loadingCodigos = ref(false)

// Opciones para selectores
const opcionesEstadoCumplimiento = [
  { value: 'TODOS', label: 'Todos los estados SLA' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'CUMPLE', label: 'Cumple SLA' },
  { value: 'NO_CUMPLE', label: 'No cumple SLA' },
]

const opcionesEstadoSolicitud = [
  { value: 'TODOS', label: 'Todos los estados' },
  { value: 'ACTIVA', label: 'Activa' },
  { value: 'INACTIVA', label: 'Inactiva' },
  { value: 'VENCIDA', label: 'Vencida' },
]

// Computed: Contador de filtros activos
const filtrosActivos = computed(() => {
  let count = 0
  if (searchText.value.trim()) count++
  if (fechaSolicitudDesde.value) count++
  if (fechaSolicitudHasta.value) count++
  if (fechaIngresoDesde.value) count++
  if (fechaIngresoHasta.value) count++
  if (estadoCumplimientoSla.value !== 'TODOS') count++
  if (estadoSolicitud.value !== 'TODOS') count++
  if (codigoSla.value.length > 0) count++
  return count
})

// Cargar códigos SLA activos desde la API
const loadCodigosSla = async () => {
  loadingCodigos.value = true
  try {
    const { data } = await api.get('/api/ConfigSla')
    opcionesCodigoSla.value = data
      .filter((config) => config.esActivo === true)
      .map((config) => ({
        value: config.codigoSla,
        label: `${config.codigoSla} - ${config.tipoSolicitud || 'Sin tipo'}`,
      }))
  } catch (error) {
    console.error('Error al cargar códigos SLA:', error)
  } finally {
    loadingCodigos.value = false
  }
}

// Watchers para emitir filtros en tiempo real
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
    emitFiltros()
  },
)

const emitFiltros = () => {
  emit('filtrar', {
    texto: searchText.value,
    fechaSolicitudDesde: fechaSolicitudDesde.value,
    fechaSolicitudHasta: fechaSolicitudHasta.value,
    fechaIngresoDesde: fechaIngresoDesde.value,
    fechaIngresoHasta: fechaIngresoHasta.value,
    estadoCumplimientoSla: estadoCumplimientoSla.value,
    estadoSolicitud: estadoSolicitud.value,
    codigoSla: codigoSla.value,
  })
}

const emitExportar = () => {
  emit('exportar')
}

const emitDescargarPlantilla = () => {
  emit('descargar-plantilla')
}

const emitNuevoRegistro = () => {
  emit('nuevo-registro')
}

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

onMounted(() => {
  loadCodigosSla()
})
</script>

<style scoped>
/* ===== CARD PRINCIPAL ===== */
.filtros-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: white;
}

/* ===== HEADER ===== */
.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filtros-header__title {
  display: flex;
  align-items: center;
}

.filtros-header__actions {
  display: flex;
  gap: 12px;
}

/* ===== BÚSQUEDA ===== */
.filtros-search {
  width: 100%;
}

/* ===== TABS ===== */
.filtros-tabs-container {
  max-width: 700px;
}

.filtros-tabs {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
}

.filtros-tabs :deep(.q-btn) {
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0;
}

.filtros-tabs :deep(.q-btn__content) {
  gap: 8px;
}

/* ===== CONTENIDO DE TABS ===== */
.filtros-content {
  padding: 16px 0;
  min-height: 120px;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.filtros-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filtros-label {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.filtros-date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* ===== FOOTER ===== */
.filtros-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.filtros-summary {
  flex: 1;
}

/* ===== TRANSICIONES ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .filtros-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filtros-header__title h2 {
    font-size: 18px;
  }

  .filtros-header__actions {
    width: 100%;
    flex-direction: column;
  }

  .filtros-header__actions :deep(.q-btn) {
    width: 100%;
  }

  .filtros-tabs-container {
    max-width: 100%;
  }

  .filtros-tabs {
    height: auto;
  }

  .filtros-tabs :deep(.q-btn) {
    font-size: 13px;
    padding: 8px 12px;
  }

  .filtros-grid {
    grid-template-columns: 1fr;
  }

  .filtros-date-range {
    grid-template-columns: 1fr;
  }

  .filtros-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .filtros-card {
    border-radius: 8px;
  }

  .filtros-content {
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .filtros-card :deep(.q-card-section) {
    padding: 12px;
  }

  .filtros-header {
    margin-bottom: 12px !important;
  }

  .filtros-search {
    margin-bottom: 12px !important;
  }

  .filtros-tabs-container {
    margin-bottom: 8px !important;
  }

  .filtros-label {
    font-size: 13px;
  }

  .filtros-tabs :deep(.q-btn) {
    font-size: 12px;
    padding: 6px 8px;
  }

  .filtros-tabs :deep(.q-icon) {
    font-size: 16px;
  }
}
</style>
