<!--
  Diálogo para crear una nueva Solicitud SLA.
  Carga roles y configuraciones SLA desde la API.
  Envía POST a /api/Solicitud al crear.

  LÓGICA DE SLA (calculada automáticamente en backend):
  - fechaIngreso es OPCIONAL:
    * Si está vacía (null) → solicitud "en proceso" (backend decide EN_PROCESO o VENCIDO según días transcurridos vs umbral)
    * Si tiene valor → solicitud "cerrada" (backend decide CUMPLE o NO_CUMPLE según días entre solicitud e ingreso)
  - numDiasSla, estadoCumplimientoSla, estadoSolicitud y resumenSla se calculan en backend
  - NO enviar estadoSolicitud hardcodeado, el backend lo define
-->
<template>
  <q-dialog
    :model-value="props.modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    persistent
  >
    <q-card class="sla-create-dialog" style="min-width: 700px; max-width: 800px">
      <!-- Header -->
      <q-card-section class="sla-create-dialog__header">
        <div class="text-h6">Nuevo Registro SLA</div>
        <p class="text-caption text-grey-7 q-mt-xs q-mb-none">
          Completa los campos requeridos para crear el registro
        </p>
      </q-card-section>

      <q-separator />

      <!-- Form -->
      <q-card-section class="q-pt-lg">
        <q-form @submit.prevent="onSubmit" class="sla-create-dialog__form">
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
              placeholder="Ingresa detalles adicionales sobre la solicitud..."
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
              label="Crear registro"
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
})

const emit = defineEmits(['update:modelValue', 'registro-creado'])

const $q = useQuasar()

const loading = ref(false)
const roles = ref([]) // lista completa de RolRegistro activos
const filteredRoles = ref([]) // roles filtrados para el search
const slas = ref([]) // lista completa de ConfigSla activos
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
    // IMPORTANTE: El backend calcula automáticamente numDiasSla, estadoCumplimientoSla,
    // estadoSolicitud y resumenSla usando SolicitudService.CalcularSlaYResumen
    const payload = {
      idPersonal: form.value.idPersonal,
      idSla: form.value.idSla,
      idRolRegistro: form.value.idRolRegistro,
      creadoPor: 1, // TODO: reemplazar luego por el idUsuario autenticado
      fechaSolicitud: form.value.fechaSolicitud + 'T00:00:00',
      fechaIngreso: form.value.fechaIngreso ? form.value.fechaIngreso + 'T00:00:00' : null,
      resumenSla: form.value.resumenSla || null, // null permite que backend genere resumen automático
      origenDato: 'WEB_FORM',
      estadoSolicitud: null, // null permite que backend calcule (EN_PROCESO, VENCIDO o CERRADO)
    }

    const { data } = await api.post('/api/Solicitud', payload)

    // Notificación de éxito
    $q.notify({
      type: 'positive',
      message: 'La solicitud fue creada con éxito',
      position: 'top-right',
      icon: 'check_circle',
    })

    // Emitir evento al padre
    emit('registro-creado', data)

    // Resetear y cerrar
    resetForm()
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Error al crear solicitud:', err)

    const errorMsg =
      err?.response?.data?.message ||
      err?.response?.data ||
      'Ocurrió un error al crear la solicitud'

    $q.notify({
      type: 'negative',
      message: typeof errorMsg === 'string' ? errorMsg : 'Error al crear la solicitud',
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
