<template>
  <div class="sala-comunicaciones">
    <div class="comunicaciones-layout">
      <!-- COLUMNA IZQUIERDA: Destinatarios -->
      <ListaDestinatarios
        :usuarios="usuariosPreview"
        :opciones-slas="opcionesSlas"
        :opciones-roles="opcionesRoles"
        :cargando="cargandoPreview"
        @eliminar-usuario="eliminarUsuario"
        @filtrar="aplicarFiltros"
      />

      <!-- COLUMNA DERECHA: Redactar Comunicado -->
      <FormularioComunicado
        :cantidad-usuarios="usuariosPreview.length"
        @enviar-prueba="enviarPrueba"
        @enviar-comunicado="enviarComunicado"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/useAuthStore'
import ListaDestinatarios from './ListaDestinatarios.vue'
import FormularioComunicado from './FormularioComunicado.vue'

const $q = useQuasar()
const authStore = useAuthStore()

// --- ESTADOS ---
const cargandoPreview = ref(false)
const usuariosPreview = ref([])

// Filtros Reactivos
const filtros = ref({
  idSla: null,
  idRol: null,
})

// Opciones Selectores
const opcionesSlas = ref([])
const opcionesRoles = ref([])

// --- 1. CARGA INICIAL DE SELECTORES ---
const cargarSelectores = async () => {
  try {
    // console.log('📋 Iniciando carga de selectores...')

    // Cargar roles y SLAs en paralelo
    const [resSlas, resRoles] = await Promise.all([
      api.get('/api/email/slas'),
      api.get('/api/email/roles'),
    ])

    // console.log('📦 Respuesta SLAs:', resSlas.data)
    // console.log('📦 Respuesta Roles:', resRoles.data)

    // Mapear respuestas - el backend devuelve { total: n, slas: [...], roles: [...] }
    const slas = resSlas.data.slas || []
    const roles = resRoles.data.roles || []

    opcionesSlas.value = [
      { id: null, nombre: 'Todos' },
      ...slas.map((s) => ({
        id: s.id,
        nombre: s.descripcion || s.nombre, // Backend usa 'descripcion'
      })),
    ]

    opcionesRoles.value = [
      { id: null, nombre: 'Todos' },
      ...roles.map((r) => ({
        id: r.id,
        nombre: r.descripcion || r.nombre, // Backend usa 'descripcion'
      })),
    ]

    // console.log('✅ SLAs procesados:', opcionesSlas.value)
    // console.log('✅ Roles procesados:', opcionesRoles.value)
  } catch (error) {
    // console.error('❌ Error cargando selectores:', error)
    // console.error('❌ Detalles:', error.response?.data)
    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar los filtros',
      position: 'top-right',
    })
    // Fallback
    opcionesRoles.value = [{ id: null, nombre: 'Todos' }]
    opcionesSlas.value = [{ id: null, nombre: 'Todos' }]
  }
}

// --- 2. VISTA PREVIA DE DESTINATARIOS ---
const aplicarFiltros = ({ idSla, idRol }) => {
  // console.log('🔍 Filtros recibidos:', { idSla, idRol })
  filtros.value.idSla = idSla === 'Todos' || idSla === null ? null : idSla
  filtros.value.idRol = idRol === 'Todos' || idRol === null ? null : idRol
}

const cargarVistaPrevia = async () => {
  cargandoPreview.value = true
  try {
    const params = {}
    if (filtros.value.idSla) params.idSla = filtros.value.idSla
    if (filtros.value.idRol) params.idRol = filtros.value.idRol

    // console.log('📋 Cargando preview con params:', params)

    const { data } = await api.get('/api/email/preview-destinatarios', { params })

    // console.log('📦 Respuesta preview-destinatarios:', data)

    // Mapear destinatarios - verificar estructura
    const destinatarios = data.destinatarios || data.data || data || []

    usuariosPreview.value = destinatarios.map((usuario, index) => ({
      id: index + 1,
      nombre: usuario.nombre || usuario.nombreCompleto || 'Sin Nombre',
      iniciales: (usuario.nombre || usuario.nombreCompleto || 'NA')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
      rol: usuario.rol || usuario.nombreRol || 'Sin Rol',
      sla: usuario.sla || usuario.tipoSla || 'N/A',
      email: usuario.email || usuario.correo || '',
    }))

    // console.log(`✅ ${usuariosPreview.value.length} destinatarios en preview`)
  } catch (error) {
    // console.error('❌ Error en vista previa:', error)
    // console.error('❌ Response:', error.response?.data)
    usuariosPreview.value = []
    $q.notify({
      type: 'warning',
      message: 'Error al cargar destinatarios',
      position: 'top-right',
    })
  } finally {
    cargandoPreview.value = false
  }
}

