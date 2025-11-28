<template>
  <div class="usuario-view">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <q-spinner color="primary" size="60px" />
      <p>Cargando información del usuario...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <q-icon name="error" size="60px" color="negative" />
      <p>{{ error }}</p>
      <q-btn color="primary" label="Reintentar" @click="cargarUsuario" />
    </div>

    <!-- Content -->
    <div v-else-if="usuario" class="content-container">
      <!-- Header del usuario -->
      <UserHeader
        :usuario="usuario"
        @update-email="activarEdicionEmail"
        @update-password="mostrarDialogPassword"
      />

      <!-- Grid de tarjetas -->
      <div class="cards-grid">
        <UserInfoCard :usuario="usuario" />

        <AccessInfoCard
          :usuario="usuario"
          :edit-mode="editandoEmail"
          @update:email="emailEditado = $event"
        />
      </div>

      <!-- Botones de acción (solo visible en modo edición) -->
      <div v-if="editandoEmail" class="action-buttons">
        <q-btn
          flat
          no-caps
          label="Cancelar"
          color="grey-7"
          class="cancel-btn"
          @click="cancelarEdicion"
        />
        <q-btn
          unelevated
          no-caps
          label="Guardar cambios"
          color="primary"
          class="save-btn"
          @click="mostrarDialogConfirmar"
        />
      </div>
    </div>

    <!-- Dialog: Confirmar contraseña para cambiar email -->
    <ConfirmPasswordDialog v-model="dialogConfirmarPassword" @confirm="confirmarCambioEmail" />

    <!-- Dialog: Cambiar contraseña -->
    <ChangePasswordDialog v-model="dialogCambiarPassword" @save="guardarNuevaPassword" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import UserHeader from 'src/components/usuarios/UserHeader.vue'
import UserInfoCard from 'src/components/usuarios/UserInfoCard.vue'
import AccessInfoCard from 'src/components/usuarios/AccessInfoCard.vue'
import ConfirmPasswordDialog from 'src/components/usuarios/ConfirmPasswordDialog.vue'
import ChangePasswordDialog from 'src/components/usuarios/ChangePasswordDialog.vue'
import usuarioService from './usuarioService'

const $q = useQuasar()
const router = useRouter()

/* ------------------------------
   ESTADO
--------------------------------*/
const usuario = ref(null)
const loading = ref(false)
const error = ref(null)

const editandoEmail = ref(false)
const emailEditado = ref('')

const dialogConfirmarPassword = ref(false)
const dialogCambiarPassword = ref(false)

