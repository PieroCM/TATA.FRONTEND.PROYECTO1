<template>
  <div class="roles-sistema-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <q-btn
        unelevated
        class="btn-nuevo"
        label="Nuevo Rol"
        icon="add"
        @click="openCreateModal"
      />
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <q-spinner-dots color="primary" size="48px" />
      <p class="loading-text">Cargando roles...</p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="!loading && filteredRoles.length === 0 && !searchQuery" class="empty-state">
      <q-icon name="folder_off" size="64px" color="grey-4" />
      <p class="empty-title">No hay roles de sistema</p>
      <p class="empty-subtitle">Comienza creando tu primer rol de sistema</p>
    </div>

    <!-- Sin resultados de búsqueda -->
    <div v-else-if="!loading && filteredRoles.length === 0 && searchQuery" class="empty-state">
      <q-icon name="search_off" size="64px" color="grey-4" />
      <p class="empty-title">No se encontraron resultados</p>
      <p class="empty-subtitle">Intenta con otros términos de búsqueda</p>
    </div>

    <!-- Tabla de roles -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-codigo">Código</th>
            <th class="th-nombre">Nombre</th>
            <th class="th-descripcion">Descripción</th>
            <th class="th-estado">Estado</th>
            <th class="th-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rol in filteredRoles" :key="rol.idRolSistema" class="table-row">
            <td class="td-codigo">{{ rol.codigo }}</td>
            <td class="td-nombre">{{ rol.nombre }}</td>
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
    <ModalEditarRolesSistema
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
import ModalEditarRolesSistema from './ModalEditarRolesSistema.vue'

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
      rol.codigo?.toLowerCase().includes(query) ||
      rol.nombre?.toLowerCase().includes(query) ||
      rol.descripcion?.toLowerCase().includes(query)
    )
  })
})

// Methods
const fetchRoles = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/api/RolesSistema')
    roles.value = data
  } catch (error) {
    console.error('Error al cargar roles:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los roles de sistema',
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
      await api.post('/api/RolesSistema', data)
      $q.notify({
        type: 'positive',
        message: 'Rol creado exitosamente',
        position: 'top-right',
        timeout: 2500
      })
    } else {
      await api.put(`/api/RolesSistema/${data.idRolSistema}`, data)
      $q.notify({
        type: 'positive',
        message: 'Rol actualizado exitosamente',
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
      message: error.response?.data?.mensaje || 'Error al guardar el rol',
      position: 'top-right',
      timeout: 3000
    })
  }
}

const confirmDelete = (rol) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro que deseas eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`,
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
      await api.delete(`/api/RolesSistema/${rol.idRolSistema}`)
      $q.notify({
        type: 'positive',
        message: 'Rol eliminado exitosamente',
        position: 'top-right',
        timeout: 2500
      })
      await fetchRoles()
    } catch (error) {
      console.error('Error al eliminar:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al eliminar el rol',
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
.roles-sistema-container {
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

  .th-codigo { width: 15%; }
  .th-nombre { width: 25%; }
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

  .td-codigo {
    font-weight: 600;
    color: #2563EB;
  }

  .td-nombre {
    font-weight: 500;
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
  .roles-sistema-container {
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
