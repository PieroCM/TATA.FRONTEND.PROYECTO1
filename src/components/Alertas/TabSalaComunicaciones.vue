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
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import ListaDestinatarios from './ListaDestinatarios.vue'
import FormularioComunicado from './FormularioComunicado.vue'

const $q = useQuasar()

// Usuarios disponibles (simulado - traer del backend)
const usuariosTodos = ref([
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
const aplicarFiltros = ({ tipoSla, rol }) => {
  let resultado = [...usuariosTodos.value]

  // Filtro por SLA
  if (tipoSla !== 'Todos') {
    resultado = resultado.filter((u) => u.sla === tipoSla)
  }

  // Filtro por Rol
  if (rol !== 'Todos') {
    resultado = resultado.filter((u) => u.rol === rol)
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
 * Envía prueba al usuario actual
 */
const enviarPrueba = async (comunicado) => {
  try {
    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log('Enviando prueba:', comunicado)

    $q.notify({
      type: 'positive',
      message: 'Email de prueba enviado a su correo',
      position: 'top-right',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Error al enviar prueba:', error)
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
  try {
    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log('Enviando comunicado a:', usuariosSeleccionados.value)
    console.log('Contenido:', comunicado)

    $q.notify({
      type: 'positive',
      message: `Comunicado enviado a ${usuariosSeleccionados.value.length} destinatarios`,
      position: 'top-right',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Error al enviar comunicado:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar comunicado',
      position: 'top-right',
    })
  }
}
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
