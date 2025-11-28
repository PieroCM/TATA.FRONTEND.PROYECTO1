<!--
  Diálogo para crear una nueva Solicitud SLA.
  Permite selección MÚLTIPLE de personales para crear varias solicitudes a la vez.
  Carga roles y configuraciones SLA desde la API.
  Envía POST a /api/Solicitud por cada personal seleccionado.

  LÓGICA DE SLA (calculada automáticamente en backend):
  - fechaIngreso es OPCIONAL
  - numDiasSla, estadoCumplimientoSla, estadoSolicitud y resumenSla se calculan en backend
  - NO enviar estadoSolicitud ni estadoCumplimientoSla desde frontend
-->
<template>
  <q-dialog
    :model-value="props.modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    persistent
  >
    <q-card class="sla-create-dialog" style="min-width: 800px; max-width: 900px">
      <!-- Header -->
      <q-card-section class="sla-create-dialog__header">
        <div class="text-h6">Nuevo Registro SLA</div>
        <p class="text-caption text-grey-7 q-mt-xs q-mb-none">
          Selecciona uno o más colaboradores para crear solicitudes SLA
        </p>
      </q-card-section>

      <q-separator />

      <!-- Form -->
      <q-card-section class="q-pt-lg">
        <q-form @submit.prevent="onSubmit" class="sla-create-dialog__form">
          <!-- Panel de selección de Personales -->
          <div class="personal-selection-panel q-mb-lg">
            <div class="text-subtitle2 q-mb-sm">Colaboradores / Personal *</div>

            <!-- Búsqueda -->
            <q-input
              v-model="searchPersonal"
              outlined
              dense
              placeholder="Buscar colaborador por nombre, apellido o correo..."
              class="q-mb-sm"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append v-if="searchPersonal">
                <q-icon name="close" @click="searchPersonal = ''" class="cursor-pointer" />
              </template>
            </q-input>

            <!-- Contador y acciones -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7">
                {{ filteredPersonales.length }} colaboradores encontrados
              </div>
              <div class="row q-gutter-sm">
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="primary"
                  label="Sel. todos"
                  @click="selectAllFiltered"
                  :disable="filteredPersonales.length === 0"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="grey-7"
                  label="Limpiar"
                  @click="clearSelection"
                  :disable="selectedPersonalIds.length === 0"
                />
              </div>
            </div>

            <!-- Lista de personales con checkboxes -->
            <div class="personal-list">
              <div v-if="isLoadingPersonales" class="text-center q-pa-md">
                <q-spinner color="primary" size="md" />
                <div class="text-caption text-grey-7 q-mt-sm">Cargando colaboradores...</div>
              </div>

              <div
                v-else-if="filteredPersonales.length === 0"
                class="text-center q-pa-md text-grey-7"
              >
                No se encontraron colaboradores
              </div>

              <div v-else>
                <div
                  v-for="personal in filteredPersonales"
                  :key="personal.idPersonal"
                  class="personal-item"
                  :class="{ 'personal-item--selected': isSelected(personal.idPersonal) }"
                  @click="togglePersonal(personal.idPersonal)"
                >
                  <q-checkbox
                    :model-value="isSelected(personal.idPersonal)"
                    @update:model-value="togglePersonal(personal.idPersonal)"
                    color="primary"
                    class="personal-item__checkbox"
                  />
                  <div class="personal-item__content">
                    <div class="personal-item__name">
                      {{ personal.nombres }} {{ personal.apellidos }}
                    </div>
                    <div class="personal-item__email text-caption text-grey-7">
                      {{ personal.correoCorporativo || personal.usuarioCorreo || 'Sin correo' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen de selección -->
            <div class="selection-summary q-mt-sm">
              <q-chip
                v-if="selectedPersonalIds.length > 0"
                color="primary"
                text-color="white"
                icon="person"
              >
                {{ selectedPersonalIds.length }} colaborador(es) seleccionado(s)
              </q-chip>
            </div>
          </div>

          <!-- Fila 1: Rol y Código SLA -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.idRolRegistro"
                :options="filteredRoles"
                option-label="nombreRol"
                option-value="idRolRegistro"
                emit-value
                map-options
                use-input
                fill-input
                input-debounce="300"
                label="Rol requerido *"
                outlined
                dense
                :rules="[(val) => !!val || 'El rol es requerido']"
                @filter="filterRoles"
                placeholder="Buscar rol..."
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No se encontraron resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <div class="row items-center q-gutter-sm">
                <div class="col">
                  <q-select
                    v-model="form.idSla"
                    :options="slas"
                    :option-label="slaOptionLabel"
                    option-value="idSla"
                    emit-value
                    map-options
                    label="Código SLA *"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'El código SLA es requerido']"
                    placeholder="Seleccionar SLA..."
                  />
                </div>
                <q-chip
                  v-if="selectedSla"
                  color="purple-2"
                  text-color="purple-9"
                  class="q-ml-sm"
                  icon="schedule"
                >
                  {{ selectedSla.diasUmbral }} días
                </q-chip>
              </div>
            </div>
          </div>

          <!-- Fila 2: Fechas -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.fechaSolicitud"
                type="date"
                label="Fecha solicitud *"
                outlined
                dense
                :rules="[(val) => !!val || 'La fecha de solicitud es requerida']"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.fechaIngreso"
                type="date"
                label="Fecha ingreso (opcional)"
                outlined
                dense
                clearable
                hint="Dejar vacío si la solicitud está en proceso"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Fila 3: Observaciones -->
          <div class="q-mb-md">
            <q-input
              v-model="form.resumenSla"
              type="textarea"
              label="Observaciones"
              outlined
              autogrow
              rows="3"
              placeholder="Ingresa detalles adicionales (se aplicará a todas las solicitudes)..."
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>
          </div>

          <!-- Información adicional -->
          <div class="sla-create-dialog__info q-mb-lg">
            <q-icon name="info" size="18px" color="blue-6" class="q-mr-sm" />
            <span class="text-caption text-grey-7">
              Se creará {{ selectedPersonalIds.length || 0 }} solicitud(es) con los mismos datos
            </span>
          </div>

          <!-- Botones de acción -->
          <q-card-actions align="right" class="q-pt-md">
            <q-btn
              flat
              label="Cancelar"
              color="grey-7"
              padding="8px 20px"
              @click="handleCancel"
              :disable="isPostingSolicitudes"
            />
            <q-btn
              label="Crear solicitud(es)"
              color="primary"
              padding="8px 24px"
              type="submit"
              :loading="isPostingSolicitudes"
              :disable="selectedPersonalIds.length === 0 || isPostingSolicitudes"
              unelevated
            >
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { getUserIdFromToken } from 'src/utils/jwt'

/**
 * COMPONENTE: SlaCreateDialog
 *
 * Diálogo de creación MÚLTIPLE de solicitudes SLA.
 * Permite seleccionar varios personales a la vez.
 *
 * Props:
 *   - modelValue (Boolean): Controla la visibilidad del diálogo
 *
 * Emits:
 *   - update:modelValue: Actualiza visibilidad
 *   - registro-creado: Emite cuando las solicitudes fueron creadas exitosamente
 *
 * Endpoints consumidos:
 *   - GET /api/Personal → obtener colaboradores
 *   - GET /api/RolRegistro → obtener roles
 *   - GET /api/ConfigSla → obtener configuraciones SLA
 *   - POST /api/Solicitud → crear solicitud (una por cada personal seleccionado)
 */

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'registro-creado'])

