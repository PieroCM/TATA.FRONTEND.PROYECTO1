<template>
  <q-card flat bordered class="redactar-card">
    <q-card-section>
      <!-- Título -->
      <div class="card-header q-mb-lg">
        <q-icon name="edit_note" color="primary" size="24px" class="q-mr-sm" />
        <h2 class="text-h6 text-weight-semibold q-ma-none">Redactar Comunicado</h2>
      </div>

      <q-form @submit="handleEnviarComunicado" class="q-gutter-md">
        <!-- Campo 1: Plantilla -->
        <div>
          <label class="text-weight-medium text-body2 q-mb-xs block">Plantilla</label>
          <q-select
            outlined
            v-model="comunicado.plantilla"
            :options="opcionesPlantillas"
            placeholder="Cargar plantilla..."
            dense
            clearable
            @update:model-value="cargarPlantilla"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-select>
        </div>

        <!-- Campo 2: Asunto -->
        <div>
          <label class="text-weight-bold text-body2 q-mb-xs block">
            Asunto
            <span class="text-negative">*</span>
          </label>
          <q-input
            outlined
            v-model="comunicado.asunto"
            placeholder="Ej: Reunión de seguimiento SLA1 - Urgente"
            dense
            :rules="[(val) => !!val || 'Campo requerido']"
          >
            <template v-slot:prepend>
              <q-icon name="subject" />
            </template>
          </q-input>
        </div>

        <!-- Campo 3: Cuerpo del mensaje -->
        <div>
          <label class="text-weight-bold text-body2 q-mb-xs block">Cuerpo del mensaje</label>

          <!-- Toolbar del editor -->
          <div class="editor-toolbar">
            <q-btn
              flat
              dense
              icon="format_bold"
              size="sm"
              color="grey-8"
              @click="aplicarFormato('bold')"
              class="toolbar-btn"
            >
              <q-tooltip>Negrita</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              icon="format_italic"
              size="sm"
              color="grey-8"
              @click="aplicarFormato('italic')"
              class="toolbar-btn"
            >
              <q-tooltip>Cursiva</q-tooltip>
            </q-btn>
            <q-separator vertical class="q-mx-xs" />
            <q-btn
              flat
              dense
              icon="format_list_bulleted"
              size="sm"
              color="grey-8"
              @click="aplicarFormato('list')"
              class="toolbar-btn"
            >
              <q-tooltip>Lista</q-tooltip>
            </q-btn>
          </div>

          <!-- Área de texto -->
          <q-input
            outlined
            v-model="comunicado.cuerpo"
            type="textarea"
            placeholder="Escriba su mensaje aquí..."
            :rows="12"
            class="editor-textarea"
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>

        <!-- Footer de Acciones -->
        <div class="acciones-comunicado">
          <q-btn
            outline
            color="primary"
            icon="person"
            label="Enviar Prueba a mí"
            @click="handleEnviarPrueba"
            class="q-px-lg"
            :loading="enviandoPrueba"
            :disable="!puedeEnviar"
          />
          <q-btn
            unelevated
            :color="puedeEnviar ? 'primary' : 'grey-5'"
            icon="send"
            :label="`Enviar a ${cantidadUsuarios} Destinatarios`"
            type="submit"
            class="q-px-lg"
            :disable="!puedeEnviar"
            :loading="enviandoComunicado"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Props
const props = defineProps({
  cantidadUsuarios: {
    type: Number,
    default: 0,
  },
})

// Emits
const emit = defineEmits(['enviar-prueba', 'enviar-comunicado'])

// Comunicado
const comunicado = ref({
  plantilla: null,
  asunto: '',
  cuerpo: '',
})

// Opciones de plantillas
const opcionesPlantillas = [
  'Recordatorio de vencimiento',
  'Solicitud urgente',
  'Actualización de estado',
  'Reunión de seguimiento',
]

// Estados de carga
const enviandoPrueba = ref(false)
const enviandoComunicado = ref(false)

