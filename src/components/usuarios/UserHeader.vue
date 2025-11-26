<template>
  <div class="user-header">
    <!-- Banner superior -->
    <div class="banner-container">
      <div class="banner-image"></div>
    </div>

    <!-- Avatar y contenido principal -->
    <div class="header-content">
      <!-- Avatar circular grande -->
      <div class="avatar-section">
        <div class="avatar-circle">
          <q-icon name="person" size="64px" color="white" />
        </div>
      </div>

      <!-- Información del usuario -->
      <div class="user-info-section">
        <div class="user-details">
          <h2 class="user-name">{{ nombreCompleto }}</h2>
          <p class="user-department">{{ departamento }}</p>

          <div class="user-meta">
            <q-badge class="role-badge" color="primary">
              <q-icon name="admin_panel_settings" size="16px" class="badge-icon" />
              {{ rolNombre }}
            </q-badge>

            <div class="email-info">
              <q-icon name="email" size="18px" color="grey-6" />
              <span class="email-text">{{ correo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón editar perfil -->
      <div class="actions-section">
        <q-btn-dropdown
          flat
          no-caps
          class="edit-btn"
          dropdown-icon="expand_more"
          label="Editar Perfil"
        >
          <q-icon name="edit" size="18px" class="edit-icon" />

          <q-list class="edit-menu">
            <q-item clickable v-ripple @click="$emit('update-email')" v-close-popup>
              <q-item-section avatar>
                <q-icon name="alternate_email" color="primary" />
              </q-item-section>
              <q-item-section>Actualizar correo</q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="$emit('update-password')" v-close-popup>
              <q-item-section avatar>
                <q-icon name="lock" color="primary" />
              </q-item-section>
              <q-item-section>Actualizar contraseña</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  usuario: {
    type: Object,
    required: true,
  },
})

defineEmits(['update-email', 'update-password'])

const nombreCompleto = computed(() => {
  if (props.usuario.personal) {
    return `${props.usuario.personal.nombres} ${props.usuario.personal.apellidos}`
  }
  return props.usuario.username || ''
})

const departamento = computed(() => {
  return props.usuario.rol?.nombre || ''
})

const rolNombre = computed(() => {
  return props.usuario.rol?.nombre || ''
})

const correo = computed(() => {
  return props.usuario.personal?.correo_corporativo || props.usuario.correo || ''
})
</script>

<style scoped>
.user-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 24px;
}

.banner-container {
  height: 140px;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.banner-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 90, 120, 0.7) 0%, rgba(45, 127, 165, 0.7) 100%);
}

.header-content {
  position: relative;
  padding: 0 32px 24px 32px;
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.avatar-section {
  margin-top: -50px;
  flex-shrink: 0;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #486aae;
  border: 5px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-info-section {
  flex: 1;
  padding-top: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.user-department {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 8px;
}

.role-badge {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.badge-icon {
  margin-right: 2px;
}

.email-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.email-text {
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}

.actions-section {
  padding-top: 12px;
  flex-shrink: 0;
}

.edit-btn {
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.edit-icon {
  margin-right: 6px;
}

.edit-menu {
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 220px;
}

.edit-menu .q-item {
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 4px;
  transition: all 0.15s ease;
}

.edit-menu .q-item:hover {
  background: #f3f4f6;
}

.edit-menu .q-item:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 20px 20px 20px;
  }

  .user-info-section {
    padding-top: 0;
  }

  .user-details {
    align-items: center;
  }

  .user-meta {
    flex-direction: column;
    gap: 12px;
  }

  .actions-section {
    padding-top: 0;
  }
}
</style>
