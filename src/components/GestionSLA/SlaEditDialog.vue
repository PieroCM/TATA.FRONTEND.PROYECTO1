<!--
  Diálogo para editar una Solicitud SLA existente.
  Carga datos del registro por ID, permite editar campos específicos.
  Envía PUT a /api/Solicitud/{id} al actualizar.

  LÓGICA DE SLA (calculada automáticamente en backend):
  - fechaIngreso es OPCIONAL también en edición:
    * Puede vaciarse para re-dejar la solicitud "en proceso"
    * Backend recalcula SLA con la misma lógica que en creación y carga masiva
  - El backend recalcula numDiasSla, estadoCumplimientoSla, estadoSolicitud y resumenSla
  - NO enviar estadoSolicitud hardcodeado
-->
<template>
  <q-dialog
    :model-value="props.modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    persistent
  >
    <q-card class="sla-edit-dialog" style="min-width: 700px; max-width: 800px">
      <!-- Header -->
      <q-card-section class="sla-edit-dialog__header">
        <div class="text-h6">Editar Solicitud SLA</div>
        <p class="text-caption text-grey-7 q-mt-xs q-mb-none">
          Actualiza los datos de la solicitud seleccionada
        </p>
      </q-card-section>

      <q-separator />

      <!-- Form -->
      <q-card-section class="q-pt-lg">
        <div v-if="loadingData" class="text-center q-py-lg">
          <q-spinner color="primary" size="50px" />
          <p class="q-mt-md text-grey-7">Cargando datos...</p>
        </div>

        <q-form v-else @submit.prevent="onSubmit" class="sla-edit-dialog__form">
          <!-- Fila 0: Colaborador/Personal -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-select
                v-model="form.idPersonal"
                :options="personales"
                :option-label="personalOptionLabel"
                option-value="idPersonal"
                emit-value
                map-options
                label="Colaborador / Personal *"
                outlined
                dense
                :rules="[(val) => !!val || 'El colaborador es requerido']"
                placeholder="Seleccionar colaborador..."
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Fila 1: Rol y Código SLA -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.idRolRegistro"
                :options="roles"
                option-label="nombreRol"
                option-value="idRolRegistro"
                emit-value
                map-options
                label="Rol *"
                outlined
                dense
                :rules="[(val) => !!val || 'El rol es requerido']"
                placeholder="Seleccionar rol..."
              />
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
                hint="Vaciar para dejar la solicitud en proceso"
                clearable
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
              placeholder="Ingresa detalles adicionales sobre la solicitud..."
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>
          </div>

          <!-- Información adicional -->
          <div class="sla-edit-dialog__info q-mb-lg">
            <q-icon name="info" size="18px" color="blue-6" class="q-mr-sm" />
            <span class="text-caption text-grey-7">
              Los campos marcados con (*) son obligatorios
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
              :disable="loading"
            />
            <q-btn
              label="Actualizar"
              color="primary"
              padding="8px 24px"
              type="submit"
              :loading="loading"
              unelevated
            />
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

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  registroId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'registro-actualizado'])

const $q = useQuasar()

const loading = ref(false)
const loadingData = ref(false)
const roles = ref([])
const slas = ref([])
const personales = ref([]) // lista de Personal activos

const form = ref({
  idPersonal: null,
  idRolRegistro: null,
  idSla: null,
  fechaSolicitud: '',
  fechaIngreso: '',
  resumenSla: '',
})

// Computed para obtener el SLA seleccionado
const selectedSla = computed(() => slas.value.find((s) => s.idSla === form.value.idSla) || null)

// Función para formatear label del SLA
const slaOptionLabel = (sla) => {
  return `${sla.codigoSla} - ${sla.tipoSolicitud}`
}

// Función para formatear label del Personal
const personalOptionLabel = (p) => {
  return `${p.nombres} ${p.apellidos} - ${p.correoCorporativo || p.usuarioCorreo}`
}

// Cargar datos al montar
onMounted(async () => {
  await Promise.all([loadRoles(), loadSlas()])
  // NO cargar personales aquí, se cargará cuando el diálogo se abra
})

// Observar cambios en registroId para cargar los datos
watch(
  () => props.registroId,
  async (newId) => {
    if (newId && props.modelValue) {
      await loadRegistroData(newId)
    }
  },
)

// Observar cambios en modelValue y cargar datos cuando se abre
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      // Cargar personales si aún no se han cargado
      if (personales.value.length === 0) {
        await loadPersonales()
      }
      // Cargar datos del registro si hay un ID
      if (props.registroId) {
        await loadRegistroData(props.registroId)
      }
    }
  },
)

