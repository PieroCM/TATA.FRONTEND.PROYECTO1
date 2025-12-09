<!--
  Diálogo de exportación de Solicitudes SLA a PDF.
  Permite filtrar por fechas, cumplimiento SLA y rol de registro antes de exportar.
-->
<template>
  <q-dialog v-model="show" persistent>
    <q-card class="export-dialog-card">
      <!-- HEADER -->
      <q-card-section class="export-dialog-header">
        <div class="export-dialog-header__content">
          <q-icon name="file_download" color="primary" size="32px" />
          <div>
            <h2 class="export-dialog-header__title">Exportar Solicitudes SLA</h2>
            <p class="export-dialog-header__subtitle">Configura los filtros y genera el reporte PDF</p>
          </div>
        </div>
        <q-btn icon="close" flat round dense @click="cerrar" />
      </q-card-section>

      <q-separator />

      <!-- BODY: FILTROS -->
      <q-card-section class="export-dialog-body">
        <!-- Sección: Fechas -->
        <div class="export-dialog-section">
          <label class="export-dialog-label">
            <q-icon name="event" size="20px" class="q-mr-xs" />
            Rango de Fecha de Solicitud
          </label>
          <div class="export-dialog-date-range">
            <q-input
              outlined
              dense
              v-model="filtrosExportacion.fechaSolicitudDesde"
              type="date"
              label="Desde"
              stack-label
            />
            <q-input
              outlined
              dense
              v-model="filtrosExportacion.fechaSolicitudHasta"
              type="date"
              label="Hasta"
              stack-label
            />
          </div>
        </div>

        <div class="export-dialog-section">
          <label class="export-dialog-label">
            <q-icon name="login" size="20px" class="q-mr-xs" />
            Rango de Fecha de Ingreso (Opcional)
          </label>
          <div class="export-dialog-date-range">
            <q-input
              outlined
              dense
              v-model="filtrosExportacion.fechaIngresoDesde"
              type="date"
              label="Desde"
              stack-label
              clearable
            />
            <q-input
              outlined
              dense
              v-model="filtrosExportacion.fechaIngresoHasta"
              type="date"
              label="Hasta"
              stack-label
              clearable
            />
          </div>
        </div>

        <!-- Sección: Estados -->
        <div class="export-dialog-section">
          <label class="export-dialog-label">
            <q-icon name="trending_up" size="20px" class="q-mr-xs" />
            Estado de Cumplimiento SLA
          </label>
          <q-select
            outlined
            dense
            v-model="filtrosExportacion.estadoCumplimientoSla"
            :options="opcionesEstadoCumplimiento"
            option-value="value"
            option-label="label"
            emit-value
            map-options
          />
        </div>

        <div class="export-dialog-section">
          <label class="export-dialog-label">
            <q-icon name="assignment_turned_in" size="20px" class="q-mr-xs" />
            Estado de la Solicitud
          </label>
          <q-select
            outlined
            dense
            v-model="filtrosExportacion.estadoSolicitud"
            :options="opcionesEstadoSolicitud"
            option-value="value"
            option-label="label"
            emit-value
            map-options
          />
        </div>

        <!-- Sección: Rol de Registro -->
        <div class="export-dialog-section">
          <label class="export-dialog-label">
            <q-icon name="badge" size="20px" class="q-mr-xs" />
            Rol de Registro (Opcional)
          </label>
          <q-select
            outlined
            dense
            v-model="filtrosExportacion.rolesRegistro"
            :options="opcionesRoles"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            multiple
            clearable
            use-chips
            :loading="loadingRoles"
            placeholder="Seleccionar uno o más roles"
          />
        </div>

        <!-- Resumen de registros a exportar -->
        <q-banner
          v-if="totalRegistrosFiltrados > 0"
          rounded
          class="bg-info text-white q-mt-md"
        >
          <template v-slot:avatar>
            <q-icon name="info" size="24px" />
          </template>
          <div class="text-body2">
            Se exportarán <strong>{{ totalRegistrosFiltrados }}</strong> registro(s) que coinciden con los filtros seleccionados.
          </div>
        </q-banner>

        <q-banner
          v-else
          rounded
          class="bg-warning text-white q-mt-md"
        >
          <template v-slot:avatar>
            <q-icon name="warning" size="24px" />
          </template>
          <div class="text-body2">
            <strong>No hay registros</strong> que coincidan con los filtros seleccionados. Ajusta los criterios.
          </div>
        </q-banner>
      </q-card-section>

      <q-separator />

      <!-- FOOTER: ACCIONES -->
      <q-card-actions class="export-dialog-actions">
        <q-btn
          outline
          color="grey-7"
          label="Cancelar"
          @click="cerrar"
          no-caps
        />
        <q-btn
          unelevated
          color="primary"
          icon="picture_as_pdf"
          label="Exportar PDF"
          @click="exportar"
          :disable="totalRegistrosFiltrados === 0"
          :loading="exportando"
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from 'boot/axios'
import {
  filtrarPorCumplimientoSla,
  filtrarPorEstadoSolicitud,
  filtrarPorRangoFecha,
} from 'src/utils/slaMappers'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  registros: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'exportar'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const exportando = ref(false)
const loadingRoles = ref(false)
const opcionesRoles = ref([])

