<template>
  <q-dialog v-model="internalModel" persistent>
    <q-card style="width: 90vw; max-width: 520px">
      <q-card-section>
        <div class="text-h6">Enviar reporte por correo</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Ingresa uno o varios correos separados por coma.
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="correoDestinatarios"
          label="Correos destinatarios"
          type="text"
          outlined
          dense
          autogrow
          placeholder="ejemplo@dominio.com, otro@dominio.com"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" @click="cerrar" />
        <q-btn label="Enviar" color="primary" :loading="loading" @click="onEnviar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const correoDestinatarios = ref('')

// Limpiar al abrir/cerrar
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      correoDestinatarios.value = ''
    }
  },
)

const cerrar = () => {
  emit('update:modelValue', false)
}

const onEnviar = () => {
  const listaCorreos = correoDestinatarios.value
    .split(',')
    .map((c) => c.trim())
    .filter((c) => !!c)

  emit('submit', {
    correos: listaCorreos,
  })
}
</script>
