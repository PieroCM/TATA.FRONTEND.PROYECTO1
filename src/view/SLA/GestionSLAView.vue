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

      <!-- Barra de filtros -->
      <div class="gestion-sla-filters">
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
  searchText: '',
  fechaInicio: '',
  fechaFin: '',
  estado: '',
  codigoSla: '',
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

const registrosTabla = computed(() => {
  // Mapear y ordenar por fecha de creación (más reciente primero)
  return solicitudes.value
    .map((solicitud) => ({
      id: solicitud.idSolicitud,
      rol: solicitud.rolRegistro?.nombreRol || '',
      fechaSolicitud: solicitud.fechaSolicitud,
      fechaIngreso: solicitud.fechaIngreso,
      codigoSla: solicitud.configSla?.codigoSla || '',
      tipo: solicitud.configSla?.tipoSolicitud || '',
      dias: solicitud.numDiasSla,
      estadoSolicitud: solicitud.estadoSolicitud,
      cumplimientoSla: solicitud.estadoCumplimientoSla,
      creadoEn: solicitud.creadoEn, // Agregar para ordenar
    }))
    .sort((a, b) => {
      // Ordenar por creadoEn descendente (más reciente primero)
      const fechaA = new Date(a.creadoEn)
      const fechaB = new Date(b.creadoEn)
      return fechaB - fechaA // Descendente
    })
})

const registrosFiltrados = computed(() => {
  return registrosTabla.value.filter((registro) => {
    // Filtro por texto de búsqueda
    if (filtros.value.searchText.trim()) {
      const searchTerm = filtros.value.searchText.toLowerCase()
      const matchSearch =
        registro.rol.toLowerCase().includes(searchTerm) ||
        (registro.estadoSolicitud || '').toLowerCase().includes(searchTerm) ||
        (registro.cumplimientoSla || '').toLowerCase().includes(searchTerm) ||
        (registro.codigoSla || '').toLowerCase().includes(searchTerm) ||
        (registro.tipo || '').toLowerCase().includes(searchTerm)

      if (!matchSearch) return false
    }

    // Filtro por rango de fechas
    // Verifica si el rango del registro (fechaSolicitud - fechaIngreso)
    // se solapa con el rango del filtro (Fecha Solicitud - Fecha Ingreso)
    // filtros.value.fechaInicio = Fecha Solicitud del filtro
    // filtros.value.fechaFin = Fecha Ingreso del filtro
    if (filtros.value.fechaInicio || filtros.value.fechaFin) {
      // Parsear fechas del registro (sin conversión de zona horaria)
      const fechaSolicitud = registro.fechaSolicitud
        ? new Date(registro.fechaSolicitud + 'T00:00:00')
        : null
      const fechaIngreso = registro.fechaIngreso
        ? new Date(registro.fechaIngreso + 'T00:00:00')
        : null

      // Parsear fechas del filtro
      const filtroInicio = filtros.value.fechaInicio
        ? new Date(filtros.value.fechaInicio + 'T00:00:00')
        : null
      const filtroFin = filtros.value.fechaFin
        ? new Date(filtros.value.fechaFin + 'T23:59:59')
        : null

      // Lógica de solapamiento de rangos:
      // El rango del registro se solapa con el rango del filtro si:
      // - El inicio del registro es <= al fin del filtro
      // - El fin del registro es >= al inicio del filtro

      if (filtroInicio && filtroFin) {
        // Ambas fechas del filtro están definidas
        const registroInicio = fechaSolicitud
        const registroFin = fechaIngreso || fechaSolicitud // Si no hay fecha ingreso, usar fecha solicitud

        // No hay solapamiento si:
        // - El registro termina antes de que empiece el filtro
        // - El registro empieza después de que termine el filtro
        if (registroFin < filtroInicio || registroInicio > filtroFin) {
          return false
        }
      } else if (filtroInicio) {
        // Solo hay fecha inicio del filtro
        const registroFin = fechaIngreso || fechaSolicitud
        if (registroFin < filtroInicio) {
          return false
        }
      } else if (filtroFin) {
        // Solo hay fecha fin del filtro
        if (fechaSolicitud > filtroFin) {
          return false
        }
      }
    }

    // Filtro por estado solicitud
    if (filtros.value.estado) {
      if (registro.estadoSolicitud !== filtros.value.estado) return false
    }

    // Filtro por código SLA
    if (filtros.value.codigoSla.trim()) {
      const codigoTerm = filtros.value.codigoSla.toLowerCase()
      if (!(registro.codigoSla || '').toLowerCase().includes(codigoTerm)) return false
    }

    return true
  })
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
  max-width: 1200px;
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

.gestion-sla-filters {
  margin-top: 16px;
  margin-bottom: 16px;
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

@media (max-width: 768px) {
  .gestion-sla-page {
    padding: 16px;
  }

  .gestion-sla-table-card {
    padding: 12px 12px;
  }
}
</style>
