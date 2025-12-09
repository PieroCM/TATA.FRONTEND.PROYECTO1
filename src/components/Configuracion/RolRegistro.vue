<template>
  <div class="rol-registro-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <q-btn
        unelevated
        class="btn-nuevo"
        label="Nuevo Rol de Registro"
        icon="add"
        @click="openCreateModal"
      />
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <q-spinner-dots color="primary" size="48px" />
      <p class="loading-text">Cargando roles de registro...</p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="!loading && filteredRoles.length === 0 && !searchQuery" class="empty-state">
      <q-icon name="badge" size="64px" color="grey-4" />
      <p class="empty-title">No hay roles de registro</p>
      <p class="empty-subtitle">Comienza creando tu primer rol de registro</p>
    </div>

    <!-- Sin resultados de búsqueda -->
    <div v-else-if="!loading && filteredRoles.length === 0 && searchQuery" class="empty-state">
      <q-icon name="search_off" size="64px" color="grey-4" />
      <p class="empty-title">No se encontraron resultados</p>
      <p class="empty-subtitle">Intenta con otros términos de búsqueda</p>
    </div>

    <!-- Tabla de roles de registro -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-nombre">Nombre Rol</th>
            <th class="th-bloque">Bloque Tech</th>
            <th class="th-descripcion">Descripción</th>
            <th class="th-estado">Estado</th>
            <th class="th-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rol in filteredRoles" :key="rol.idRolRegistro" class="table-row">
            <td class="td-nombre">{{ rol.nombreRol }}</td>
            <td class="td-bloque">
              <span 
                class="badge-bloque" 
                :class="getBloqueBadgeClass(rol.bloqueTech)"
              >
                {{ rol.bloqueTech }}
              </span>
            </td>
            <td class="td-descripcion">{{ rol.descripcion || '—' }}</td>
            <td class="td-estado">
              <span class="badge" :class="rol.esActivo ? 'badge-activo' : 'badge-inactivo'">
                {{ rol.esActivo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="td-acciones">
              <div class="actions-group">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  class="action-btn edit-btn"
                  @click="openEditModal(rol)"
                >
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                    Editar
                  </q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  class="action-btn delete-btn"
                  @click="confirmDelete(rol)"
                >
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
                    Eliminar
                  </q-tooltip>
                </q-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Editar/Crear -->
    <ModalEditarRolRegistro
      v-model="showEditModal"
      :rol="selectedRol"
      :is-create="isCreateMode"
      @save="handleSave"
      @close="closeEditModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import ModalEditarRolRegistro from './ModalEditarRolRegistro.vue'

const $q = useQuasar()

// Props
const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
})

// Estado
const roles = ref([])
const loading = ref(false)
const showEditModal = ref(false)
const selectedRol = ref(null)
const isCreateMode = ref(false)

// Computed
const filteredRoles = computed(() => {
  if (!props.searchQuery) return roles.value

  const query = props.searchQuery.toLowerCase().trim()
  return roles.value.filter(rol => {
    return (
      rol.nombreRol?.toLowerCase().includes(query) ||
      rol.bloqueTech?.toLowerCase().includes(query) ||
      rol.descripcion?.toLowerCase().includes(query)
    )
  })
})

// Methods
const getBloqueBadgeClass = (bloque) => {
  const bloqueMap = {
    'Infrastructure': 'badge-infrastructure',
    'Development': 'badge-development',
    'Security': 'badge-security',
    'Data': 'badge-data',
    'Support': 'badge-support'
  }
  return bloqueMap[bloque] || 'badge-default'
}

const fetchRoles = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/api/RolRegistro', {
      params: { soloActivos: true }
    })
    roles.value = data
  } catch (error) {
    console.error('Error al cargar roles:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los roles de registro',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isCreateMode.value = true
  selectedRol.value = null
  showEditModal.value = true
}

const openEditModal = (rol) => {
  isCreateMode.value = false
  selectedRol.value = { ...rol }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  setTimeout(() => {
    selectedRol.value = null
    isCreateMode.value = false
  }, 300)
}

const handleSave = async (data) => {
  try {
    if (isCreateMode.value) {
      await api.post('/api/RolRegistro', data)
      $q.notify({
        type: 'positive',
        message: 'Rol de registro creado exitosamente',
        position: 'top-right',
        timeout: 2500
      })
    } else {
      await api.put(`/api/RolRegistro/${data.idRolRegistro}`, data)
      $q.notify({
        type: 'positive',
        message: 'Rol de registro actualizado exitosamente',
        position: 'top-right',
        timeout: 2500
      })
    }
    await fetchRoles()
    closeEditModal()
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al guardar el rol de registro',
      position: 'top-right',
      timeout: 3000
    })
  }
}

