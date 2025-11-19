<template>
  <q-layout view="hHh lpR fFf">
    <!-- ========== SIDEBAR ========== -->
    <q-drawer
      v-model="drawerOpen"
      :mini="drawerMini"
      show-if-above
      :width="250"
      bordered
      class="sidebar"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- Ítems simples -->

          <!-- GRUPO: Dashboard -->
          <SidebarGroup
            icon="dashboard"
            label="Dashboard"
            :mini="drawerMini"
            :childrenRoutes="['/dashboard-ejecutivo', '/analisis interactivo']"
          >
            <SidebarItemChild
              label="Dashboard ejecutivo"
              icon="bar_chart"
              to="/dashboard-ejecutivo"
            />
            <SidebarItemChild
              label="Análisis interactivo"
              icon="show_chart"
              to="/analisis interactivo"
            />
          </SidebarGroup>
          <!-- GRUPO: Datos SLA -->
          <SidebarGroup
            icon="storage"
            label="Datos solicitud"
            :mini="drawerMini"
            :childrenRoutes="['/cargar-datos', '/crud']"
          >
            <SidebarItemChild label="Cargar Datos" icon="upload" to="/cargar-datos" />
            <SidebarItemChild label="Gestión de solicitud" icon="edit" to="/crud" />
          </SidebarGroup>

          <!-- GRUPO: Reportes -->
          <SidebarGroup
            icon="description"
            label="Reportes"
            :mini="drawerMini"
            :childrenRoutes="['/reportes-sla', '/programar-envio']"
          >
            <SidebarItemChild label="Reporte de cumplimiento" icon="bar_chart" to="/reportes-sla" />
            <SidebarItemChild
              label="Programar envío automático"
              icon="schedule"
              to="/programar-envio"
            />
          </SidebarGroup>

          <!-- GRUPO: Alertas SLA -->
          <SidebarGroup
            icon="warning_amber"
            label="Alertas SLA"
            :mini="drawerMini"
            :childrenRoutes="['/alertas', '/alertas/email']"
          >
            <SidebarItemChild icon="warning_amber" label="Gestión de alertas" to="/alertas" />
            <SidebarItemChild icon="mail_outline" label="Configuración Email" to="/alertas/email" />
          </SidebarGroup>

          <!-- GRUPO: Configuración -->

          <!-- GRUPO: Sistema -->
          <SidebarGroup
            icon="memory"
            label="Sistema"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/logs']"
          >
            <SidebarItemChild icon="monitor_heart" label="Logs" to="/sistema/logs" />
          </SidebarGroup>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- ========== HEADER ========== -->
    <q-header elevated class="bg-white text-dark topbar">
      <q-toolbar class="header-bar">
        <!-- IZQUIERDA -->
        <div class="row items-center">
          <!-- Logo (siempre visible en modo expandido, oculto en mini) -->
          <template v-if="!drawerMini">
            <q-avatar rounded size="32px" class="bg-primary text-white flex flex-center q-mr-sm">
              <q-icon name="grid_view" size="20px" />
            </q-avatar>
            <span class="text-weight-medium text-body1 q-mr-lg">SLA Manager</span>
          </template>

          <!-- Botón hamburguesa -->
          <q-btn flat dense round icon="menu" class="hamburger" @click="toggleMini" />
        </div>

        <q-space />

        <!-- DERECHA -->
        <div class="row items-center">
          <!-- Fecha -->
          <div class="row items-center q-mr-lg">
            <q-icon name="event" class="q-mr-xs" />
            <span class="text-body2 text-grey-8">
              {{ currentMonthLabel }}
            </span>
          </div>

          <!-- Notificaciones -->
          <q-btn round flat dense icon="notifications" class="q-mr-md">
            <q-badge color="red" floating>3</q-badge>
          </q-btn>

          <!-- Usuario -->
          <q-btn flat dense no-caps class="user-btn">
            <q-avatar size="32px" class="q-mr-sm">
              <img src="https://i.pravatar.cc/150?img=47" />
            </q-avatar>

            <div class="column items-start q-mr-xs">
              <span class="text-body2 text-weight-medium">Ana García</span>
              <span class="text-caption text-grey">Administrador</span>
            </div>

            <q-icon name="expand_more" size="18px" />

            <q-menu
              anchor="bottom right"
              self="top right"
              transition-show="jump-down"
              transition-hide="jump-up"
              class="user-menu"
            >
              <q-list style="min-width: 220px">
                <!-- Título -->
                <q-item>
                  <q-item-section>
                    <span class="menu-title">Mi Cuenta</span>
                  </q-item-section>
                </q-item>

                <q-separator />

                <!-- Preferencias -->
                <q-item clickable v-ripple class="user-option">
                  <q-item-section avatar>
                    <q-icon name="settings" color="grey-7" />
                  </q-item-section>
                  <q-item-section>Preferencias</q-item-section>
                </q-item>

                <!-- Seguridad -->
                <q-item clickable v-ripple class="user-option">
                  <q-item-section avatar>
                    <q-icon name="security" color="grey-7" />
                  </q-item-section>
                  <q-item-section>Seguridad</q-item-section>
                </q-item>

                <q-separator />

                <!-- Cerrar sesión -->
                <q-item clickable v-ripple class="logout-option">
                  <q-item-section>Cerrar Sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- ========== CONTENT ========== -->
    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import SidebarGroup from 'src/components/compMainLayout/SidebarGroup.vue'