// Watch para recargar preview cuando cambien filtros
watch(
  filtros,
  () => {
    cargarVistaPrevia()
  },
  { deep: true },
)

// Eliminar usuario de la vista local
const eliminarUsuario = (id) => {
  usuariosPreview.value = usuariosPreview.value.filter((u) => u.id !== id)
}

// --- UTILIDADES ---
const convertirTextoAHtml = (texto) => {
  if (!texto) return ''
  let html = texto.replace(/\n/g, '<br>')
  html = html.replace(/^[-•*]\s+(.+)$/gm, '<li>$1</li>')
  if (html.includes('<li>')) {
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  }
  return `<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">${html}</div>`
}

// --- 3. ENVÍO DE CORREOS ---
const enviarPrueba = (comunicado) => {
  $q.dialog({
    title: 'Enviar correo de prueba',
    message: 'Ingresa el correo electrónico donde deseas recibir la prueba:',
    prompt: {
      model: authStore.userEmail || '',
      type: 'email',
      isValid: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7',
    },
    ok: {
      label: 'Enviar',
      color: 'primary',
    },
    persistent: true,
  }).onOk(async (emailPrueba) => {
    const loading = $q.loading.show({
      message: 'Enviando correo de prueba...',
    })

    try {
      const payload = {
        asunto: comunicado.asunto,
        mensajeHtml: convertirTextoAHtml(comunicado.cuerpo),
        idSla: filtros.value.idSla,
        idRol: filtros.value.idRol,
        esPrueba: true,
        emailPrueba: emailPrueba,
      }

      // console.log('📤 Enviando prueba:', payload)

      const { data } = await api.post('/api/email/broadcast', payload)

      $q.notify({
        type: 'positive',
        message: data.mensaje || `Correo de prueba enviado a ${emailPrueba}`,
        icon: 'check_circle',
        position: 'top-right',
      })
    } catch (error) {
      // console.error('❌ Error al enviar prueba:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al enviar prueba',
        position: 'top-right',
      })
    } finally {
      loading()
    }
  })
}

const enviarComunicado = (comunicado) => {
  if (usuariosPreview.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay destinatarios seleccionados.',
      position: 'top-right',
    })
    return
  }

  $q.dialog({
    title: 'Confirmar envío masivo',
    message: `¿Estás seguro de enviar este comunicado a ${usuariosPreview.value.length} destinatario(s)?`,
    html: true,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7',
    },
    ok: {
      label: 'Enviar',
      color: 'primary',
    },
    persistent: true,
  }).onOk(async () => {
    const loading = $q.loading.show({
      message: 'Enviando comunicado masivo...',
    })

    try {
      const payload = {
        asunto: comunicado.asunto,
        mensajeHtml: convertirTextoAHtml(comunicado.cuerpo),
        idSla: filtros.value.idSla,
        idRol: filtros.value.idRol,
        esPrueba: false,
        emailPrueba: null,
      }

      // console.log('📤 Enviando comunicado masivo:', payload)

      const { data } = await api.post('/api/email/broadcast', payload)

      $q.notify({
        type: 'positive',
        message:
          data.mensaje ||
          `Comunicado enviado exitosamente a ${usuariosPreview.value.length} destinatario(s)`,
        icon: 'check_circle',
        position: 'top-right',
        timeout: 3000,
      })
    } catch (error) {
      // console.error('❌ Error al enviar comunicado:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al enviar comunicado',
        position: 'top-right',
      })
    } finally {
      loading()
    }
  })
}

onMounted(async () => {
  await cargarSelectores()
  await cargarVistaPrevia()
})
</script>
<style scoped>
.sala-comunicaciones {
  width: 100%;
}

.comunicaciones-layout {
  display: grid;
  grid-template-columns: 35% 65%;
  gap: 24px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .comunicaciones-layout {
    grid-template-columns: 1fr;
  }
}
</style>