// Filtros de exportación
const filtrosExportacion = ref({
  fechaSolicitudDesde: '',
  fechaSolicitudHasta: '',
  fechaIngresoDesde: '',
  fechaIngresoHasta: '',
  estadoCumplimientoSla: 'TODOS',
  estadoSolicitud: 'TODOS',
  rolesRegistro: [],
})

// Opciones de selectores
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

// Cargar roles de registro desde la API
const loadRolesRegistro = async () => {
  loadingRoles.value = true
  try {
    const { data } = await api.get('/api/RolRegistro')
    opcionesRoles.value = data
      .filter((rol) => rol.esActivo === true)
      .map((rol) => ({
        value: rol.idRolRegistro,
        label: rol.nombreRol,
      }))
  } catch (error) {
    console.error('Error al cargar roles de registro:', error)
  } finally {
    loadingRoles.value = false
  }
}

// Computed: Registros filtrados según criterios del diálogo
const registrosFiltrados = computed(() => {
  let resultado = [...props.registros]

  // Filtro por fecha de solicitud
  resultado = filtrarPorRangoFecha(
    resultado,
    'fechaSolicitud',
    filtrosExportacion.value.fechaSolicitudDesde,
    filtrosExportacion.value.fechaSolicitudHasta,
  )

  // Filtro por fecha de ingreso
  resultado = filtrarPorRangoFecha(
    resultado,
    'fechaIngreso',
    filtrosExportacion.value.fechaIngresoDesde,
    filtrosExportacion.value.fechaIngresoHasta,
  )

  // Filtro por cumplimiento SLA
  resultado = filtrarPorCumplimientoSla(resultado, filtrosExportacion.value.estadoCumplimientoSla)

  // Filtro por estado de solicitud
  resultado = filtrarPorEstadoSolicitud(resultado, filtrosExportacion.value.estadoSolicitud)

  // Filtro por roles de registro
  if (filtrosExportacion.value.rolesRegistro.length > 0) {
    resultado = resultado.filter((registro) => {
      // Obtener idRolRegistro del registro (puede venir de diferentes formas)
      // Aquí asumimos que el registro tiene un campo 'rol' con el nombre
      // Necesitamos buscar el ID correspondiente
      const rolNombre = registro.rol
      const rolEncontrado = opcionesRoles.value.find((r) => r.label === rolNombre)
      return rolEncontrado && filtrosExportacion.value.rolesRegistro.includes(rolEncontrado.value)
    })
  }

  return resultado
})

const totalRegistrosFiltrados = computed(() => registrosFiltrados.value.length)

// Métodos
const cerrar = () => {
  show.value = false
}

const exportar = () => {
  exportando.value = true
  
  // Emitir evento con los registros filtrados
  emit('exportar', {
    registros: registrosFiltrados.value,
    filtros: { ...filtrosExportacion.value },
  })
  
  // Simular delay de exportación
  setTimeout(() => {
    exportando.value = false
    cerrar()
  }, 500)
}

// Reiniciar filtros cuando se abre el diálogo
watch(show, (newVal) => {
  if (newVal) {
    // Establecer fecha de hoy como valor por defecto
    const hoy = new Date().toISOString().split('T')[0]
    filtrosExportacion.value.fechaSolicitudDesde = ''
    filtrosExportacion.value.fechaSolicitudHasta = hoy
    filtrosExportacion.value.fechaIngresoDesde = ''
    filtrosExportacion.value.fechaIngresoHasta = ''
    filtrosExportacion.value.estadoCumplimientoSla = 'TODOS'
    filtrosExportacion.value.estadoSolicitud = 'TODOS'
    filtrosExportacion.value.rolesRegistro = []
  }
})

onMounted(() => {
  loadRolesRegistro()
})
</script>

<style scoped lang="scss">
.export-dialog-card {
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
}

/* ===== HEADER ===== */
.export-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.export-dialog-header__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.export-dialog-header__title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.export-dialog-header__subtitle {
  margin: 4px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  line-height: 1.4;
}

/* ===== BODY ===== */
.export-dialog-body {
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
}

.export-dialog-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.export-dialog-label {
  display: flex;
  align-items: center;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.export-dialog-date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* ===== ACTIONS ===== */
.export-dialog-actions {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f9fafb;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 767px) {
  .export-dialog-card {
    max-width: 100%;
    border-radius: 0;
    height: 100vh;
  }

  .export-dialog-header {
    padding: 16px;
  }

  .export-dialog-header__title {
    font-size: 18px;
  }

  .export-dialog-header__subtitle {
    font-size: 13px;
  }

  .export-dialog-body {
    padding: 16px;
    max-height: calc(100vh - 200px);
  }

  .export-dialog-date-range {
    grid-template-columns: 1fr;
  }

  .export-dialog-actions {
    padding: 12px 16px;
    flex-direction: column-reverse;

    :deep(.q-btn) {
      width: 100%;
    }
  }
}
</style>