const $q = useQuasar()

// Estados reactivos
const isLoadingPersonales = ref(false)
const isPostingSolicitudes = ref(false)
const personales = ref([])
const roles = ref([])
const filteredRoles = ref([])
const slas = ref([])

// Multi-selección de personales
const selectedPersonalIds = ref([])
const searchPersonal = ref('')

// Form data (común para todas las solicitudes)
const form = ref({
  idRolRegistro: null,
  idSla: null,
  fechaSolicitud: '',
  fechaIngreso: '',
  resumenSla: '',
})

/**
 * Personales filtrados por búsqueda
 */
const filteredPersonales = computed(() => {
  if (!searchPersonal.value) return personales.value

  const term = searchPersonal.value.toLowerCase().trim()
  return personales.value.filter((p) => {
    const nombres = (p.nombres || '').toLowerCase()
    const apellidos = (p.apellidos || '').toLowerCase()
    const correo = (p.correoCorporativo || p.usuarioCorreo || '').toLowerCase()

    return nombres.includes(term) || apellidos.includes(term) || correo.includes(term)
  })
})

/**
 * Verifica si un personal está seleccionado
 */
const isSelected = (idPersonal) => {
  return selectedPersonalIds.value.includes(idPersonal)
}

/**
 * Alterna la selección de un personal
 */
