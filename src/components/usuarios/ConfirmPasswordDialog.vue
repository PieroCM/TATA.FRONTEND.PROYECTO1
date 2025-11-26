<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="confirm-dialog">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <q-icon name="verified_user" size="32px" color="primary" />
          <h3 class="dialog-title">Confirmar Acción</h3>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Contenido -->
      <q-card-section class="dialog-body">
        <p class="dialog-message">Para confirmar esta acción, ingresa tu contraseña actual.</p>

        <q-input
          v-model="password"
          outlined
          :type="showPassword ? 'text' : 'password'"
          label="Contraseña Actual"
          placeholder="Ingresa tu contraseña"
          class="password-input"
          @keyup.enter="confirmar"
        >
          <template #prepend>
            <q-icon name="lock" color="grey-6" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              color="grey-6"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <div v-if="errorMessage" class="error-message">
          <q-icon name="error" size="18px" />
          {{ errorMessage }}
        </div>
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions class="dialog-actions">
        <q-btn flat no-caps label="Cancelar" color="grey-7" class="cancel-btn" @click="cancelar" />
        <q-btn
          unelevated
          no-caps
          label="Confirmar"
          color="primary"
          class="confirm-btn"
          :loading="loading"
          @click="confirmar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const showDialog = ref(props.modelValue)
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const loading = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    showDialog.value = val
    if (val) {
      // Reset al abrir
      password.value = ''
      errorMessage.value = ''
      showPassword.value = false
    }
  },
)

watch(showDialog, (val) => {
  emit('update:modelValue', val)
})

const cancelar = () => {
  showDialog.value = false
  password.value = ''
  errorMessage.value = ''
}

const confirmar = async () => {
  if (!password.value) {
    errorMessage.value = 'Por favor ingresa tu contraseña'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await emit('confirm', password.value)
    // Si llega aquí sin error, cerrar el diálogo
    password.value = ''
    showDialog.value = false
  } catch (error) {
    errorMessage.value = 'Contraseña incorrecta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.confirm-dialog {
  min-width: 420px;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 24px 24px 20px 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.dialog-body {
  padding: 24px;
}

.dialog-message {
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.password-input {
  margin-bottom: 8px;
}

.password-input :deep(.q-field__control) {
  border-radius: 10px;
}

.password-input :deep(input) {
  font-size: 15px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 14px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 3px solid #dc2626;
}

.dialog-actions {
  padding: 16px 24px 24px 24px;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f3f4f6;
}

.confirm-btn {
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

@media (max-width: 500px) {
  .confirm-dialog {
    min-width: 90vw;
    max-width: 95vw;
  }

  .dialog-header {
    padding: 20px;
  }

  .dialog-body {
    padding: 20px;
  }

  .dialog-actions {
    padding: 16px 20px 20px 20px;
  }
}
</style>
