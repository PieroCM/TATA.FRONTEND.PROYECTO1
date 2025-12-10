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
          <!-- Campo 1: Selección de Destinatario -->
          <div class="form-field">
            <label class="text-weight-bold text-body2 q-mb-md block">
              📧 Destinatario del Resumen
              <span class="text-negative">*</span>
            </label>

            <!-- Select con carga dinámica -->
            <q-select
              v-model="idUsuarioSeleccionado"
              :options="opcionesUsuarios"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
              :loading="cargandoUsuarios"
              :disable="cargandoUsuarios"
              label="Selecciona un destinatario"
              hint="Administradores y Analistas disponibles"
              :rules="[(val) => val !== null || 'Debes seleccionar un destinatario']"
            >
              <template v-slot:prepend>
                <q-icon name="person_search" color="primary" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    <q-item-label>No hay usuarios disponibles</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Tarjeta de Información del Usuario Seleccionado -->
            <transition name="fade">
              <div v-if="usuarioSeleccionado" class="q-mt-md">
                <q-card flat bordered class="usuario-detalle-card">
                  <q-card-section class="q-pa-md">
                    <div class="row items-center q-mb-md">
                      <q-avatar color="primary" text-color="white" size="56px" class="q-mr-md">
                        <span class="text-h6">{{ obtenerIniciales(usuarioSeleccionado) }}</span>
                      </q-avatar>
                      <div class="col">
                        <div class="text-h6 text-weight-bold text-grey-9">
                          {{ usuarioSeleccionado.nombreCompleto }}
                        </div>
                        <q-badge
                          :label="usuarioSeleccionado.nombreRol"
                          color="primary"
                          class="q-mt-xs"
                        />
                      </div>
                    </div>

                    <q-separator class="q-mb-md" />

                    <div class="info-rows">
                      <!-- Fila: Nombre Completo -->
                      <div class="info-row">
                        <div class="info-label">
                          <q-icon name="person" color="grey-7" size="20px" class="q-mr-sm" />
                          <span class="text-weight-medium text-grey-7">Nombre:</span>
                        </div>
                        <div class="info-value text-grey-9 text-weight-medium">
                          {{ nombreCompletoPersonal || 'Cargando...' }}
                        </div>
                      </div>

                      <!-- Fila: Correo Corporativo -->
                      <div class="info-row">
                        <div class="info-label">
                          <q-icon name="email" color="grey-7" size="20px" class="q-mr-sm" />
                          <span class="text-weight-medium text-grey-7">Correo:</span>
                        </div>
                        <div class="info-value text-primary text-weight-medium">
                          {{ usuarioSeleccionado.correoCorporativo }}
                        </div>
                      </div>

                      <!-- Fila: Rol del Sistema -->
                      <div class="info-row">
                        <div class="info-label">
                          <q-icon
                            name="admin_panel_settings"
                            color="grey-7"
                            size="20px"
                            class="q-mr-sm"
                          />
                          <span class="text-weight-medium text-grey-7">Rol:</span>
                        </div>
                        <div class="info-value text-grey-9">
                          {{ usuarioSeleccionado.nombreRol }}
                        </div>
                      </div>
                    </div>

                    <!-- Banner de confirmación -->
                    <q-banner dense rounded class="bg-green-1 text-positive q-mt-md">
                      <template v-slot:avatar>
                        <q-icon name="check_circle" color="positive" />
                      </template>
                      <span class="text-body2"
                        >Los correos de resumen se enviarán a este destinatario.</span
                      >
                    </q-banner>
                  </q-card-section>
                </q-card>
              </div>
            </transition>
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
                  v-model="configuracion.horaResumen"
                  readonly
                  dense
                  style="max-width: 250px"
                  hint="Selecciona la hora para enviar el resumen"
                  class="time-picker-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="access_time" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="schedule" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time
                          v-model="configuracion.horaResumen"
                          mask="HH:mm:ss"
                          format24h
                          with-seconds
                          class="time-picker-popup"
                        >
                          <div class="row items-center justify-end q-gutter-sm">
                            <q-btn label="Cancelar" color="grey-7" flat v-close-popup />
                            <q-btn label="Aceptar" color="primary" flat v-close-popup />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
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
              :disable="!puedeGuardar"
            />
            <q-btn
              outline
              color="grey-7"
              icon="send"
              label="Probar envío"
              @click="probarEnvio"
              class="q-px-xl"
              :loading="probando"
              :disable="!puedeProbarEnvio"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Tarjeta Inferior: Ejecuciones (Historial) -->
    <TablaEjecuciones ref="tablaEjecucionesRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import TablaEjecuciones from './TablaEjecuciones.vue'

const $q = useQuasar()

// Referencia al componente hijo TablaEjecuciones
const tablaEjecucionesRef = ref(null)

// Estado de la configuración (mapea al DTO del backend)
const configuracion = ref({
  destinatarioResumen: '',
  envioInmediato: false,
  resumenDiario: false,
  horaResumen: '06:00:00', // Backend espera TimeSpan formato "HH:mm:ss"
})