const togglePersonal = (idPersonal) => {
  const index = selectedPersonalIds.value.indexOf(idPersonal)
  if (index > -1) {
    selectedPersonalIds.value.splice(index, 1)
  } else {
    selectedPersonalIds.value.push(idPersonal)
  }
}

/**
 * Selecciona todos los personales filtrados
 */
const selectAllFiltered = () => {
  filteredPersonales.value.forEach((p) => {
    if (!isSelected(p.idPersonal)) {
      selectedPersonalIds.value.push(p.idPersonal)
    }
  })
}

/**
 * Limpia toda la selección
 */
const clearSelection = () => {
  selectedPersonalIds.value = []
}

// Computed para obtener el SLA seleccionado
const selectedSla = computed(() => slas.value.find((s) => s.idSla === form.value.idSla) || null)

// Función para formatear label del SLA
const slaOptionLabel = (sla) => {
  return `${sla.codigoSla} - ${sla.tipoSolicitud}`
}

// Cargar datos al montar
onMounted(async () => {
  await Promise.all([loadRoles(), loadSlas()])
})

// Cargar personal cuando el diálogo se abre
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && personales.value.length === 0) {
      await loadPersonales()
    }
  },
)

// Cargar roles activos
const loadRoles = async () => {
  try {
    const { data } = await api.get('/api/RolRegistro')
    roles.value = data.filter((r) => r.esActivo)
    filteredRoles.value = roles.value
  } catch (err) {
    console.error('[SlaCreateDialog] Error al cargar roles:', err)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los roles',
      position: 'top-right',
    })
  }
}

// Cargar configuraciones SLA activas
const loadSlas = async () => {
  try {
    const { data } = await api.get('/api/ConfigSla')
    slas.value = data.filter((s) => s.esActivo)
  } catch (err) {
    console.error('[SlaCreateDialog] Error al cargar SLAs:', err)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las configuraciones SLA',
      position: 'top-right',
    })
  }
}

// Cargar personal activo
const loadPersonales = async () => {
  try {
    isLoadingPersonales.value = true
    const { data } = await api.get('/api/Personal')
    personales.value = data.filter((p) => p.estado === 'ACTIVO')
  } catch (err) {
    console.error('[SlaCreateDialog] Error al cargar personal:', err)

    let errorMessage = 'Error al cargar la lista de personal'
    let errorCaption = ''

    if (err.response?.status === 401) {
      errorMessage = 'No autorizado'
      errorCaption = 'Necesitas iniciar sesión para cargar la lista de personal'
    } else if (err.response?.status === 500) {
      errorMessage = 'Error en el servidor'
      errorCaption = err.response?.data?.message || 'Error interno del servidor'
    } else if (err.message === 'Network Error') {
      errorMessage = 'Error de red'
      errorCaption = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
    } else if (err.response?.data?.message) {
      errorCaption = err.response.data.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      caption: errorCaption,
      position: 'top-right',
      timeout: 5000,
    })
  } finally {
    isLoadingPersonales.value = false
  }
}

// Filtrar roles por búsqueda
const filterRoles = (val, update) => {
  if (val === '') {
    update(() => {
      filteredRoles.value = roles.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredRoles.value = roles.value.filter((r) => r.nombreRol.toLowerCase().indexOf(needle) > -1)
  })
}

// Manejar cancelación
const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}

// Reset del formulario
const resetForm = () => {
  form.value = {
    idRolRegistro: null,
    idSla: null,
    fechaSolicitud: '',
    fechaIngreso: '',
    resumenSla: '',
  }
  selectedPersonalIds.value = []
  searchPersonal.value = ''
}

