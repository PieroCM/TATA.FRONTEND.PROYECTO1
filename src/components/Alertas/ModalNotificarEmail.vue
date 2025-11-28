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
                Notificar a Responsable - {{ alerta?.codigoSolicitud || 'N/A' }}
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
            <label class="text-weight-bold text-body2 q-mb-xs block"> Destinatario </label>
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
                <span class="q-ml-xs">{{ alerta?.codigoSolicitud || 'N/A' }}</span>
                <span class="q-mx-sm">|</span>
                <span class="text-weight-medium">Responsable:</span>
                <span class="q-ml-xs">{{ alerta?.nombreResponsable || 'Sin Asignar' }}</span>
              </div>
              <div class="col-12">
                <span class="text-weight-medium">Rol:</span>
                <span class="q-ml-xs">{{ alerta?.nombreRol || 'N/A' }}</span>
                <span class="q-mx-sm">|</span>
                <span class="text-weight-medium">Días restantes:</span>
                <span
                  class="q-ml-xs text-weight-bold"
                  :class="getColorDiasRestantes(alerta?.diasRestantes ?? 0)"
                >
                  {{ alerta?.diasRestantes ?? 0 }}
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
  asunto: '',
  mensaje: '',
  remitenteEmail: '', // Email del usuario logueado
  remitenteNombre: '', // Nombre del usuario logueado
})

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
    console.log('👀 Watch alerta triggered:', newAlerta)

    if (newAlerta) {
      console.log('📝 Inicializando formulario con:', {
        codigoSolicitud: newAlerta.codigoSolicitud,
        emailResponsable: newAlerta.emailResponsable,
        nombreResponsable: newAlerta.nombreResponsable,
        diasRestantes: newAlerta.diasRestantes,
      })

      // Cargar email del usuario logueado
      formulario.value.remitenteEmail = authStore.userEmail || 'sistema@empresa.com'
      formulario.value.remitenteNombre = authStore.userName || 'Sistema SLA'

      // Rellenar destinatarios con emailResponsable del backend (CRÍTICO)
      formulario.value.destinatarios = newAlerta.emailResponsable || 'responsable@empresa.com'

      // Pre-llenar asunto con codigoSolicitud del backend
      formulario.value.asunto = `Alerta de Vencimiento: Solicitud ${newAlerta.codigoSolicitud || 'N/A'}`

      // Pre-llenar mensaje usando diasRestantes del backend
      const dias = newAlerta.diasRestantes ?? 0
      const estadoDias = dias < 0 ? `venció hace ${Math.abs(dias)} días` : `vencerá en ${dias} días`

      formulario.value.mensaje = `Hola,

La solicitud ${newAlerta.codigoSolicitud || 'N/A'} ${estadoDias}.

Por favor revisar con urgencia.

Saludos,
${formulario.value.remitenteNombre}
${formulario.value.remitenteEmail}`

      console.log('✅ Formulario inicializado:', formulario.value)
    }
  },
  { immediate: true },
)

/**
 * Envía la notificación
 */
const enviarNotificacion = async () => {
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

  // Mostrar loading
  const loading = $q.loading.show({
    message: 'Enviando notificación...',
  })

  try {
    // Importar api dinámicamente
    const { api } = await import('boot/axios')

    // Convertir mensaje de texto plano a HTML básico
    const cuerpoHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>Notificación de Alerta</h3>
        <p>${formulario.value.mensaje.replace(/\n/g, '<br>')}</p>
        <hr style="margin: 20px 0;">
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
          <h4 style="margin-top: 0;">Información de la solicitud:</h4>
          <p><strong>ID:</strong> ${props.alerta?.codigoSolicitud || 'N/A'}</p>
          <p><strong>Responsable:</strong> ${props.alerta?.nombreResponsable || 'Sin Asignar'}</p>
          <p><strong>Rol:</strong> ${props.alerta?.nombreRol || 'N/A'}</p>
          <p><strong>Días restantes:</strong> ${props.alerta?.diasRestantes ?? 0}</p>
        </div>
        <br>
        <p style="color: #6b7280; font-size: 12px;">
          Enviado por: ${formulario.value.remitenteNombre} (${formulario.value.remitenteEmail})
        </p>
      </div>
    `

    // Preparar payload según estructura del backend
    const payload = {
      destinatario: formulario.value.destinatarios.trim(),
      asunto: formulario.value.asunto,
      cuerpoHtml: cuerpoHtml,
    }

    console.log('📧 Enviando notificación con payload:', payload)

    // Llamar al endpoint de email
    const response = await api.post('/api/email/notify', payload)

    console.log('✅ Respuesta del backend:', response.data)

    $q.notify({
      type: 'positive',
      message: 'Notificación enviada correctamente',
      position: 'top-right',
      icon: 'check_circle',
      timeout: 2000,
    })

    // Emitir evento de éxito
    emit('notificacionEnviada', {
      idAlerta: props.alerta?.idAlerta,
      destinatario: formulario.value.destinatarios,
      asunto: formulario.value.asunto,
    })

    // Cerrar modal
    isOpen.value = false
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error)

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al enviar la notificación',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    loading()
  }
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