/**
 * Computed: Puede enviar si hay asunto, cuerpo y destinatarios
 */
const puedeEnviar = computed(() => {
  return (
    comunicado.value.asunto.trim() !== '' &&
    comunicado.value.cuerpo.trim() !== '' &&
    props.cantidadUsuarios > 0
  )
})

/**
 * Carga plantilla seleccionada
 */
const cargarPlantilla = (plantilla) => {
  if (!plantilla) return

  // Plantillas predefinidas
  const plantillas = {
    'Recordatorio de vencimiento': {
      asunto: 'Recordatorio: Solicitud próxima a vencer',
      cuerpo:
        'Estimado equipo,\n\nLes recordamos que tienen solicitudes próximas a vencer. Por favor, revisen sus asignaciones con urgencia.\n\nSaludos,\nSistema de Gestión SLA',
    },
    'Solicitud urgente': {
      asunto: 'URGENTE: Solicitud requiere atención inmediata',
      cuerpo:
        'Estimado equipo,\n\nUna solicitud crítica requiere su atención inmediata. Por favor, revisar y actuar lo antes posible.\n\nSaludos,\nSistema de Gestión SLA',
    },
    'Actualización de estado': {
      asunto: 'Actualización: Estado de solicitudes',
      cuerpo:
        'Estimado equipo,\n\nSe ha actualizado el estado de varias solicitudes. Por favor, revisar el sistema para más detalles.\n\nSaludos,\nSistema de Gestión SLA',
    },
    'Reunión de seguimiento': {
      asunto: 'Convocatoria: Reunión de seguimiento SLA',
      cuerpo:
        'Estimado equipo,\n\nEstán convocados a la reunión de seguimiento de SLA. Por favor, confirmar asistencia.\n\nSaludos,\nSistema de Gestión SLA',
    },
  }

  const plantillaSeleccionada = plantillas[plantilla]
  if (plantillaSeleccionada) {
    comunicado.value.asunto = plantillaSeleccionada.asunto
    comunicado.value.cuerpo = plantillaSeleccionada.cuerpo
  }
}

/**
 * Aplica formato al texto (simulado)
 */
const aplicarFormato = (tipo) => {
  $q.notify({
    type: 'info',
    message: `Formato ${tipo} aplicado (simulado)`,
    position: 'top-right',
  })
}

/**
 * Envía prueba
 */
const handleEnviarPrueba = async () => {
  if (!puedeEnviar.value) {
    $q.notify({
      type: 'warning',
      message: 'Complete el asunto y cuerpo del mensaje',
      position: 'top-right',
    })
    return
  }

  enviandoPrueba.value = true

  try {
    await emit('enviar-prueba', comunicado.value)
  } finally {
    enviandoPrueba.value = false
  }
}

/**
 * Envía comunicado
 */
const handleEnviarComunicado = async () => {
  if (!puedeEnviar.value) return

  enviandoComunicado.value = true

  try {
    await emit('enviar-comunicado', comunicado.value)

    // Limpiar formulario después de envío exitoso
    comunicado.value = {
      plantilla: null,
      asunto: '',
      cuerpo: '',
    }
  } finally {
    enviandoComunicado.value = false
  }
}
</script>

<style scoped>
.redactar-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.card-header {
  display: flex;
  align-items: center;
}

label.block {
  display: block;
}

/* Editor de texto */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.toolbar-btn {
  min-width: 32px;
}

.editor-textarea :deep(.q-field__control) {
  border-radius: 0 0 8px 8px !important;
}

.editor-textarea :deep(.q-field__control::before) {
  border-top: none !important;
}

.editor-textarea :deep(textarea) {
  font-family: inherit;
  line-height: 1.6;
}

.acciones-comunicado {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .acciones-comunicado {
    flex-direction: column;
  }

  .acciones-comunicado .q-btn {
    width: 100%;
  }
}
</style>
