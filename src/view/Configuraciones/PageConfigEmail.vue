<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-primary text-weight-bold">Configuración de Email</div>
        <div class="text-body2 text-grey-7">
          Gestiona los parámetros de notificación y revisa el historial de envíos
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- SECCIÓN 1: Parámetros de Configuración -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 text-primary q-mb-md">Configuración de Notificaciones</div>

            <q-form @submit="guardarConfiguracion" class="q-gutter-md">
              <!-- Destinatario -->
              <q-input
                v-model="form.destinatario"
                label="Destinatario"
                type="email"
                filled
                dense
                :rules="[
                  (val) => !!val || 'El destinatario es requerido',
                  (val) => /.+@.+\..+/.test(val) || 'Email inválido',
                ]"
              >
                <template #prepend>
                  <q-icon name="mail" />
                </template>
              </q-input>

              <!-- Toggle Envío Inmediato -->
              <div class="row items-center">
                <div class="col">
                  <div class="text-body1">Envío Inmediato</div>
                  <div class="text-caption text-grey-7">Alerta en tiempo real</div>
                </div>
                <div class="col-auto">
                  <q-toggle v-model="form.envioInmediato" color="primary" size="lg" />
                </div>
              </div>

              <!-- Hora de Resumen -->
              <q-input v-model="form.horaResumen" label="Hora de Resumen" filled dense readonly>
                <template #prepend>
                  <q-icon name="schedule" />
                </template>
                <template #append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="form.horaResumen" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <!-- Botones de acción -->
              <div class="row q-gutter-sm">
                <q-btn
                  label="Guardar Cambios"
                  type="submit"
                  color="primary"
                  unelevated
                  :loading="slaStore.loading"
                  class="col"
                />
                <q-btn
                  label="Probar Envío"
                  color="primary"
                  outline
                  @click="probarEnvio"
                  class="col"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- SECCIÓN 2: Historial de Envíos -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6 text-primary">Historial de Envíos</div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  dense
                  round
                  icon="refresh"
                  color="primary"
                  @click="cargarHistorial"
                  :loading="slaStore.loading"
                >
                  <q-tooltip>Actualizar</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- Tabla de historial -->
            <q-table
              :rows="slaStore.historialEnvios"
              :columns="columnasHistorial"
              row-key="id"
              :loading="slaStore.loading"
              flat
              dense
              :pagination="{ rowsPerPage: 5 }"
              hide-bottom
            >
              <!-- Columna Fecha -->
              <template v-slot:body-cell-fecha="props">
                <q-td :props="props">
                  {{ formatearFecha(props.row.fecha) }}
                </q-td>
              </template>

              <!-- Columna Tipo -->
              <template v-slot:body-cell-tipo="props">
                <q-td :props="props">
                  <q-chip
                    dense
                    :color="props.row.tipo === 'Resumen' ? 'blue-2' : 'purple-2'"
                    :text-color="props.row.tipo === 'Resumen' ? 'blue-9' : 'purple-9'"
                  >
                    {{ props.row.tipo }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Columna Estado -->
              <template v-slot:body-cell-estado="props">
                <q-td :props="props">
                  <q-chip
                    dense
                    :color="props.row.estado === 'Enviado' ? 'green-2' : 'red-2'"
                    :text-color="props.row.estado === 'Enviado' ? 'green-9' : 'red-9'"
                  >
                    {{ props.row.estado }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Sin datos -->
              <template v-slot:no-data>
                <div class="full-width column flex-center text-grey-7 q-py-md">
                  <q-icon name="history" size="2em" class="q-mb-sm" />
                  <span class="text-caption">No hay registros de envíos</span>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSlaStore } from 'stores/useSlaStore'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const slaStore = useSlaStore()

// Formulario de configuración
const form = ref({
  destinatario: '',
  envioInmediato: true,
  horaResumen: '06:00',
})

// Columnas del historial
const columnasHistorial = [
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'left',
    field: 'fecha',
    sortable: true,
  },
  {
    name: 'tipo',
    label: 'Tipo',
    align: 'center',
    field: 'tipo',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    align: 'center',
    field: 'cantidad',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: 'estado',
    sortable: true,
  },
]

// Formatear fecha
const formatearFecha = (fechaStr) => {
  return date.formatDate(fechaStr, 'DD-MM-YYYY HH:mm')
}

// Cargar historial
const cargarHistorial = async () => {
  try {
    await slaStore.fetchHistorial()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el historial',
      position: 'bottom-right',
    })
  }
}

// Guardar configuración
const guardarConfiguracion = async () => {
  try {
    const result = await slaStore.saveConfig(form.value)

    $q.notify({
      type: 'positive',
      message: result.message,
      position: 'bottom-right',
      timeout: 2000,
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la configuración',
      position: 'bottom-right',
    })
  }
}

// Probar envío
const probarEnvio = () => {
  $q.dialog({
    title: 'Probar Envío',
    message: `Se enviará un correo de prueba a: ${form.value.destinatario}`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.notify({
      type: 'info',
      message: 'Enviando correo de prueba...',
      position: 'bottom-right',
      timeout: 1500,
    })

    // Simular envío
    setTimeout(() => {
      $q.notify({
        type: 'positive',
        message: 'Correo de prueba enviado correctamente',
        position: 'bottom-right',
        timeout: 2000,
      })
    }, 1500)
  })
}

onMounted(() => {
  // Cargar configuración existente
  form.value = { ...slaStore.configuracion }

  // Cargar historial
  cargarHistorial()
})
</script>

<style scoped>
.q-table {
  border-radius: 8px;
}
</style>
