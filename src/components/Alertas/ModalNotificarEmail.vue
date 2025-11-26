<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 600px; max-width: 90vw" class="modal-notificacion">
      <!-- Cabecera del Modal -->
      <q-card-section class="row items-center q-pb-sm modal-header">
        <div class="col">
          <div class="row items-center q-gutter-sm">
            <q-icon name="email" color="primary" size="28px" />
            <div>
              <div class="text-h6 text-weight-bold">
                Notificar a Responsable - {{ formatSolicitud(alerta?.solicitud?.idSolicitud) }}
              </div>
              <div class="text-caption text-grey-7">
                Envía una notificación personalizada al responsable de la solicitud.
              </div>
            </div>
          </div>
        </div>
        <q-btn icon="close" flat round dense v-close-popup class="text-grey-7" />
      </q-card-section>

      <q-separator />

      <!-- Cuerpo del Formulario -->
      <q-card-section class="q-pt-md">
        <q-form @submit="enviarNotificacion" class="q-gutter-md">
          <!-- Campo Remitente (Usuario Logueado) - Solo lectura -->
          <div>
            <label class="text-weight-bold text-body2 q-mb-xs block">
              <q-icon name="send" class="q-mr-xs" />
              Remitente (Tú)
            </label>
            <q-input
              outlined
              :model-value="`${formulario.remitenteNombre} <${formulario.remitenteEmail}>`"
              readonly
              dense
              class="input-remitente"
              bg-color="blue-1"
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" color="primary" />
              </template>
              <template v-slot:append>
                <q-badge color="primary" label="Tú" />
              </template>
            </q-input>
          </div>

          <!-- Campo Destinatarios -->
          <div>
            <label class="text-weight-bold text-body2 q-mb-xs block"> Destinatarios </label>
            <q-input
              outlined
              v-model="formulario.destinatarios"
              readonly
              dense
              class="input-destacado"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
          </div>

          <!-- Campo CC -->
          <div>
            <label class="text-weight-bold text-body2 q-mb-xs block"> CC (Copia a jefes) </label>
            <q-input
              outlined
              v-model="formulario.cc"
              placeholder="jefe@empresa.com, gerente@empresa.com"
              dense
            >
              <template v-slot:prepend>
                <q-icon name="group" />
              </template>
            </q-input>
          </div>

          <!-- Campo Asunto -->
          <div>
            <label class="text-weight-bold text-body2 q-mb-xs block"> Asunto </label>
            <q-input outlined v-model="formulario.asunto" dense>
              <template v-slot:prepend>
                <q-icon name="subject" />
              </template>
            </q-input>
          </div>

          <!-- Campo Mensaje -->
          <div>
            <label class="text-weight-bold text-body2 q-mb-xs block"> Mensaje </label>
            <q-input outlined v-model="formulario.mensaje" type="textarea" rows="6" dense>
              <template v-slot:prepend>
                <q-icon name="message" />
              </template>
            </q-input>
          </div>

          <!-- Bloque de Información -->
          <div class="info-solicitud q-pa-md">
            <div class="text-weight-bold text-body2 q-mb-sm">Información de la solicitud:</div>
            <div class="row q-gutter-md">
              <div class="col-12">
                <span class="text-weight-medium">ID:</span>
                <span class="q-ml-xs">{{ formatSolicitud(alerta?.solicitud?.idSolicitud) }}</span>
                <span class="q-mx-sm">|</span>
                <span class="text-weight-medium">Responsable:</span>
                <span class="q-ml-xs">{{
                  alerta?.solicitud?.rolRegistro?.nombreRol || 'Sin Asignar'
                }}</span>
              </div>
              <div class="col-12">
                <span class="text-weight-medium">Días restantes:</span>
                <span
                  class="q-ml-xs text-weight-bold"
                  :class="getColorDiasRestantes(diasRestantes)"
                >
                  {{ diasRestantes }}
                </span>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Pie de Página -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn outline label="Cancelar" color="grey-7" icon="close" v-close-popup class="q-px-lg" />
        <q-btn
          unelevated
          label="Enviar Notificación"
          color="primary"
          icon="send"
          @click="enviarNotificacion"
          class="q-px-lg"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/useAuthStore'

const $q = useQuasar()
const authStore = useAuthStore()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  alerta: {
    type: Object,
    default: null,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'notificacionEnviada'])

// Estado del modal
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Formulario
const formulario = ref({
  destinatarios: '',
  cc: '',
  asunto: '',
  mensaje: '',
  remitenteEmail: '', // Email del usuario logueado
  remitenteNombre: '', // Nombre del usuario logueado
})