/* ------------------------------
   CARGAR DATOS
--------------------------------*/
const cargarUsuario = async () => {
  loading.value = true
  error.value = null

  try {
    // Obtener el ID del personal desde localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const personalId = userData.id_personal || 1

    console.log('📥 Intentando cargar personal con ID:', personalId)
    const data = await usuarioService.getUsuario(personalId)
    console.log('✅ Personal cargado exitosamente:', data)
    console.log('🔍 Datos del rol recibido:', data.rol)

    // Transformar la respuesta del backend al formato esperado por los componentes
    usuario.value = {
      id_usuario: data.idUsuario,
      username: data.username,
      correo: data.correoCorporativo,
      estado: data.estadoCuentaAcceso || data.estado,
      personal: {
        id_personal: data.idPersonal,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo_corporativo: data.correoCorporativo,
        documento: data.documento,
      },
      // Mapear el rol desde la respuesta del usuario
      rol: data.rol
        ? {
            id_rol_sistema: data.rol.idRolSistema,
            codigo: data.rol.codigo,
            nombre: data.rol.nombre,
            descripcion: data.rol.descripcion,
          }
        : data.nombreRol
          ? {
              nombre: data.nombreRol,
            }
          : null,
      // Datos adicionales del Personal
      tieneCuentaUsuario: data.tieneCuentaUsuario,
      cuentaActivada: data.cuentaActivada,
    }

    console.log('🎯 Usuario mapeado final:', usuario.value)
    console.log('🎯 Rol mapeado:', usuario.value.rol)
  } catch (err) {
    console.error('❌ Error en cargarUsuario:', err)
    console.error('📍 Detalles:', err.response?.status, err.response?.data)

    // Verificar si es error 404 (personal no existe) o error de conexión
    if (err.response?.status === 404) {
      error.value = 'Personal no encontrado en el sistema'
    } else if (!err.response) {
      // Backend no disponible - usar datos de prueba TEMPORALES
      console.warn('⚠️ Backend no disponible. Usando datos de PRUEBA temporales')
      usuario.value = {
        id_usuario: 1,
        username: 'usuario.test',
        correo: 'usuario@empresa.com',
        estado: 'ACTIVO',
        personal: {
          id_personal: 1,
          nombres: 'Usuario',
          apellidos: 'De Prueba',
          correo_corporativo: 'usuario.prueba@empresa.com',
          documento: '00000000-0',
        },
        rol: {
          nombre: 'Administrador',
        },
      }

      $q.notify({
        type: 'warning',
        message: '⚠️ Backend no disponible. Mostrando datos de prueba.',
        position: 'top',
        timeout: 5000,
      })

      loading.value = false
      return
    } else {
      error.value = `Error del servidor: ${err.response?.status || 'Desconocido'}`
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarUsuario()
})

/* ------------------------------
   EDICIÓN DE EMAIL
--------------------------------*/
const activarEdicionEmail = () => {
  editandoEmail.value = true
  emailEditado.value = usuario.value.personal?.correo_corporativo || usuario.value.correo || ''
}

const cancelarEdicion = () => {
  editandoEmail.value = false
  emailEditado.value = ''
}

const mostrarDialogConfirmar = () => {
  if (!emailEditado.value || !isValidEmail(emailEditado.value)) {
    $q.notify({
      type: 'negative',
      message: 'Por favor ingresa un correo electrónico válido',
      position: 'top',
    })
    return
  }

  dialogConfirmarPassword.value = true
}

const confirmarCambioEmail = async (password) => {
  try {
    console.log('🔄 Iniciando actualización de correo...')

    // Validar contraseña usando el correo actual del usuario
    const correoParaValidar = usuario.value.correo || usuario.value.personal.correo_corporativo
    console.log('🔍 Validando contraseña con correo:', correoParaValidar)

    const isValid = await usuarioService.validatePassword(correoParaValidar, password)

    if (!isValid) {
      console.error('❌ Contraseña incorrecta')
      throw new Error('Contraseña incorrecta')
    }

    console.log('✅ Contraseña validada correctamente')

    // Actualizar email en Personal
    if (usuario.value.personal) {
      console.log('📝 Actualizando correo en Personal...')
      await usuarioService.updatePersonal(usuario.value.personal.id_personal, {
        nombres: usuario.value.personal.nombres,
        apellidos: usuario.value.personal.apellidos,
        documento: usuario.value.personal.documento,
        correoCorporativo: emailEditado.value, // Usar camelCase como espera el backend
        estado: usuario.value.estado,
      })
      console.log('✅ Correo actualizado en Personal')
    }

    // Registrar alerta
    try {
      await usuarioService.createAlerta({
        id_solicitud: null,
        tipo_alerta: 'ACTUALIZACION',
        nivel: 'INFO',
        mensaje: `Personal ${usuario.value.personal.nombres} ${usuario.value.personal.apellidos} actualizó su correo corporativo`,
        estado: 'PENDIENTE',
        enviado_email: false,
      })
      console.log('✅ Alerta registrada')
    } catch (alertError) {
      console.warn('⚠️ No se pudo registrar la alerta:', alertError)
      // Continuar aunque falle la alerta
    }

    $q.notify({
      type: 'positive',
      message: 'Correo actualizado exitosamente. Redirigiendo al inicio de sesión...',
      position: 'top',
      timeout: 2500,
    })

    editandoEmail.value = false
    dialogConfirmarPassword.value = false

    // Redirigir al login después de 2 segundos
    console.log('🔄 Redirigiendo al login...')
    setTimeout(() => {
      // Limpiar localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('username')

      // Redirigir al login
      router.push('/login')
    }, 2500)
  } catch (err) {
    console.error('❌ Error en confirmarCambioEmail:', err)
    throw err // Para que el dialog maneje el error
  }
}

/* ------------------------------
   CAMBIO DE CONTRASEÑA
--------------------------------*/
const mostrarDialogPassword = () => {
  dialogCambiarPassword.value = true
}

const guardarNuevaPassword = async ({ currentPassword, newPassword }) => {
  try {
    console.log('🔄 Iniciando cambio de contraseña...')

    // Obtener el correo del usuario para el cambio de contraseña
    const emailUsuario = usuario.value.correo || usuario.value.personal.correo_corporativo
    console.log('📧 Email del usuario:', emailUsuario)

    // Cambiar contraseña en el backend
    await usuarioService.changePassword({
      email: emailUsuario,
      passwordActual: currentPassword,
      nuevaPassword: newPassword,
    })

    console.log('✅ Contraseña actualizada en el backend')

    // Registrar alerta
    try {
      await usuarioService.createAlerta({
        id_solicitud: null,
        tipo_alerta: 'SEGURIDAD',
        nivel: 'WARNING',
        mensaje: `Usuario ${usuario.value.username || usuario.value.personal.nombres} cambió su contraseña`,
        estado: 'PENDIENTE',
        enviado_email: true,
      })
      console.log('✅ Alerta de seguridad registrada')
    } catch (alertError) {
      console.warn('⚠️ No se pudo registrar la alerta de seguridad:', alertError)
      // Continuar aunque falle la alerta
    }

    $q.notify({
      type: 'positive',
      message: 'Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...',
      position: 'top',
      timeout: 2500,
    })

    dialogCambiarPassword.value = false

    // Redirigir al login después de 2.5 segundos
    console.log('🔄 Redirigiendo al login...')
    setTimeout(() => {
      // Limpiar localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('username')

      // Redirigir al login
      router.push('/login')
    }, 2500)
  } catch (err) {
    console.error('❌ Error en guardarNuevaPassword:', err)

    // Mostrar mensaje de error específico
    const errorMessage =
      err.response?.data?.message || err.message || 'Error al cambiar la contraseña'

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 3000,
    })

    throw err // Para que el dialog maneje el error
  }
}

/* ------------------------------
   UTILIDADES
--------------------------------*/
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
</script>

<style scoped>
.usuario-view {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
}

/* Loading y Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-container p,
.error-container p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Contenido principal */
.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Grid de tarjetas */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

/* Botones de acción */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
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

.save-btn {
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

.save-btn:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .usuario-view {
    padding: 16px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
