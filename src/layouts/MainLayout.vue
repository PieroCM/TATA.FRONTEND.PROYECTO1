<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <div class="row items-center q-gutter-sm">
            <q-icon name="apps" size="md" />
            <span class="text-weight-medium">SLA Manager</span>
          </div>
        </q-toolbar-title>

        <q-space />

        <!-- Buscador -->
        <q-input
          dense
          standout
          v-model="searchText"
          placeholder="Buscar..."
          class="search-input"
          style="width: 300px;"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-space />

        <!-- Selector de fecha -->
        <q-btn flat dense icon="event" label="Nov 2025" />

        <!-- Notificaciones -->
        <q-btn flat round dense icon="notifications">
          <q-badge color="red" floating>3</q-badge>
          <q-menu>
            <q-list style="min-width: 300px">
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-avatar color="positive" text-color="white" icon="check_circle" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Nuevo producto aprobado</q-item-label>
                  <q-item-label caption>Hace 2 horas</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-avatar color="warning" text-color="white" icon="warning" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Stock bajo en inventario</q-item-label>
                  <q-item-label caption>Hace 4 horas</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-avatar color="info" text-color="white" icon="info" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Nuevo usuario registrado</q-item-label>
                  <q-item-label caption>Ayer</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- Usuario -->
        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item>
                <q-item-section>
                  <q-item-label>Admin User</q-item-label>
                  <q-item-label caption>admin@ejemplo.com</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>Perfil</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Configuración</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Cerrar Sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="260"
      class="sidebar-drawer"
    >
      <q-scroll-area class="fit">
        <sidebar-menu />
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import SidebarMenu from 'components/SidebarMenu.vue'

const leftDrawerOpen = ref(false)
const searchText = ref('')

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.search-input {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.search-input :deep(.q-field__control) {
  color: white;
}

.search-input :deep(.q-field__native) {
  color: white;
}

.search-input :deep(.q-icon) {
  color: white;
}

.sidebar-drawer {
  background: #ffffff;
}
</style>