// Estados de carga
const guardando = ref(false)
const probando = ref(false)
const cargando = ref(false)

// Estados para obtener usuarios destinatarios
const cargandoUsuarios = ref(false)
const totalUsuarios = ref(null)
const listaUsuarios = ref([])
const idUsuarioSeleccionado = ref(null)
const nombreCompletoPersonal = ref('')

// Estado para rastrear si hubo cambios
const configuracionInicial = ref(null)

/**
 * Computed para opciones del select (mapeo de usuarios a formato Quasar)
 */
const opcionesUsuarios = computed(() => {
  return listaUsuarios.value.map((usuario) => ({
    label: `${usuario.nombreCompleto} - ${usuario.correoCorporativo}`,
    value: usuario.idUsuario,
  }))
})

/**
 * Computed para obtener el objeto completo del usuario seleccionado
 * Esta es la lógica clave: buscar con .find() usando el ID seleccionado
 */
const usuarioSeleccionado = computed(() => {
  if (idUsuarioSeleccionado.value === null) return null
  return listaUsuarios.value.find((usuario) => usuario.idUsuario === idUsuarioSeleccionado.value)
})

/**
 * Obtiene el nombre completo desde la API de personal usando el ID del usuario
 */
const obtenerNombrePersonal = async (idUsuario) => {
  if (!idUsuario) {
    nombreCompletoPersonal.value = 'Nombre no disponible'
    return
  }

  try {
    console.log(`👤 Obteniendo datos de personal para ID: ${idUsuario}`)
    const response = await api.get(`/api/personal/${idUsuario}`)

    if (response.data) {
      // Construir nombre completo desde la API de personal
      const personal = response.data
      const nombre = personal.nombre || ''
      const apellidoPaterno = personal.apellidoPaterno || ''
      const apellidoMaterno = personal.apellidoMaterno || ''

      nombreCompletoPersonal.value = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim()
      console.log(`✅ Nombre obtenido: ${nombreCompletoPersonal.value}`)
    } else {
      nombreCompletoPersonal.value = 'Nombre no disponible'
    }
  } catch (error) {
    console.error('❌ Error al obtener datos de personal:', error)
    nombreCompletoPersonal.value = 'Error al obtener nombre'
  }
}

/**
 * Función auxiliar para obtener iniciales del nombre
 */
const obtenerIniciales = (usuario) => {
  if (!usuario || !usuario.nombreCompleto) return '??'
  const palabras = usuario.nombreCompleto.trim().split(' ')
  if (palabras.length === 1) return palabras[0].substring(0, 2).toUpperCase()
  return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
}

/**
 * Computed para habilitar/deshabilitar el botón Guardar
 */
const puedeGuardar = computed(() => {
  // Si no hay configuración inicial cargada, deshabilitar
  if (!configuracionInicial.value) return false

  // Verificar si hay cambios
  const huboGambios =
    configuracion.value.destinatarioResumen !== configuracionInicial.value.destinatarioResumen ||
    configuracion.value.envioInmediato !== configuracionInicial.value.envioInmediato ||
    configuracion.value.resumenDiario !== configuracionInicial.value.resumenDiario ||
    configuracion.value.horaResumen !== configuracionInicial.value.horaResumen

  if (!huboGambios) return false

  // Validar que se haya seleccionado un destinatario
  if (idUsuarioSeleccionado.value === null) return false

  // Si resumenDiario está activo, validar hora
  if (configuracion.value.resumenDiario) {
    if (!configuracion.value.horaResumen?.trim()) return false

    // Validar formato HH:mm:ss
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/
    if (!timeRegex.test(configuracion.value.horaResumen)) return false
  }

  return true
})

/**
 * Computed para habilitar/deshabilitar el botón Probar envío
 */
const puedeProbarEnvio = computed(() => {
  // Verificar que haya un usuario seleccionado
  if (idUsuarioSeleccionado.value === null) return false

  return true
})

/**
 * Obtiene el total de usuarios administradores y analistas
 */
const obtenerUsuarios = async () => {
  cargandoUsuarios.value = true
  totalUsuarios.value = null

  try {
    console.log('👥 Obteniendo administradores y analistas...')
    const response = await api.get('/api/email/administradores-analistas')

    if (response.data && response.data.success) {
      totalUsuarios.value = response.data.total
      listaUsuarios.value = response.data.usuarios || []
      console.log(`✅ Total de usuarios: ${totalUsuarios.value}`)
      console.log('📝 Lista de usuarios:', listaUsuarios.value)
    } else {
      console.warn('⚠️ Respuesta inesperada de la API:', response.data)
      totalUsuarios.value = 0
      listaUsuarios.value = []
    }
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error)
    totalUsuarios.value = null
    listaUsuarios.value = []

    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener la lista de usuarios',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    cargandoUsuarios.value = false
  }
}

/**
 * Carga la configuración desde el backend
 */
