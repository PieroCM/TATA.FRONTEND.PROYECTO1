<template>
  <div class="tab-automatizacion">
    <!-- Tarjeta Superior: Parámetros -->
    <q-card flat bordered class="parametros-card q-mb-xl">
      <q-card-section>
        <div class="card-header q-mb-lg">
          <q-icon name="email" color="primary" size="24px" class="q-mr-sm" />
          <h2 class="text-h6 text-weight-semibold q-ma-none">Parámetros</h2>
        </div>

        <q-form @submit="guardarConfiguracion" class="q-gutter-lg">
          <!-- Campo 1: Destinatario -->
          <div class="form-field">
            <label class="text-weight-bold text-body2 q-mb-xs block">
              Destinatario
              <span class="text-negative">*</span>
            </label>
            <q-input
              outlined
              v-model="configuracion.destinatario"
              placeholder="correo@empresa.com"
              dense
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
          </div>

          <!-- Campo 2: Envío Inmediato -->
          <div class="form-field">
            <div class="toggle-field">
              <div class="toggle-info">
                <div class="text-weight-bold text-body1 q-mb-xs">Envío inmediato</div>
                <div class="text-caption text-grey-7">
                  Envía correo cuando se crea/actualiza una alerta con estado = nueva.
                </div>
              </div>
              <q-toggle
                v-model="configuracion.envioInmediato"
                color="primary"
                size="lg"
                class="toggle-switch"
              />
            </div>
          </div>

          <!-- Campo 3: Resumen Diario -->
          <div class="form-field">
            <div class="toggle-field">
              <div class="toggle-info">
                <div class="text-weight-bold text-body1 q-mb-xs">Resumen diario</div>
                <div class="text-caption text-grey-7">
                  Envía un resumen consolidado de todas las alertas del día.
                </div>
              </div>
              <q-toggle
                v-model="configuracion.resumenDiario"
                color="primary"
                size="lg"
                class="toggle-switch"
              />
            </div>

            <!-- Sub-elemento condicional: Hora de envío -->
            <transition name="fade">
              <div v-if="configuracion.resumenDiario" class="hora-envio q-mt-md q-ml-md">
                <label class="text-weight-medium text-body2 q-mb-xs block"> Hora de envío </label>
                <q-input
                  outlined
                  v-model="configuracion.horaEnvio"
                  type="time"
                  dense
                  style="max-width: 200px"
                >
                  <template v-slot:prepend>
                    <q-icon name="access_time" />
                  </template>
                </q-input>
              </div>
            </transition>
          </div>

          <!-- Barra de Acciones -->
          <div class="acciones-footer">
            <q-btn
              unelevated
              color="primary"
              icon="check"
              label="Guardar"
              type="submit"
              class="q-px-xl"
              :loading="guardando"
            />
            <q-btn
              outline
              color="grey-7"
              icon="send"
              label="Probar envío"
              @click="probarEnvio"
              class="q-px-xl"
              :loading="probando"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Tarjeta Inferior: Ejecuciones (Historial) -->
    <TablaEjecuciones />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import TablaEjecuciones from './TablaEjecuciones.vue'

const $q = useQuasar()

// Estado de la configuración
const configuracion = ref({
  destinatario: 'alertas@empresa.com',
  envioInmediato: true,
  resumenDiario: true,
  horaEnvio: '06:00',
})

// Estados de carga
const guardando = ref(false)
const probando = ref(false)

/**
 * Guarda la configuración
 */
const guardarConfiguracion = async () => {
  guardando.value = true

  try {
    // Simular llamada API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('Guardando configuración:', configuracion.value)

    $q.notify({
      type: 'positive',
      message: 'Configuración guardada correctamente',
      position: 'top-right',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la configuración',
      position: 'top-right',
    })
  } finally {
    guardando.value = false
  }
}

/**
 * Prueba el envío de email
 */
const probarEnvio = async () => {
  probando.value = true

  try {
    // Simular llamada API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log('Probando envío a:', configuracion.value.destinatario)

    $q.notify({
      type: 'positive',
      message: 'Email de prueba enviado correctamente',
      position: 'top-right',
      icon: 'send',
    })
  } catch (error) {
    console.error('Error al probar envío:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar email de prueba',
      position: 'top-right',
    })
  } finally {
    probando.value = false
  }
}
</script>

<style scoped>
.tab-automatizacion {
  width: 100%;
}

/* ===== TARJETAS ===== */
.parametros-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
}

/* ===== FORMULARIO ===== */
.form-field {
  margin-bottom: 24px;
}

label.block {
  display: block;
}

.toggle-field {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.toggle-info {
  flex: 1;
  padding-right: 16px;
}

.toggle-switch {
  flex-shrink: 0;
}

.hora-envio {
  padding-left: 16px;
  border-left: 3px solid #2563eb;
}

/* Transición fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== ACCIONES FOOTER ===== */
.acciones-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .toggle-field {
    flex-direction: column;
    gap: 16px;
  }

  .toggle-info {
    padding-right: 0;
  }

  .acciones-footer {
    flex-direction: column;
  }

  .acciones-footer .q-btn {
    width: 100%;
  }
}
</style>