// Cargar roles activos
const loadRoles = async () => {
  try {
    const { data } = await api.get('/api/RolRegistro')
    roles.value = data.filter((r) => r.esActivo)
  } catch (err) {
    console.error('Error al cargar roles:', err)
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
    console.error('Error al cargar SLAs:', err)
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
    const { data } = await api.get('/api/Personal')
    personales.value = data.filter((p) => p.estado === 'ACTIVO')
  } catch (err) {
    console.error('Error al cargar personal:', err)
    console.error('Status:', err.response?.status)
    console.error('Data:', err.response?.data)
    console.error('Headers:', err.response?.headers)

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
  }
}

// Cargar datos del registro por ID
const loadRegistroData = async (id) => {
  try {
    loadingData.value = true
    const { data } = await api.get(`/api/Solicitud/${id}`)

    // Parsear fechas para input type="date" (formato YYYY-MM-DD)
    // IMPORTANTE: fechaIngreso puede ser null si la solicitud está en proceso
    const fechaSolicitud = data.fechaSolicitud ? data.fechaSolicitud.split('T')[0] : ''
    const fechaIngreso = data.fechaIngreso ? data.fechaIngreso.split('T')[0] : ''

    form.value = {
      idPersonal: data.idPersonal,
      idRolRegistro: data.idRolRegistro,
      idSla: data.idSla,
      fechaSolicitud,
      fechaIngreso, // Será '' si es null en backend
      resumenSla: data.resumenSla || '',
    }
  } catch (err) {
    console.error('Error al cargar datos del registro:', err)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos del registro',
      position: 'top-right',
    })
  } finally {
    loadingData.value = false
  }
}

// Manejar cancelación
const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}

// Reset del formulario
const resetForm = () => {
  form.value = {
    idPersonal: null,
    idRolRegistro: null,
    idSla: null,
    fechaSolicitud: '',
    fechaIngreso: '',
    resumenSla: '',
  }
}

// Submit del formulario
const onSubmit = async () => {
  // Mostrar diálogo de confirmación
  $q.dialog({
    title: 'Confirmar actualización',
    message: '¿Estás seguro de que deseas actualizar esta solicitud?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    // Si el usuario confirma, proceder con la actualización
    await performUpdate()
  })
}

// Función para realizar la actualización
const performUpdate = async () => {
  try {
    loading.value = true

    // Validación: si fechaIngreso tiene valor, debe ser >= fechaSolicitud
    if (form.value.fechaIngreso && form.value.fechaIngreso < form.value.fechaSolicitud) {
      $q.notify({
        type: 'negative',
        message: 'Fecha de ingreso inválida',
        caption: 'La fecha de ingreso no puede ser anterior a la fecha de solicitud',
        position: 'top-right',
      })
      loading.value = false
      return
    }

    // Construir payload según nueva lógica de SLA
    // IMPORTANTE: El backend recalcula automáticamente SLA (numDiasSla, estadoCumplimientoSla,
    // resumenSla y estadoSolicitud) con la misma lógica que la carga masiva.
    // Este método solo envía fechas y claves.
    const payload = {
      idPersonal: form.value.idPersonal,
      idSla: form.value.idSla,
      idRolRegistro: form.value.idRolRegistro,
      creadoPor: 1, // TODO: reemplazar luego por el idUsuario autenticado
      fechaSolicitud: form.value.fechaSolicitud + 'T00:00:00',
      fechaIngreso: form.value.fechaIngreso ? form.value.fechaIngreso + 'T00:00:00' : null,
      resumenSla: form.value.resumenSla || null, // null permite que backend regenere el resumen
      origenDato: 'WEB_FORM',
      estadoSolicitud: null, // null permite que backend calcule (EN_PROCESO, VENCIDO o CERRADO)
    }

    const { data } = await api.put(`/api/Solicitud/${props.registroId}`, payload)

    // Notificación de éxito
    $q.notify({
      type: 'positive',
      message: 'La solicitud fue actualizada con éxito',
      position: 'top-right',
      icon: 'check_circle',
    })

    // Emitir evento al padre
    emit('registro-actualizado', data)

    // Resetear y cerrar
    resetForm()
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Error al actualizar solicitud:', err)

    const errorMsg =
      err?.response?.data?.message ||
      err?.response?.data ||
      'Ocurrió un error al actualizar la solicitud'

    $q.notify({
      type: 'negative',
      message: typeof errorMsg === 'string' ? errorMsg : 'Error al actualizar la solicitud',
      caption: err?.response?.status ? `Código: ${err.response.status}` : '',
      position: 'top-right',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.sla-edit-dialog {
  border-radius: 12px;
}

.sla-edit-dialog__header {
  padding: 24px 24px 16px 24px;
}

.sla-edit-dialog__form {
  padding: 0;
}

.sla-edit-dialog__info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f0f4ff;
  border-radius: 8px;
  border-left: 3px solid #1976d2;
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
</style>
