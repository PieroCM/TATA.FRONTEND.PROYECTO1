<template>
  <q-layout view="hHh lpR fFf">
    <!-- ========== SIDEBAR ========== -->
    <q-drawer
      v-model="drawerOpen"
      :mini="drawerMini"
      show-if-above
      :width="250"
      :breakpoint="1024"
      bordered
      class="sidebar"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- GRUPO: Dashboard -->
          <SidebarGroup
            icon="dashboard"
            label="Dashboard"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/dashboard', '/sistema/analitica-interactiva']"
          >
            <SidebarItemChild
              label="Dashboard ejecutivo"
              icon="bar_chart"
              to="/sistema/dashboard"
            />
            <SidebarItemChild
              label="Análisis interactivo"
              icon="show_chart"
              to="/sistema/analitica-interactiva"
            />
          </SidebarGroup>
          <!-- GRUPO: Datos SLA -->
          <SidebarGroup
            icon="storage"
            label="Datos solicitud"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/carga-volumen', '/sistema/gestion-sla']"
          >
            <SidebarItemChild label="Cargar Datos" icon="upload" to="/sistema/carga-volumen" />
            <SidebarItemChild label="Gestión de solicitud" icon="edit" to="/sistema/gestion-sla" />
          </SidebarGroup>

          <!-- GRUPO: Reportes -->
          <SidebarGroup
            icon="description"
            label="Reportes"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/reportes-sla', '/sistema/programar-envio']"
          >
            <SidebarItemChild
              label="Reporte de cumplimiento"
              icon="bar_chart"
              to="/sistema/reportes-sla"
            />
            <SidebarItemChild
              label="Programar envío automático"
              icon="schedule"
              to="/sistema/programar-envio"
            />
          </SidebarGroup>

          <!-- GRUPO: Alertas SLA -->
          <SidebarGroup
            icon="warning_amber"
            label="Alertas SLA"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/alertas', '/sistema/alertas/email']"
          >
            <SidebarItemChild
              icon="warning_amber"
              label="Gestión de alertas"
              to="/sistema/alertas"
            />
          </SidebarGroup>

          <!-- GRUPO: Configuración -->

          <!-- GRUPO: Sistema -->
          <SidebarGroup
            icon="memory"
            label="Sistema"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/log-view']"
          >
            <SidebarItemChild icon="monitor_heart" label="Logs" to="/sistema/log-view" />
          </SidebarGroup>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- ========== HEADER ========== -->
    <q-header elevated class="bg-white text-dark topbar">
      <q-toolbar class="header-bar">
        <!-- IZQUIERDA: Logo + Hamburguesa -->
        <q-avatar
          v-if="!drawerMini"
          rounded
          size="32px"
          class="bg-primary text-white flex flex-center q-mr-sm"
        >
          <q-icon name="grid_view" size="20px" />
        </q-avatar>
        <span v-if="!drawerMini" class="text-weight-medium text-body1 q-mr-lg">SLA Manager</span>

        <q-btn flat dense round icon="menu" class="hamburger" @click="toggleMini" />

        <q-space />

        <!-- DERECHA: Fecha + Notificaciones + Usuario -->
        <div class="row items-center q-gutter-md">
          <!-- Fecha -->
          <div class="row items-center no-wrap">
            <q-icon name="event" size="18px" class="q-mr-xs" />
            <span class="text-body2 text-grey-8">{{ currentMonthLabel }}</span>
          </div>

          <!-- Notificaciones -->
          <q-btn round flat dense icon="notifications">
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

  watch: {
    $route() {
      // En pantallas pequeñas, cerrar el drawer al cambiar de ruta
      if (this.$q.screen.lt.lg) {
        this.drawerOpen = false
      }
    },
  },

  methods: {
    toggleMini() {
      // En pantallas pequeñas, toggle del drawer completo (abrir/cerrar)
      if (this.$q.screen.lt.lg) {
        this.drawerOpen = !this.drawerOpen
      } else {
        // En pantallas grandes, toggle del modo mini (expandir/contraer)
        this.drawerMini = !this.drawerMini
      }
    },
    handleDrawerClick() {
      // En pantallas pequeñas, cerrar drawer al hacer click en cualquier item del menú
      if (this.$q.screen.lt.lg) {
        this.drawerOpen = false
      }
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
  z-index: 2000 !important; /* Debajo del header */
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

/* ------------------ MINI SIDEBAR (CONTRAÍDO - SOLO ICONOS) ------------------ */
/* Ocultar textos en modo mini */
.q-drawer--mini .q-item__label,
.q-drawer--mini .q-expansion-item__toggle-icon {
  display: none !important;
}

/* Centrar iconos en modo mini */
.q-drawer--mini .q-item {
  justify-content: center !important;
  padding: 12px 0 !important;
}

.q-drawer--mini .q-item__section--avatar {
  min-width: auto !important;
  padding-right: 0 !important;
}

/* Iconos en modo mini */
.q-drawer--mini .q-icon {
  color: var(--gray-icon) !important;
  font-size: 24px !important;
}

.q-drawer--mini .q-item:hover .q-icon {
  color: var(--blue-primary) !important;
}

.q-drawer--mini .q-item--active .q-icon,
.q-drawer--mini .router-link-active .q-icon {
  color: var(--blue-primary) !important;
}

/* Hover en modo mini */
.q-drawer--mini .q-item:hover {
  background-color: var(--hover-blue) !important;
}

/* Activo en modo mini */
.q-drawer--mini .q-item--active,
.q-drawer--mini .router-link-active {
  background-color: var(--active-blue) !important;
  border-left: 3px solid var(--blue-primary);
}

/* Espaciado entre items en modo mini */
.q-drawer--mini .q-expansion-item {
  padding: 0 !important;
}

.q-drawer--mini .q-list {
  padding: 8px 0 !important;
}

.menu-item-mini q-icon {
  color: var(--gray-icon) !important;
}

/* ------------------ TOPBAR ------------------ */
.topbar {
  background: white !important;
  border-bottom: 1px solid var(--gray-border);
  height: 56px;
  z-index: 3000 !important; /* Asegura que el header esté encima del drawer */
}

.header-bar {
  min-height: 56px;
  height: 56px;
  z-index: 3000 !important;
}

.hamburger {
  color: var(--gray-icon) !important;
}
.hamburger:hover {
  color: var(--blue-primary) !important;
}

/* ------------------ RESPONSIVIDAD ------------------ */
@media (max-width: 1023px) {
  /* En pantallas pequeñas, el drawer se comporta como overlay */
  .q-drawer {
    z-index: 6000 !important; /* Por encima del header en móvil */
  }

  .topbar {
    z-index: 5500 !important; /* Header debajo del drawer en móvil */
  }

  .q-layout__backdrop {
    z-index: 5000 !important;
  }
}

/* Para pantallas mayores (desktop), mantener jerarquía original */
@media (min-width: 1024px) {
  .q-drawer {
    z-index: 2000 !important; /* Debajo del header en desktop */
  }

  .topbar {
    z-index: 3000 !important; /* Header encima del drawer en desktop */
  }
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