import SidebarItemChild from 'src/components/compMainLayout/SidebarItemChild.vue'

export default {
  name: 'MainLayout',

  components: {
    SidebarGroup,
    SidebarItemChild,
  },

  data() {
    return {
      drawerOpen: true,
      drawerMini: false,
    }
  },

  computed: {
    currentMonthLabel() {
      const d = new Date()
      return d.toLocaleString('es-ES', {
        month: 'short',
        year: 'numeric',
      })
    },
  },

  methods: {
    toggleMini() {
      this.drawerMini = !this.drawerMini
    },
  },
}
</script>

<style lang="scss">
* {
  font-family: 'Inter', sans-serif;
}

/* ------------------ VARIABLES FIGMA ------------------ */
:root {
  --gray-icon: #6b7280; /* íconos apagados */
  --gray-text: #374151; /* texto normal */
  --gray-border: #e5e7eb; /* bordes */
  --hover-blue: #f0f6ff; /* hover azul claro */
  --active-blue: #e8f0fe; /* seleccionado */
  --blue-primary: #1a73e8; /* azul GOOGLE/Figma */
}

/* ------------------ SIDEBAR ------------------ */
.q-drawer {
  background: white !important;
  border-right: 1px solid var(--gray-border);
}

.menu-item,
.menu-group,
.menu-child {
  color: var(--gray-text);
  font-weight: 400;
}

/* ícono apagado */
.menu-icon {
  color: var(--gray-icon) !important;
}

/* hover igual Figma (celeste suave) */
.menu-item:hover,
.menu-child:hover,
.menu-group:hover {
  background-color: var(--hover-blue) !important;
}

/* ------------------ ITEM SELECCIONADO ------------------ */
/* SidebarItem.vue */
.router-link-active,
.q-item--active {
  background-color: var(--active-blue) !important;
}

.router-link-active .menu-label,
.q-item--active .menu-label {
  color: var(--blue-primary) !important;
}

.router-link-active .menu-icon,
.q-item--active .menu-icon {
  color: var(--blue-primary) !important;
}

/* ------------------ FLECHAS DE EXPANSIÓN ------------------ */
.q-expansion-item__toggle-icon {
  color: var(--gray-icon) !important;
}

/* ------------------ MINI SIDEBAR ------------------ */
.menu-item-mini q-icon {
  color: var(--gray-icon) !important;
}

/* ------------------ TOPBAR ------------------ */
.topbar {
  background: white !important;
  border-bottom: 1px solid var(--gray-border);
}

.hamburger {
  color: var(--gray-icon) !important;
}
.hamburger:hover {
  color: var(--blue-primary) !important;
}

/* ------------------ OCULTAR SCROLLBAR ------------------ */
.q-scrollarea__thumb {
  display: none !important;
}
/* ===========================
   TITULOS DE GRUPO (Datos SLA, Reportes, etc.)
   =========================== */

/* Texto del grupo */
.q-expansion-item .q-item__section--main {
  color: #6b7280 !important; /* gris slate-500 del figma */
  font-weight: 400 !important;
  font-size: 14px !important;
}

/* Icono del grupo */
.q-expansion-item .q-item__section--avatar i {
  color: #6b7280 !important; /* mismo gris */
}

/* Hover del grupo (la fila superior) */
.q-expansion-item .q-item.q-item-type.row:hover {
  background-color: #eef6ff !important; /* celeste suave del figma */
}

/* Grupo activo (cuando está expandido) */
.q-expansion-item--expanded > .q-expansion-item__container > .q-item {
  background-color: #eef6ff !important; /* celeste suave */
}

