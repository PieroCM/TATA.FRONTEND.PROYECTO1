<template>
  <div class="usuario-view">
    <div v-if="loading" class="loading-container">
      <q-spinner color="primary" size="60px" />
      <p>Cargando información del usuario...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <q-icon name="error" size="60px" color="negative" />
      <p>{{ error }}</p>
      <q-btn color="primary" label="Reintentar" @click="cargarUsuario" />
    </div>

    <div v-else-if="usuario" class="content-container">
      <UserHeader
        :usuario="usuario"
        @update-email="activarEdicionEmail"
        @update-password="mostrarDialogPassword"
      />

      <div class="cards-grid">
        <UserInfoCard :usuario="usuario" />

        <AccessInfoCard
          :usuario="usuario"
          :edit-mode="editandoEmail"
          @update:email="emailEditado = $event"
        />
      </div>

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

    <ConfirmPasswordDialog v-model="dialogConfirmarPassword" @confirm="confirmarCambioEmail" />

    <ChangePasswordDialog v-model="dialogCambiarPassword" @save="guardarNuevaPassword" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
//import { useRouter } from 'vue-router'
import axios from 'axios'
import { api } from 'boot/axios'
import UserHeader from 'src/components/usuarios/UserHeader.vue'
import UserInfoCard from 'src/components/usuarios/UserInfoCard.vue'
import AccessInfoCard from 'src/components/usuarios/AccessInfoCard.vue'
import ConfirmPasswordDialog from 'src/components/usuarios/ConfirmPasswordDialog.vue'
import ChangePasswordDialog from 'src/components/usuarios/ChangePasswordDialog.vue'

const $q = useQuasar()
//const router = useRouter()

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
    // Obtener el ID del personal desde authUser (estructura oficial)
    const rawAuthUser = localStorage.getItem('authUser')
    let personalId = null

    if (rawAuthUser) {
      const authUser = JSON.parse(rawAuthUser)

      personalId =
        authUser.idPersonal ?? // formato de tu authUser actual
        authUser.id_personal ?? // por si en algún momento vino snake_case
        authUser.IdPersonal ?? // por si viene PascalCase
        null
    }

    if (!personalId) {
      console.error('❌ No se encontró idPersonal en authUser (localStorage)')
      error.value = 'No se pudo identificar al usuario actual. Inicia sesión nuevamente.'
      loading.value = false
      // opcional:
      // router.push('/login')
      return
    }

    console.log('📥 Intentando cargar personal con ID:', personalId)

    // GET /api/Personal/{id}
    const personalResponse = await api.get(`/api/Personal/${personalId}`)
    const personalData = personalResponse.data
    console.log('✅ Personal cargado exitosamente:', personalData)

    let data = personalData

    // Si tiene usuario vinculado, obtener datos completos del usuario con rol
    if (personalData.idUsuario) {
      console.log('🔍 Obteniendo datos de usuario:', personalData.idUsuario)
      const usuarioResponse = await api.get(`/api/Usuario/${personalData.idUsuario}`)
      const usuarioData = usuarioResponse.data
      console.log('✅ Usuario obtenido:', usuarioData)

      // Obtener información del rol del sistema
      let rolData = null
      if (usuarioData.idRolSistema) {
        console.log('🔍 Obteniendo rol del sistema:', usuarioData.idRolSistema)
        try {
          const rolResponse = await api.get(`/api/RolesSistema/${usuarioData.idRolSistema}`)
          rolData = rolResponse.data
          console.log('✅ Rol obtenido:', rolData)
        } catch (rolError) {
          console.warn('⚠️ No se pudo obtener el rol:', rolError)
        }
      }

      // Combinar datos de Personal, Usuario y Rol
      data = {
        ...personalData,
        username: usuarioData.username,
        estadoCuentaAcceso: usuarioData.estado,
        idRolSistema: usuarioData.idRolSistema,
        rol: rolData,
      }
    }

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

    // MERGED: Validación robusta combinando ambas ramas
    // Prioriza el correo del usuario, pero hace fallback al personal si es necesario
    const correoParaValidar = usuario.value.correo || usuario.value.personal?.correo_corporativo

    console.log('🔍 Validando contraseña con correo:', correoParaValidar)

    // POST /api/Usuario/signin para validar contraseña (sin token)
    try {
      await axios.post(
        'http://localhost:5260/api/Usuario/signin',
        {
          email: correoParaValidar,
          password: password,
        },
        { headers: { 'Content-Type': 'application/json' } },
      )
      console.log('✅ Contraseña validada correctamente')
    } catch (validateError) {
      console.error('❌ Contraseña incorrecta')
      throw new Error('Contraseña incorrecta')
    }

    // PUT /api/Personal/{id} - Actualizar email en Personal
    if (usuario.value.personal) {
      console.log('📝 Actualizando correo en Personal...')
      await api.put(`/api/Personal/${usuario.value.personal.id_personal}`, {
        nombres: usuario.value.personal.nombres,
        apellidos: usuario.value.personal.apellidos,
        documento: usuario.value.personal.documento,
        correoCorporativo: emailEditado.value,
        estado: usuario.value.estado,
      })
      console.log('✅ Correo actualizado en Personal')
    }

    // POST /api/Alerta - Registrar alerta
    try {
      await api.post('/api/Alerta', {
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
      message: 'Correo actualizado exitosamente',
      position: 'top',
      timeout: 3000,
    })

    editandoEmail.value = false
    dialogConfirmarPassword.value = false

    // Recargar datos del usuario para reflejar el cambio
    await cargarUsuario()
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

    // PUT /api/Usuario/cambiar-password - Cambiar contraseña en el backend
    await api.put('/api/Usuario/cambiar-password', {
      Email: emailUsuario,
      PasswordActual: currentPassword,
      NuevaPassword: newPassword,
    })

    console.log('✅ Contraseña actualizada en el backend')

    // POST /api/Alerta - Registrar alerta de seguridad
    try {
      await api.post('/api/Alerta', {
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
      message: 'Contraseña actualizada exitosamente',
      caption: 'Tu contraseña ha sido cambiada de forma segura',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000,
    })

    dialogCambiarPassword.value = false
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