// Submit del formulario (crea MÚLTIPLES solicitudes)
const onSubmit = async () => {
  // Validar que haya al menos un personal seleccionado
  if (selectedPersonalIds.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Debes seleccionar al menos un colaborador',
      position: 'top-right',
    })
    return
  }

  // Validación: si fechaIngreso tiene valor, debe ser >= fechaSolicitud
  if (form.value.fechaIngreso && form.value.fechaIngreso < form.value.fechaSolicitud) {
    $q.notify({
      type: 'negative',
      message: 'Fecha de ingreso inválida',
      caption: 'La fecha de ingreso no puede ser anterior a la fecha de solicitud',
      position: 'top-right',
    })
    return
  }

  // Obtener ID del usuario logueado
  const userId = getUserIdFromToken()
  if (!userId) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener el usuario autenticado',
      caption: 'Intenta cerrar sesión y volver a iniciar',
      position: 'top-right',
    })
    return
  }

  try {
    isPostingSolicitudes.value = true

    // Construir payload base (común para todas las solicitudes)
    const basePayload = {
      idSla: form.value.idSla,
      idRolRegistro: form.value.idRolRegistro,
      creadoPor: userId,
      fechaSolicitud: form.value.fechaSolicitud + 'T00:00:00',
      fechaIngreso: form.value.fechaIngreso ? form.value.fechaIngreso + 'T00:00:00' : null,
      resumenSla: form.value.resumenSla || null,
      origenDato: 'WEB',
      estadoSolicitud: null, // El backend lo calcula automáticamente
    }

    console.log(
      '[SlaCreateDialog] Creando solicitudes para',
      selectedPersonalIds.value.length,
      'personales',
    )
    console.log('[SlaCreateDialog] Payload base:', basePayload)

    // Crear todas las solicitudes en paralelo
    const promises = selectedPersonalIds.value.map((idPersonal) => {
      const payload = {
        ...basePayload,
        idPersonal,
      }
      return api.post('/api/Solicitud', payload)
    })

    // Ejecutar todas las promesas y capturar resultados
    const results = await Promise.allSettled(promises)

    // Analizar resultados
    const successful = results.filter((r) => r.status === 'fulfilled')
    const failed = results.filter((r) => r.status === 'rejected')

    console.log('[SlaCreateDialog] Resultados:', {
      exitosas: successful.length,
      fallidas: failed.length,
    })

    // Notificar resultados
    if (successful.length > 0) {
      $q.notify({
        type: 'positive',
        message: `Se crearon ${successful.length} solicitud(es) SLA correctamente`,
        position: 'top-right',
        timeout: 3000,
        icon: 'check_circle',
      })
    }

    if (failed.length > 0) {
      console.error('[SlaCreateDialog] Errores al crear solicitudes:', failed)
      $q.notify({
        type: 'negative',
        message: `${failed.length} solicitud(es) no pudieron procesarse`,
        caption: 'Revisa la consola para más detalles',
        position: 'top-right',
        timeout: 5000,
        icon: 'error',
      })
    }

    // Si al menos una fue exitosa, recargar tabla y cerrar
    if (successful.length > 0) {
      // Emitir evento al padre con el primer resultado exitoso
      emit('registro-creado', successful[0].value.data)
      resetForm()
      emit('update:modelValue', false)
    }
  } catch (err) {
    console.error('[SlaCreateDialog] Error inesperado:', err)
    $q.notify({
      type: 'negative',
      message: 'Error inesperado al crear solicitudes',
      caption: err.message,
      position: 'top-right',
      icon: 'error',
    })
  } finally {
    isPostingSolicitudes.value = false
  }
}
</script>

<style scoped>
.sla-create-dialog {
  border-radius: 12px;
}

.sla-create-dialog__header {
  padding: 24px 24px 16px 24px;
}

.sla-create-dialog__form {
  padding: 0;
}

.sla-create-dialog__info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f0f4ff;
  border-radius: 8px;
  border-left: 3px solid #1976d2;
}

/* Panel de selección de personales */
.personal-selection-panel {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

/* Lista de personales */
.personal-list {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: white;
}

/* Item de personal */
.personal-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.personal-item:last-child {
  border-bottom: none;
}

.personal-item:hover {
  background-color: #f5f5f5;
}

.personal-item--selected {
  background-color: #e3f2fd;
}

.personal-item--selected:hover {
  background-color: #bbdefb;
}

.personal-item__checkbox {
  margin-right: 12px;
}

.personal-item__content {
  flex: 1;
}

.personal-item__name {
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  margin-bottom: 4px;
}

.personal-item__email {
  font-size: 12px;
  color: #757575;
}

/* Resumen de selección */
.selection-summary {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

/* Estilos para inputs */
:deep(.q-field__control) {
  border-radius: 6px;
}

:deep(.q-field__native) {
  font-size: 14px;
}

:deep(.q-field__label) {
  font-size: 13px;
  font-weight: 500;
}

/* Estilos para el chip de días */
:deep(.q-chip) {
  font-weight: 600;
  font-size: 12px;
}

/* Scrollbar personalizada */
.personal-list::-webkit-scrollbar {
  width: 8px;
}

.personal-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.personal-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.personal-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
