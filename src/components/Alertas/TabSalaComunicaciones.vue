<template>
  <div class="sala-comunicaciones">
    <div class="comunicaciones-layout">
      <!-- COLUMNA IZQUIERDA: Destinatarios -->
      <ListaDestinatarios
        :usuarios="usuariosSeleccionados"
        @eliminar-usuario="eliminarUsuario"
        @filtrar="aplicarFiltros"
      />

      <!-- COLUMNA DERECHA: Redactar Comunicado -->
      <FormularioComunicado
        :cantidad-usuarios="usuariosSeleccionados.length"
        @enviar-prueba="enviarPrueba"
        @enviar-comunicado="enviarComunicado"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import ListaDestinatarios from './ListaDestinatarios.vue'
import FormularioComunicado from './FormularioComunicado.vue'

const $q = useQuasar()

// Estado de carga
const cargando = ref(false)

// Filtros seleccionados (IDs del backend)
const filtrosActuales = ref({
  idSlaFilter: null,
  idRolFilter: null,
})

// Usuarios disponibles desde el backend
const usuariosTodos = ref([
  // Temporal - se carga desde backend
  {
    id: 1,
    nombre: 'Carlos Méndez',
    iniciales: 'CM',
    rol: 'Desarrollador .NET',
    sla: 'SLA1',
    email: 'carlos.mendez@empresa.com',
  },
  {
    id: 2,
    nombre: 'Ana Rodríguez',
    iniciales: 'AR',
    rol: 'Analista',
    sla: 'SLA2',
    email: 'ana.rodriguez@empresa.com',
  },
  {
    id: 3,
    nombre: 'Luis Fernández',
    iniciales: 'LF',
    rol: 'Project Manager',
    sla: 'SLA1',
    email: 'luis.fernandez@empresa.com',
  },
  {
    id: 4,
    nombre: 'María García',
    iniciales: 'MG',
    rol: 'QA Tester',
    sla: 'SLA3',
    email: 'maria.garcia@empresa.com',
  },
  {
    id: 5,
    nombre: 'Pedro Sánchez',
    iniciales: 'PS',
    rol: 'Desarrollador .NET',
    sla: 'SLA2',
    email: 'pedro.sanchez@empresa.com',
  },
  {
    id: 6,
    nombre: 'Laura Torres',
    iniciales: 'LT',
    rol: 'Analista',
    sla: 'SLA1',
    email: 'laura.torres@empresa.com',
  },
  {
    id: 7,
    nombre: 'Jorge Martínez',
    iniciales: 'JM',
    rol: 'Desarrollador .NET',
    sla: 'SLA3',
    email: 'jorge.martinez@empresa.com',
  },
  {
    id: 8,
    nombre: 'Sofía López',
    iniciales: 'SL',
    rol: 'QA Tester',
    sla: 'SLA2',
    email: 'sofia.lopez@empresa.com',
  },
])

// Usuarios seleccionados (filtrados)
const usuariosSeleccionados = ref([...usuariosTodos.value])

/**
 * Aplica filtros a la lista de usuarios
 */
const aplicarFiltros = ({ idSla, nombreSla, idRol, nombreRol }) => {
  let resultado = [...usuariosTodos.value]

  // Guardar IDs de filtros para el envío masivo
  filtrosActuales.value = {
    idSlaFilter: idSla !== 'Todos' ? idSla : null,
    idRolFilter: idRol !== 'Todos' ? idRol : null,
  }

  console.log('🔍 Filtros aplicados:', filtrosActuales.value)

  // Filtro por SLA (vista)
  if (nombreSla && nombreSla !== 'Todos') {
    resultado = resultado.filter((u) => u.sla === nombreSla)
  }

  // Filtro por Rol (vista)
  if (nombreRol && nombreRol !== 'Todos') {
    resultado = resultado.filter((u) => u.rol === nombreRol)
  }

  usuariosSeleccionados.value = resultado
}

/**
 * Elimina un usuario de la lista
 */
const eliminarUsuario = (id) => {
  usuariosSeleccionados.value = usuariosSeleccionados.value.filter((u) => u.id !== id)
}

/**
 * Convierte texto plano a HTML básico
 */
