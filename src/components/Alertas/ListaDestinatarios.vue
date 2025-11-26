<template>
  <q-card flat bordered class="destinatarios-card">
    <q-card-section>
      <!-- Título -->
      <div class="card-header q-mb-md">
        <q-icon name="people_outline" color="primary" size="24px" class="q-mr-sm" />
        <h2 class="text-h6 text-weight-semibold q-ma-none">Destinatarios</h2>
      </div>

      <!-- Filtros -->
      <div class="filtros-destinatarios q-mb-md">
        <div class="q-mb-sm">
          <label class="text-caption text-weight-medium text-grey-8 q-mb-xs block">
            Tipo SLA
          </label>
          <q-select
            outlined
            v-model="filtros.tipoSla"
            :options="opcionesTipoSla"
            dense
            @update:model-value="emitirFiltros"
          />
        </div>
        <div>
          <label class="text-caption text-weight-medium text-grey-8 q-mb-xs block"> Rol </label>
          <q-select
            outlined
            v-model="filtros.rol"
            :options="opcionesRol"
            dense
            @update:model-value="emitirFiltros"
          />
        </div>
      </div>

      <!-- Barra de Resumen -->
      <div class="resumen-usuarios q-mb-md">
        <div class="text-primary text-weight-bold text-center">
          {{ usuarios.length }} usuarios encontrados
        </div>
      </div>

      <!-- Lista de Vista Previa -->
      <div class="q-mb-sm">
        <label class="text-caption text-weight-medium text-grey-8">Vista Previa</label>
      </div>
      <div class="lista-usuarios">
        <div v-for="usuario in usuarios" :key="usuario.id" class="usuario-item">
          <q-avatar size="40px" color="primary" text-color="white" class="q-mr-sm">
            {{ usuario.iniciales }}
          </q-avatar>
          <div class="usuario-info">
            <div class="text-weight-bold text-body2">{{ usuario.nombre }}</div>
            <div class="text-caption text-grey-7">{{ usuario.rol }} • {{ usuario.sla }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            size="sm"
            color="grey-6"
            @click="$emit('eliminar-usuario', usuario.id)"
            class="btn-eliminar"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </div>

        <!-- Estado vacío -->
        <div v-if="usuarios.length === 0" class="empty-usuarios">
          <q-icon name="person_off" size="48px" color="grey-4" />
          <p class="text-caption text-grey-6 q-mt-sm">No hay usuarios seleccionados</p>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

// Props
defineProps({
  usuarios: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits(['eliminar-usuario', 'filtrar'])

// Filtros
const filtros = ref({
  tipoSla: 'Todos',
  rol: 'Todos',
})

// Opciones de filtros
const opcionesTipoSla = ['Todos', 'SLA1', 'SLA2', 'SLA3']
const opcionesRol = ['Todos', 'Desarrollador .NET', 'Analista', 'Project Manager', 'QA Tester']

/**
 * Emite evento de filtrado
 */
const emitirFiltros = () => {
  emit('filtrar', {
    tipoSla: filtros.value.tipoSla,
    rol: filtros.value.rol,
  })
}
</script>

<style scoped>
.destinatarios-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.card-header {
  display: flex;
  align-items: center;
}

label.block {
  display: block;
}

.filtros-destinatarios {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resumen-usuarios {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 12px;
}

.lista-usuarios {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
}

/* Scrollbar personalizado */
.lista-usuarios::-webkit-scrollbar {
  width: 6px;
}

.lista-usuarios::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.lista-usuarios::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.lista-usuarios::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.usuario-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.usuario-item:last-child {
  border-bottom: none;
}

.usuario-item:hover {
  background: #f8fafc;
}

.usuario-info {
  flex: 1;
}

.btn-eliminar {
  opacity: 0;
  transition: opacity 0.2s;
}

.usuario-item:hover .btn-eliminar {
  opacity: 1;
}

.empty-usuarios {
  text-align: center;
  padding: 40px 20px;
}
</style>