const confirmDelete = (rol) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro que deseas eliminar el rol "${rol.nombreRol}"? Esta acción no se puede deshacer.`,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7'
    },
    ok: {
      label: 'Eliminar',
      unelevated: true,
      color: 'negative'
    },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/api/RolRegistro/${rol.idRolRegistro}`)
      $q.notify({
        type: 'positive',
        message: 'Rol de registro eliminado exitosamente',
        position: 'top-right',
        timeout: 2500
      })
      await fetchRoles()
    } catch (error) {
      console.error('Error al eliminar:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al eliminar el rol de registro',
        position: 'top-right',
        timeout: 3000
      })
    }
  })
}

// Lifecycle
onMounted(() => {
  fetchRoles()
})
</script>

<style scoped lang="scss">
.rol-registro-container {
  padding: 24px 32px;
  background: #FFFFFF;
}

/* ========== TOOLBAR ========== */
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.btn-nuevo {
  height: 44px;
  padding: 0 24px;
  background: #2563EB;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  text-transform: none;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #1E40AF;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  :deep(.q-icon) {
    font-size: 20px;
    margin-right: 6px;
  }
}

/* ========== ESTADOS ========== */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #6B7280;
}

.empty-title {
  margin: 16px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.empty-subtitle {
  margin: 8px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #9CA3AF;
}

/* ========== TABLA ========== */
.table-container {
  overflow-x: auto;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #FFFFFF;

  thead tr {
    background: #F9FAFB;
    border-bottom: 1px solid #E5E7EB;
  }

  th {
    padding: 14px 16px;
    text-align: left;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .th-nombre { width: 22%; }
  .th-bloque { width: 18%; }
  .th-descripcion { width: 35%; }
  .th-estado { width: 12%; }
  .th-acciones { width: 13%; text-align: center; }

  tbody tr {
    border-bottom: 1px solid #F3F4F6;
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #F9FAFB;
    }
  }

  td {
    padding: 16px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #111827;
    vertical-align: middle;
  }

  .td-nombre {
    font-weight: 600;
    color: #111827;
  }

  .td-descripcion {
    color: #6B7280;
    line-height: 1.5;
  }

  .td-acciones {
    text-align: center;
  }
}

/* ========== BADGES ========== */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.badge-activo {
  background-color: #D1FAE5;
  color: #065F46;
}

.badge-inactivo {
  background-color: #FEE2E2;
  color: #991B1B;
}

/* Badges de Bloque Tech con gradientes */
.badge-bloque {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  border: 1px solid transparent;
}

.badge-infrastructure {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  color: #1E40AF;
  border-color: #BFDBFE;
}

.badge-development {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  color: #15803D;
  border-color: #BBF7D0;
}

.badge-security {
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  color: #991B1B;
  border-color: #FECACA;
}

.badge-data {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  border-color: #FCD34D;
}

.badge-support {
  background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
  color: #5B21B6;
  border-color: #DDD6FE;
}

.badge-default {
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  color: #374151;
  border-color: #E5E7EB;
}

/* ========== ACCIONES ========== */
.actions-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn {
  width: 36px;
  height: 36px;
  transition: all 0.2s ease;

  :deep(.q-icon) {
    font-size: 18px;
  }
}

.edit-btn {
  color: #6B7280;

  &:hover {
    background-color: #EFF6FF;
    color: #2563EB;
  }
}

.delete-btn {
  color: #6B7280;

  &:hover {
    background-color: #FEF2F2;
    color: #DC2626;
  }
}

/* ========== RESPONSIVE ========== */
@media (max-width: 767px) {
  .rol-registro-container {
    padding: 16px;
  }

  .toolbar {
    margin-bottom: 16px;
  }

  .btn-nuevo {
    height: 40px;
    padding: 0 16px;
    font-size: 13px;

    :deep(.q-icon) {
      font-size: 18px;
    }
  }

  .table-container {
    border-radius: 12px;
  }

  .data-table {
    th {
      padding: 12px;
      font-size: 12px;
    }

    td {
      padding: 12px;
      font-size: 13px;
    }

    .th-descripcion,
    .td-descripcion {
      display: none;
    }
  }

  .action-btn {
    width: 32px;
    height: 32px;

    :deep(.q-icon) {
      font-size: 16px;
    }
  }
}
</style>