const convertirTextoAHtml = (texto) => {
  if (!texto) return ''

  // Convertir saltos de línea a <br>
  let html = texto.replace(/\n/g, '<br>')

  // Detectar y convertir listas
  html = html.replace(/^[-•*]\s+(.+)$/gm, '<li>$1</li>')

  // Envolver listas en <ul>
  if (html.includes('<li>')) {
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  }

  // Envolver en div con estilos
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
      ${html}
    </div>
  `
}

/**
 * Envía prueba al usuario actual
 */
const enviarPrueba = async (comunicado) => {
  try {
    console.log('📧 Enviando prueba con filtros:', filtrosActuales.value)

    // Convertir cuerpo a HTML
    const mensajeHtml = convertirTextoAHtml(comunicado.cuerpo)

    // Payload para el backend
    const payload = {
      idSlaFilter: filtrosActuales.value.idSlaFilter,
      idRolFilter: filtrosActuales.value.idRolFilter,
      asunto: comunicado.asunto,
      mensajeHtml: mensajeHtml,
    }

    console.log('📤 Payload de prueba:', payload)

    // NOTA: El backend no tiene endpoint específico para prueba
    // Por ahora solo mostramos notificación
    $q.notify({
      type: 'info',
      message: 'Función de prueba no disponible. Use "Enviar a Destinatarios" para envío real.',
      position: 'top-right',
      icon: 'info',
      timeout: 3000,
    })
  } catch (error) {
    console.error('❌ Error al enviar prueba:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar prueba',
      position: 'top-right',
    })
  }
}

/**
 * Envía comunicado a todos los destinatarios
 */
const enviarComunicado = async (comunicado) => {
  // Mostrar loading
  const loading = $q.loading.show({
    message: 'Enviando comunicado en masa...',
  })

  try {
    console.log('📧 Enviando comunicado a destinatarios filtrados')
    console.log('🔍 Filtros actuales:', filtrosActuales.value)
    console.log('👥 Usuarios seleccionados:', usuariosSeleccionados.value.length)

    // Convertir cuerpo a HTML
    const mensajeHtml = convertirTextoAHtml(comunicado.cuerpo)

    // Payload para el backend
    const payload = {
      idSlaFilter: filtrosActuales.value.idSlaFilter,
      idRolFilter: filtrosActuales.value.idRolFilter,
      asunto: comunicado.asunto,
      mensajeHtml: mensajeHtml,
    }

    console.log('📤 Payload de envío masivo:', payload)

    // Llamar al endpoint de broadcast
    const response = await api.post('/api/email/broadcast', payload)

    console.log('✅ Respuesta del backend:', response.data)

    $q.notify({
      type: 'positive',
      message: `Comunicado enviado exitosamente a los destinatarios filtrados`,
      position: 'top-right',
      icon: 'check_circle',
      timeout: 3000,
    })
  } catch (error) {
    console.error('❌ Error al enviar comunicado:', error)

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al enviar comunicado masivo',
      position: 'top-right',
      timeout: 3000,
    })
  } finally {
    loading()
  }
}

/**
 * Carga usuarios desde alertas del backend
 */
const cargarUsuarios = async () => {
  cargando.value = true

  try {
    console.log('📋 Cargando usuarios desde alertas...')

    // Cargar alertas del dashboard
    const response = await api.get('/api/alertas/dashboard')

    if (response.data && Array.isArray(response.data)) {
      // Mapear alertas a usuarios únicos
      const usuariosMap = new Map()

      response.data.forEach((alerta) => {
        const key = alerta.emailResponsable
        if (key && !usuariosMap.has(key)) {
          // Generar iniciales
          const iniciales =
            alerta.nombreResponsable
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2) || 'NA'

          usuariosMap.set(key, {
            id: usuariosMap.size + 1,
            nombre: alerta.nombreResponsable || 'Sin Nombre',
            iniciales: iniciales,
            rol: alerta.nombreRol || 'Sin Rol',
            sla: alerta.tipoSla || 'N/A',
            email: alerta.emailResponsable,
            idSla: alerta.idSla,
            idRol: alerta.idRol,
          })
        }
      })

      usuariosTodos.value = Array.from(usuariosMap.values())
      usuariosSeleccionados.value = [...usuariosTodos.value]

      console.log(`✅ ${usuariosTodos.value.length} usuarios únicos cargados`)
    }
  } catch (error) {
    console.error('❌ Error al cargar usuarios:', error)

    $q.notify({
      type: 'warning',
      message: 'Error al cargar usuarios. Usando datos por defecto.',
      position: 'top-right',
    })
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarUsuarios()
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