const cargarConfiguracion = async () => {
  cargando.value = true

  try {
    console.log('📋 Cargando configuración de email...')
    const response = await api.get('/api/email/config')

    if (response.data) {
      // Mapear respuesta del backend al estado local
      configuracion.value = {
        destinatarioResumen: response.data.destinatarioResumen || '',
        envioInmediato: response.data.envioInmediato || false,
        resumenDiario: response.data.resumenDiario || false,
        horaResumen: response.data.horaResumen || '06:00:00',
      }

      // Cargar usuarios destinatarios
      await obtenerUsuarios()

      // Si el destinatario no es "ALL", intentar encontrar el ID del usuario
      if (response.data.destinatarioResumen && response.data.destinatarioResumen !== 'ALL') {
        // Buscar usuario por correo corporativo
        const usuarioEncontrado = listaUsuarios.value.find(
          (u) => u.correoCorporativo === response.data.destinatarioResumen,
        )
        if (usuarioEncontrado) {
          idUsuarioSeleccionado.value = usuarioEncontrado.idUsuario
        }
      }

      // Guardar configuración inicial para detectar cambios
      configuracionInicial.value = { ...configuracion.value }

      console.log('✅ Configuración cargada:', configuracion.value)
      console.log('👤 Usuario seleccionado ID:', idUsuarioSeleccionado.value)
    }
  } catch (error) {
    console.error('❌ Error al cargar configuración:', error)

    $q.notify({
      type: 'warning',
      message: 'No se pudo cargar la configuración. Usando valores por defecto.',
      position: 'top-right',
      timeout: 3000,
    })

    // Establecer configuración inicial como valores por defecto
    configuracionInicial.value = { ...configuracion.value }
  } finally {
    cargando.value = false
  }
}

/**
 * Guarda la configuración en el backend
 */
const guardarConfiguracion = async () => {
  guardando.value = true

  try {
    // Preparar el payload con el correo del usuario seleccionado
    const payload = {
      ...configuracion.value,
      destinatarioResumen: usuarioSeleccionado.value?.correoCorporativo || '',
    }

    console.log('💾 Guardando configuración:', payload)
    console.log('👤 Destinatario seleccionado:', usuarioSeleccionado.value)

    // Llamar a PUT /api/email/config
    await api.put('/api/email/config/1', payload) // Actualizar configuración inicial después de guardar exitosamente
    configuracionInicial.value = { ...configuracion.value }

    $q.notify({
      type: 'positive',
      message: 'Configuración guardada correctamente',
      position: 'top-right',
      icon: 'check_circle',
      timeout: 2000,
    })

    console.log('✅ Configuración guardada exitosamente')
  } catch (error) {
    console.error('❌ Error al guardar:', error)

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar la configuración',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    guardando.value = false
  }
}

/**
 * Prueba el envío de resumen diario
 */
const probarEnvio = async () => {
  probando.value = true

  try {
    console.log('📧 Probando envío de resumen a:', configuracion.value.destinatarioResumen)

    // Llamar a POST /api/email/send-summary
    const response = await api.post('/api/email/send-summary')

    // Capturar el mensaje de respuesta del backend
    const mensaje = response.data?.mensaje || response.data?.message || ''

    console.log('📩 Respuesta del servidor:', response.data)

    // Verificar si no había alertas para enviar
    if (mensaje.toLowerCase().includes('no se encontraron alertas')) {
      $q.notify({
        type: 'warning',
        message: 'No hay alertas pendientes para enviar en este momento.',
        position: 'top-right',
        icon: 'info',
        timeout: 3000,
      })

      console.log('⚠️ Sin alertas para enviar - No se registra ejecución')

      // No recargar tabla porque no hubo registro de ejecución
    } else {
      // Envío exitoso con alertas
      $q.notify({
        type: 'positive',
        message: 'Resumen de alertas enviado correctamente.',
        position: 'top-right',
        icon: 'send',
        timeout: 2000,
      })

      console.log('✅ Resumen enviado exitosamente')

      // Recargar tabla de ejecuciones solo cuando hubo envío real
      if (tablaEjecucionesRef.value && tablaEjecucionesRef.value.cargarEjecuciones) {
        console.log('🔄 Recargando historial de ejecuciones...')
        await tablaEjecucionesRef.value.cargarEjecuciones()
      }
    }
  } catch (error) {
    console.error('❌ Error al probar envío:', error)

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al enviar resumen de prueba',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    probando.value = false
  }
}

// Watcher: Cuando se selecciona un usuario, obtener su nombre desde la API de personal
watch(idUsuarioSeleccionado, (nuevoId) => {
  if (nuevoId !== null) {
    obtenerNombrePersonal(nuevoId)
  } else {
    nombreCompletoPersonal.value = ''
  }
})

// Cargar configuración al montar el componente
onMounted(() => {
  cargarConfiguracion()
})
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

/* ===== TARJETA DE DETALLES DEL USUARIO SELECCIONADO ===== */
.usuario-detalle-card {
  border: 2px solid #e0e7ff;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.usuario-detalle-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s ease;
}

.info-row:hover {
  border-color: #cbd5e1;
}

.info-label {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-value {
  font-size: 14px;
  text-align: right;
  word-break: break-word;
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