/**
 * Calcula días restantes
 */
const diasRestantes = computed(() => {
  if (!props.alerta?.solicitud) return 0

  const umbral = props.alerta.solicitud.configSla?.diasUmbral || 0
  const fechaSolicitud = new Date(props.alerta.solicitud.fechaSolicitud)
  const hoy = new Date()
  const diferenciaMilisegundos = hoy - fechaSolicitud
  const diasTranscurridos = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24))

  return umbral - diasTranscurridos
})

/**
 * Formatea ID de solicitud
 */
const formatSolicitud = (id) => {
  return id ? `Sol-${id}` : 'N/A'
}

/**
 * Retorna clase de color según días restantes
 */
const getColorDiasRestantes = (dias) => {
  if (dias < 0) return 'text-negative'
  if (dias <= 2) return 'text-warning'
  return 'text-positive'
}

/**
 * Inicializa el formulario cuando se abre el modal
 */
watch(
  () => props.alerta,
  (newAlerta) => {
    if (newAlerta) {
      // Cargar email del usuario logueado
      formulario.value.remitenteEmail = authStore.userEmail || 'sistema@empresa.com'
      formulario.value.remitenteNombre = authStore.userName || 'Sistema SLA'

      // Rellenar destinatarios (email del responsable)
      formulario.value.destinatarios =
        newAlerta.solicitud?.rolRegistro?.email || 'responsable@empresa.com'

      // Pre-llenar asunto
      formulario.value.asunto = `Alerta de Vencimiento: Solicitud ${formatSolicitud(newAlerta.solicitud?.idSolicitud)}`

      // Pre-llenar mensaje
      const dias = diasRestantes.value
      const estadoDias = dias < 0 ? `venció hace ${Math.abs(dias)} días` : `vencerá en ${dias} días`

      formulario.value.mensaje = `Hola,

La solicitud ${formatSolicitud(newAlerta.solicitud?.idSolicitud)} ${estadoDias}.

Por favor revisar con urgencia.

Saludos,
${formulario.value.remitenteNombre}
${formulario.value.remitenteEmail}`
    }
  },
  { immediate: true },
)

/**
 * Envía la notificación
 */
const enviarNotificacion = () => {
  // Validación básica
  if (!formulario.value.destinatarios) {
    $q.notify({
      type: 'warning',
      message: 'Debe especificar al menos un destinatario',
      position: 'top-right',
    })
    return
  }

  if (!formulario.value.asunto) {
    $q.notify({
      type: 'warning',
      message: 'El asunto es obligatorio',
      position: 'top-right',
    })
    return
  }

  if (!formulario.value.mensaje) {
    $q.notify({
      type: 'warning',
      message: 'El mensaje es obligatorio',
      position: 'top-right',
    })
    return
  }

  // Aquí iría la llamada al API para enviar el email
  console.log('Enviando notificación:', {
    idAlerta: props.alerta?.idAlerta,
    idSolicitud: props.alerta?.solicitud?.idSolicitud,
    ...formulario.value,
  })

  // Simular envío exitoso
  $q.notify({
    type: 'positive',
    message: 'Notificación enviada correctamente',
    position: 'top-right',
    icon: 'check_circle',
  })

  // Emitir evento de éxito
  emit('notificacionEnviada', {
    idAlerta: props.alerta?.idAlerta,
    ...formulario.value,
  })

  // Cerrar modal
  isOpen.value = false
}
</script>

<style scoped>
.modal-notificacion {
  border-radius: 12px;
}

.modal-header {
  padding: 20px 24px;
}

label.block {
  display: block;
}

/* Input remitente - resaltado azul para usuario logueado */
.input-remitente :deep(.q-field__control) {
  background-color: #dbeafe;
  border: 1px solid #3b82f6;
}

.input-remitente :deep(.q-field__native) {
  color: #1e40af;
  font-weight: 600;
}

/* Input destacado para destinatarios validados */
.input-destacado :deep(.q-field__control) {
  background-color: #eff6ff;
}

.input-destacado :deep(.q-field__native) {
  color: #1e40af;
  font-weight: 500;
}

/* Bloque de información */
.info-solicitud {
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* Ajustar textarea */
:deep(.q-field__control-container) {
  padding-top: 0;
}

:deep(textarea.q-field__native) {
  min-height: 120px;
}

/* Botones */
.q-btn {
  text-transform: none;
  font-weight: 500;
}
</style>
