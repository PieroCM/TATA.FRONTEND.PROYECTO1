<!--
  Vista principal de Gestión de Registros SLA.
  Consume la API real para mostrar solicitudes.
  Permite búsqueda por rol o estado.
-->
<template>
  <q-page class="gestion-sla-page">
    <div class="gestion-sla-container">
      <!-- Título -->
      <div class="gestion-sla-header">
        <h1 class="gestion-sla-header__title">Gestión de Solicitudes SLA</h1>
        <p class="gestion-sla-header__subtitle">Crear, editar y eliminar solicitudes manualmente</p>
      </div>

      <!-- Banner informativo: Los días SLA se calculan en el backend -->
      <q-banner
        rounded
        class="bg-info text-white q-mb-md"
        style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%)"
      >
        <template v-slot:avatar>
          <q-icon name="info" size="28px" />
        </template>
        <div class="text-body2">
          <strong>Información importante:</strong> Los valores de <strong>"Días SLA"</strong>,
          <strong>"Estado Solicitud"</strong> y <strong>"Cumplimiento SLA"</strong> se recalculan
          automáticamente una vez al día en el servidor usando la hora oficial de Perú. Los datos
          que ves aquí ya están actualizados.
        </div>
      </q-banner>

      <!-- Barra de filtros -->
      <div class="gestion-sla-filters q-mb-lg">
        <SlaFilterBar
          @filtrar="handleFiltrar"
          @exportar="handleExportar"
          @nuevo-registro="handleNuevoRegistro"
        />
      </div>

      <!-- Tabla -->
      <div class="gestion-sla-table-card">
        <div v-if="loading" class="gestion-sla-loading">Cargando solicitudes...</div>
        <div v-else-if="error" class="gestion-sla-error">
          {{ error }}
        </div>
        <SlaTable
          v-else
          :registros="registrosFiltrados"
          @editar="handleEditar"
          @eliminar="handleEliminar"
        />
      </div>
    </div>

    <!-- Diálogo para crear nueva solicitud -->
    <SlaCreateDialog v-model="showCreateDialog" @registro-creado="loadSolicitudes" />

    <!-- Diálogo para editar solicitud -->
    <SlaEditDialog
      v-model="showEditDialog"
      :registro-id="selectedRegistroId"
      @registro-actualizado="loadSolicitudes"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import {
  filtrarPorCumplimientoSla,
  filtrarPorEstadoSolicitud,
  filtrarPorRangoFecha,
} from 'src/utils/slaMappers'
import SlaFilterBar from 'src/components/GestionSLA/SlaFilterBar.vue'
import SlaTable from 'src/components/GestionSLA/SlaTable.vue'
import SlaCreateDialog from 'src/components/GestionSLA/SlaCreateDialog.vue'
import SlaEditDialog from 'src/components/GestionSLA/SlaEditDialog.vue'

const $q = useQuasar()
const solicitudes = ref([])
const loading = ref(false)
const error = ref(null)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const selectedRegistroId = ref(null)
const filtros = ref({
  texto: '',
  fechaSolicitudDesde: '',
  fechaSolicitudHasta: '',
  fechaIngresoDesde: '',
  fechaIngresoHasta: '',
  estadoCumplimientoSla: 'TODOS', // EN_PROCESO, CUMPLE, NO_CUMPLE, TODOS
  estadoSolicitud: 'TODOS', // ACTIVA, INACTIVA, VENCIDA, TODOS
  codigoSla: [], // Array de códigos seleccionados
})

// Función para cargar solicitudes desde la API
const loadSolicitudes = async () => {
  loading.value = true
  error.value = null

  try {
    const { data } = await api.get('/api/Solicitud')
    solicitudes.value = data
  } catch (err) {
    error.value = 'Error al cargar las solicitudes: ' + (err.message || 'Error desconocido')
    console.error('Error al cargar solicitudes:', err)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las solicitudes',
      caption: err.message || 'Error desconocido',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadSolicitudes()
})

/**
 * Computed: Mapea las solicitudes del backend a formato de tabla
 *
 * IMPORTANTE: Los siguientes campos YA VIENEN CALCULADOS desde el backend (worker diario):
 * - numDiasSla: Días consumidos del SLA (calculado con hora de Perú)
 * - estadoSolicitud: ACTIVA, EN_PROCESO, VENCIDO, CERRADO
 * - estadoCumplimientoSla: EN_PROCESO_SLA1, CUMPLE_SLA2, NO_CUMPLE_SLA3, etc.
 *
 * NO se deben recalcular estos valores en el frontend. Solo se mapean y muestran.
 */
const registrosTabla = computed(() => {
  // Mapear y ordenar por fecha de actualización (más reciente primero)
  return solicitudes.value
    .map((solicitud) => ({
      id: solicitud.idSolicitud,
      rol: solicitud.rolRegistro?.nombreRol || '',
      fechaSolicitud: solicitud.fechaSolicitud,
      fechaIngreso: solicitud.fechaIngreso,
      codigoSla: solicitud.configSla?.codigoSla || '',
      tipo: solicitud.configSla?.tipoSolicitud || '',
      creadoEn: solicitud.creadoEn,
      actualizadoEn: solicitud.actualizadoEn,

      // ✅ Campos calculados por el worker del backend (NO recalcular aquí)
      dias: solicitud.numDiasSla, // Ya viene del backend
      estadoSolicitud: solicitud.estadoSolicitud, // Ya viene del backend
      cumplimientoSla: solicitud.estadoCumplimientoSla, // Ya viene del backend
    }))
    .sort((a, b) => {
      // Ordenar por actualizadoEn descendente (más reciente primero)
      // Si no existe actualizadoEn, usar creadoEn como fallback
      const fechaA = new Date(a.actualizadoEn || a.creadoEn)
      const fechaB = new Date(b.actualizadoEn || b.creadoEn)
      return fechaB - fechaA // Descendente (más reciente primero)
    })
})