/* Flecha (toggle) */
.q-expansion-item__toggle-icon {
  color: #6b7280 !important;
}
/* ==================================
   ESTADOS ACTIVOS (ITEM Y GRUPOS)
   ================================== */

/* Fondo celeste al estar seleccionado */
.q-item--active,
.q-item--active:hover {
  background-color: #d8e7ff !important; /* celeste figma */
}

/* Texto azul cuando está activo */
.q-item--active .q-item__section--main,
.q-item--active .menu-label,
.q-item--active .menu-child-label {
  color: #1a73e8 !important; /* azul figma */
  font-weight: 400 !important;
}

/* Icono azul cuando está activo */
.q-item--active .q-item__section--avatar i {
  color: #1a73e8 !important;
}

/* Para grupos (Datos SLA, Reportes, etc.) */
.q-expansion-item--expanded > .q-expansion-item__container > .q-item {
  background-color: #d8e7ff !important;
}

.q-expansion-item--expanded .q-item__section--main {
  color: #1a73e8 !important;
  font-weight: 400 !important;
}

.q-expansion-item--expanded .q-item__section--avatar i {
  color: #1a73e8 !important;
}

/* Flecha azul cuando el grupo está activo */
.q-expansion-item--expanded .q-expansion-item__toggle-icon {
  color: #1a73e8 !important;
}
/* Íconos en modo MINI (colapsado) */
.q-drawer--mini .q-item q-icon {
  color: #6b7280 !important; /* gris del Figma */
  opacity: 0.9;
}
.q-drawer--mini .q-item:hover .q-icon {
  color: #3b82f6 !important; /* azul hover */
}
/* --- ESPACIADO ENTRE ICONOS EN MODO MINI --- */
.q-drawer--mini .q-item {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

.q-drawer--mini .q-item-section {
  justify-content: center !important;
}
/* ICONOS EN DRAWER MINI (selector alternativo) */
.q-drawer--mini-closed .q-item .q-icon,
.q-drawer--mini .q-item .q-icon,
aside[mini] .q-item .q-icon,
.q-drawer.q-mini .q-item .q-icon {
  color: #6b7280 !important;
}
/* --- MENÚ DE USUARIO (ESTILO FIGMA) --- */

.user-menu {
  border-radius: 10px;
  padding: 4px 0;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.08);
}

.menu-title {
  font-weight: 400;
  font-size: 14px;
  color: #111827;
}

.user-option {
  padding: 10px 12px;
  color: #374151;
  font-size: 14px;
}

.user-option:hover {
  background: #f3f4f6;
}

.logout-option {
  padding: 12px;
  color: #dc2626 !important; /* rojo */
  font-weight: 400;
}

.logout-option:hover {
  background: #fee2e2;
}
/* --- HOVER EXACTO DEL FIGMA EN MENÚ DE USUARIO --- */

.user-option {
  padding: 10px 12px;
  color: #374151;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.user-option:hover {
  background: #e8f1ff; /* celeste suave del Figma */
  color: #1967d2 !important; /* azul del Figma */
}

.user-option:hover .q-icon {
  color: #1967d2 !important; /* icono azul cuando se hace hover */
}

.logout-option {
  padding: 12px;
  color: #dc2626 !important;
  border-radius: 6px;
  font-weight: 400;
}

.logout-option:hover {
  background: #fee2e2; /* rosado suave */
}
</style>

<style>
/* --- GRUPOS --- */
.q-expansion-item {
  padding-left: 12px;
}

.q-expansion-item__container .q-item__label {
  font-size: 14px;
  font-weight: 400;
  color: #4a5568;
}

/* --- ÍCONOS GRUPO --- */
.q-expansion-item__container .q-item__section--avatar .q-icon {
  color: #4a5568 !important;
}

/* --- MINI MODE ICONOS --- */
.menu-item-mini q-icon {
  color: #6b7280 !important;
  font-size: 22px;
  margin: 12px 0;
}
/* Ítem hijo ACTIVO (seleccionado) */
.active-child {
  background: #e8f0fe !important;
  border-left: 3px solid #1a73e8;
  color: #1a73e8 !important;
}

.active-child .menu-child-label {
  color: #1a73e8 !important;
  font-weight: 400;
}

.active-child .child-icon {
  color: #1a73e8 !important;
}
.q-drawer__content::-webkit-scrollbar {
  width: 0 !important;
}
</style>
