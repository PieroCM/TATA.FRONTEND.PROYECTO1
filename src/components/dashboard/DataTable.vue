<template>
  <q-card class="q-mt-md">
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pa-none">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :filter="filter"
        :loading="loading"
        flat
        :pagination="initialPagination"
      >
        <template v-slot:top-right>
          <q-input
            v-model="filter"
            outlined
            dense
            debounce="300"
            placeholder="Buscar..."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :color="getEstadoColor(props.value)"
              :label="props.value"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="visibility"
              @click="$emit('ver', props.row)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="positive"
              icon="edit"
              @click="$emit('editar', props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="$emit('eliminar', props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    default: 'Datos'
  },
  rows: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['ver', 'editar', 'eliminar'])

const filter = ref('')

const initialPagination = {
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10
}

const getEstadoColor = (estado) => {
  const estados = {
    'Activo': 'positive',
    'Inactivo': 'negative',
    'Pendiente': 'warning',
    'En Revisión': 'warning',
    'Aprobado': 'positive',
    'Rechazado': 'negative'
  }
  return estados[estado] || 'grey'
}
</script>

<style scoped>
.q-table {
  background: transparent;
}
</style>