/**
 * Computed: Aplica todos los filtros seleccionados por el usuario
 *
 * NOTA: Los filtros de fecha solo comparan valores, NO recalculan días SLA.
 * Los valores de estadoSolicitud y cumplimientoSla ya vienen del backend.
 */
const registrosFiltrados = computed(() => {
  let resultado = registrosTabla.value

  // 1. Filtro por texto de búsqueda (rol, estados, código SLA, tipo, resumen)
  if (filtros.value.texto.trim()) {
    const searchTerm = filtros.value.texto.toLowerCase()
    resultado = resultado.filter((registro) => {
      return (
        registro.rol.toLowerCase().includes(searchTerm) ||
        (registro.estadoSolicitud || '').toLowerCase().includes(searchTerm) ||
        (registro.cumplimientoSla || '').toLowerCase().includes(searchTerm) ||
        (registro.codigoSla || '').toLowerCase().includes(searchTerm) ||
        (registro.tipo || '').toLowerCase().includes(searchTerm)
      )
    })
  }

  // 2. Filtros de fecha de solicitud (usando helper centralizado)
  resultado = filtrarPorRangoFecha(
    resultado,
    'fechaSolicitud',
    filtros.value.fechaSolicitudDesde,
    filtros.value.fechaSolicitudHasta,
  )

  // 3. Filtros de fecha de ingreso (usando helper centralizado)
  resultado = filtrarPorRangoFecha(
    resultado,
    'fechaIngreso',
    filtros.value.fechaIngresoDesde,
    filtros.value.fechaIngresoHasta,
  )

  // 4. Filtro por estado de cumplimiento SLA (usando mapper centralizado)
  // ✅ Filtra por el valor que YA viene del backend (estadoCumplimientoSla)
  resultado = filtrarPorCumplimientoSla(resultado, filtros.value.estadoCumplimientoSla)

  // 5. Filtro por estado de la solicitud (usando mapper centralizado)
  // ✅ Filtra por el valor que YA viene del backend (estadoSolicitud)
  resultado = filtrarPorEstadoSolicitud(resultado, filtros.value.estadoSolicitud)

  // 6. Filtro por códigos SLA (array múltiple)
  if (filtros.value.codigoSla && filtros.value.codigoSla.length > 0) {
    resultado = resultado.filter((registro) => {
      return filtros.value.codigoSla.includes(registro.codigoSla)
    })
  }

  return resultado
})

const handleNuevoRegistro = () => {
  showCreateDialog.value = true
}

const handleFiltrar = (nuevosFiltros) => {
  filtros.value = nuevosFiltros
}

const handleExportar = () => {
  console.log('Exportar (pendiente)')
}

const handleEditar = (registro) => {
  selectedRegistroId.value = registro.id
  showEditDialog.value = true
}

const handleEliminar = (registro) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el registro?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/api/Solicitud/${registro.id}`)
      $q.notify({
        type: 'positive',
        message: 'Registro eliminado correctamente',
        position: 'top-right',
      })
      // Recargar la tabla después de eliminar
      await loadSolicitudes()
    } catch (err) {
      console.error('Error al eliminar:', err)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el registro',
        caption: err.message || 'Error desconocido',
        position: 'top-right',
      })
    }
  })
}
</script>

<style scoped>
.gestion-sla-page {
  background-color: #f5f7fb;
  min-height: 100vh;
  padding: 24px;
}

.gestion-sla-container {
  max-width: 1400px;
  margin: 0 auto;
}

.gestion-sla-header {
  margin-bottom: 24px;
}

.gestion-sla-header__title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.gestion-sla-header__subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.gestion-sla-table-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  padding: 16px 20px;
}

.gestion-sla-loading {
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 16px;
}

.gestion-sla-error {
  padding: 40px;
  text-align: center;
  color: #c62828;
  font-size: 14px;
}

/* ===== RESPONSIVE: TABLET ===== */
@media (max-width: 1024px) {
  .gestion-sla-container {
    max-width: 100%;
  }

  .gestion-sla-page {
    padding: 20px;
  }

  .gestion-sla-header__title {
    font-size: 24px;
  }
}

/* ===== RESPONSIVE: MOBILE ===== */
@media (max-width: 767px) {
  .gestion-sla-page {
    padding: 16px;
    background-color: #ffffff;
  }

  .gestion-sla-header {
    margin-bottom: 16px;
  }

  .gestion-sla-header__title {
    font-size: 20px;
  }

  .gestion-sla-header__subtitle {
    font-size: 13px;
  }

  .gestion-sla-table-card {
    padding: 12px;
    box-shadow: none;
    border-radius: 0;
    background-color: transparent;
  }

  .gestion-sla-loading,
  .gestion-sla-error {
    padding: 24px;
    font-size: 14px;
  }
}

/* ===== RESPONSIVE: MOBILE PEQUEÑO ===== */
@media (max-width: 480px) {
  .gestion-sla-page {
    padding: 12px;
  }

  .gestion-sla-header__title {
    font-size: 18px;
  }

  .gestion-sla-table-card {
    padding: 8px;
  }
}
</style>
