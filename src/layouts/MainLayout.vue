<template>
  <q-layout view="hHh lpR fFf">
    <!-- ========== SIDEBAR ========== -->
    <q-drawer
      v-model="drawerOpen"
      :mini="drawerMini && isDesktopMode"
      :overlay="isMobile"
      :behavior="isDesktopMode ? 'desktop' : 'mobile'"
      show-if-above
      :width="260"
      :mini-width="56"
      :breakpoint="600"
      bordered
      class="sidebar"
      @mouseenter="handleDrawerMouseEnter"
      @mouseleave="handleDrawerMouseLeave"
    >
      <!-- Botón cerrar solo en mobile -->
      <div v-if="isMobile" class="mobile-header">
        <q-btn flat round dense icon="close" class="close-btn" @click="drawerOpen = false" />
      </div>

      <q-scroll-area class="fit" :style="isMobile ? 'height: calc(100% - 56px)' : ''">
        <q-list padding>
          <!-- GRUPO: Dashboard -->
          <SidebarGroup
            v-if="hasPerm('DASHBOARD_EJECUTIVO') || hasPerm('ANALISIS_INTERACTIVO')"
            icon="dashboard"
            label="Dashboard"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/dashboard', '/sistema/analitica-interactiva']"
          >
            <SidebarItemChild
              v-if="hasPerm('DASHBOARD_EJECUTIVO')"
              label="Dashboard ejecutivo"
              icon="bar_chart"
              to="/sistema/dashboard"
            />
            <SidebarItemChild
              v-if="hasPerm('ANALISIS_INTERACTIVO')"
              label="Análisis interactivo"
              icon="show_chart"
              to="/sistema/analitica-interactiva"
            />
          </SidebarGroup>
          <!-- GRUPO: Datos SLA -->
          <SidebarGroup
            v-if="hasPerm('CARGA_DATOS') || hasPerm('GESTION_SOLICITUD')"
            icon="storage"
            label="Datos solicitud"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/carga-volumen', '/sistema/gestion-sla']"
          >
            <SidebarItemChild
              v-if="hasPerm('CARGA_DATOS')"
              label="Cargar Datos"
              icon="upload"
              to="/sistema/carga-volumen"
            />
            <SidebarItemChild
              v-if="hasPerm('GESTION_SOLICITUD')"
              label="Gestión de solicitud"
              icon="edit"
              to="/sistema/gestion-sla"
            />
          </SidebarGroup>

          <!-- GRUPO: Reportes -->
          <SidebarGroup
            v-if="hasPerm('REPORTE_CUMPLIMIENTO') || hasPerm('HISTORIAL_REPORTES')"
            icon="description"
            label="Reportes"
            :mini="drawerMini"
            :childrenRoutes="[
              '/sistema/reportes/sla-indicadores',
              '/sistema/reportes/sla-historial',
            ]"
          >
            <SidebarItemChild
              v-if="hasPerm('REPORTE_CUMPLIMIENTO')"
              label="Reporte de cumplimiento"
              icon="bar_chart"
              to="/sistema/reportes/sla-indicadores"
            />
            <SidebarItemChild
              v-if="hasPerm('HISTORIAL_REPORTES')"
              label="Historial de reportes"
              icon="history"
              to="/sistema/reportes/sla-historial"
            />
          </SidebarGroup>

          <!-- GRUPO: Alertas SLA -->
          <SidebarGroup
            v-if="hasPerm('GESTION_ALERTAS') || hasPerm('CONFIGURAR_EMAIL')"
            icon="notifications_active"
            label="Alertas SLA"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/alertas', '/sistema/alertas/config-email']"
          >
            <SidebarItemChild
              v-if="hasPerm('GESTION_ALERTAS')"
              icon="notifications"
              label="Gestión de Alertas"
              to="/sistema/alertas"
            />
            <SidebarItemChild
              v-if="hasPerm('CONFIGURAR_EMAIL')"
              icon="email"
              label="Configurar Email"
              to="/sistema/alertas/config-email"
            />
          </SidebarGroup>

          <!-- GRUPO: Predicciones -->
          <SidebarGroup
            v-if="hasPerm('DASHBOARD_PREDICCIONES') || hasPerm('PREDICCIONES_RIESGO_SLA')"
            icon="psychology"
            label="Predicciones"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/predicciones/dashboard', '/sistema/predicciones/riesgo']"
          >
            <SidebarItemChild
              v-if="hasPerm('DASHBOARD_PREDICCIONES')"
              icon="dashboard"
              label="Dashboard Predicciones"
              to="/sistema/predicciones/dashboard"
            />
            <SidebarItemChild
              v-if="hasPerm('PREDICCIONES_RIESGO_SLA')"
              icon="analytics"
              label="Análisis de Riesgo"
              to="/sistema/predicciones/riesgo"
            />
          </SidebarGroup>

          <!-- GRUPO: Configuración -->

          <!-- GRUPO: Sistema -->
          <SidebarGroup
            v-if="hasPerm('LOGS') || hasPerm('GESTION_USUARIOS')"
            icon="memory"
            label="Sistema"
            :mini="drawerMini"
            :childrenRoutes="['/sistema/log-view', '/sistema/usuarios', '/sistema/configuracion']"
          >
            <SidebarItemChild
              v-if="hasPerm('LOGS')"
              icon="monitor_heart"
              label="Logs"
              to="/sistema/log-view"
            />
            <SidebarItemChild
              v-if="hasPerm('GESTION_USUARIOS')"
              icon="people"
              label="Gestión de Usuarios"
              to="/sistema/usuarios"
            />
            <SidebarItemChild icon="settings" label="Configuración" to="/sistema/configuracion" />
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
            <span v-show="!isSmallMobile" class="text-body2 text-grey-8">{{
              currentMonthLabel
            }}</span>
          </div>

          <!-- Usuario -->
          <q-btn flat dense no-caps class="user-btn">
            <!-- Modo ultra pequeño: solo ícono -->
            <q-icon v-if="isUltraSmall" name="person" size="20px" class="q-mr-xs" />

            <!-- Modo normal: avatar + info -->
            <template v-else>
              <q-avatar size="32px" class="q-mr-sm">
                <q-icon name="person" size="30px" class="q-mr-xs" />
              </q-avatar>

              <div class="column items-start q-mr-xs">
                <span class="text-body2 text-weight-medium">{{
                  authStore.userName || 'Usuario'
                }}</span>
                <span class="text-caption text-grey">{{ authStore.userRole || 'Rol' }}</span>
              </div>
            </template>

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

                <!-- Usuario -->
                <q-item clickable v-ripple class="user-option" @click="irAPerfil" v-close-popup>
                  <q-item-section avatar>
                    <q-icon name="person" color="grey-7" />
                  </q-item-section>
                  <q-item-section>Perfil de usuario</q-item-section>
                </q-item>

                <q-separator />

                <!-- Cerrar sesión -->
                <q-item clickable v-ripple class="logout-option" @click="cerrarSesion">
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
import { useAuthStore } from 'stores/useAuthStore'

export default {
  name: 'MainLayout',

  components: {
    SidebarGroup,
    SidebarItemChild,
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      drawerOpen: true,
      drawerMini: false,
      hoverExpanded: false,
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
    isMobile() {
      return this.$q.screen.lt.sm
    },
    isTablet() {
      return this.$q.screen.width >= 768 && this.$q.screen.width <= 1023
    },
    isDesktopMode() {
      return !this.isMobile
    },
    isSmallMobile() {
      return this.$q.screen.width < 521
    },
    isUltraSmall() {
      return this.$q.screen.width <= 457
    },
  },

  watch: {
    $route() {
      // En pantallas pequeñas, cerrar el drawer al cambiar de ruta
      if (this.isMobile) {
        this.drawerOpen = false
      }
    },
  },

  mounted() {
    // Asegurar que los permisos estén cargados desde localStorage
    if (!this.authStore.token) {
      this.authStore.hydrateFromLocalStorage()
    }
  },

  methods: {
    hasPerm(codigoPermiso) {
      return this.authStore.permisos?.includes(codigoPermiso) || false
    },
    toggleMini() {
      // En mobile real (<600px), toggle del drawer completo (abrir/cerrar)
      if (this.isMobile) {
        this.drawerOpen = !this.drawerOpen
      } else {
        // En tablet y desktop (>=600px), toggle del modo mini (expandir/contraer)
        this.drawerMini = !this.drawerMini
        // Desactivar hover expansion cuando el usuario hace clic manualmente
        this.hoverExpanded = false
      }
    },
    handleDrawerMouseEnter() {
      // Solo aplicar hover en desktop/tablet (>=600px)
      if (!this.isDesktopMode) return
      
      // Solo expandir si el drawer está en modo mini
      if (this.drawerMini) {
        this.drawerMini = false
        this.hoverExpanded = true
      }
    },
    handleDrawerMouseLeave() {
      // Solo aplicar hover en desktop/tablet (>=600px)
      if (!this.isDesktopMode) return
      
      // Solo colapsar si fue expandido por hover (no por clic manual)
      if (this.hoverExpanded) {
        this.drawerMini = true
        this.hoverExpanded = false
      }
    },
    handleDrawerClick() {
      // Solo cerrar drawer en mobile real (<600px)
      if (this.isMobile) {
        this.drawerOpen = false
      }
    },
    irAPerfil() {
      this.$router.push('/sistema/usuario')
    },
    cerrarSesion() {
      // Limpiar sesión
      this.authStore.clearAuth()

      // Notificar al usuario
      this.$q.notify({
        type: 'info',
        message: 'Sesión cerrada exitosamente',
        position: 'bottom',
        timeout: 1500,
      })

      // Redirigir al login
      this.$router.push('/')
    },
  },
}
</script>

<style lang="scss">
* {
  font-family: 'Inter', sans-serif;
}

/* ------------------ COLORES BASE ------------------ */
:root {
  --sidebar-bg: #ffffff;
  --border-color: #e5e7eb;
  --text-primary: #374151;
  --text-secondary: #6b7280;
  --icon-default: #6b7280;
  --hover-bg: #f3f4f6;
  --active-bg: #dbeafe;
  --active-color: #2563eb;
  --active-border: #2563eb;
}

/* ------------------ SIDEBAR ------------------ */
.q-drawer {
  background: white !important;
  border-right: 1px solid #e5e7eb;
  z-index: 2000 !important;
}

.q-drawer :deep(.q-scrollarea__content) {
  padding: 0 !important;
}

.q-drawer :deep(.q-list) {
  padding: 4px 0 !important;
}

/* Header mobile con botón cerrar */
.mobile-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid #e5e7eb;
}

.close-btn {
  color: #6b7280;
}

.close-btn:hover {
  color: #2563eb;
  background: #f3f4f6;
}

/* Controlar el espaciado de los iconos globalmente */
.q-drawer :deep(.q-item__section--avatar) {
  min-width: 40px !important;
  padding-right: 12px !important;
}

.q-drawer :deep(.q-item) {
  padding-left: 16px !important;
  padding-right: 16px !important;
}

/* ------------------ FLECHAS DE EXPANSIÓN ------------------ */
.q-expansion-item__toggle-icon {
  color: #9ca3af !important;
  font-size: 16px !important;
}

.q-expansion-item :deep(.q-item__section--side) {
  padding-left: 0 !important;
}

/* ------------------ MINI SIDEBAR (CONTRAÍDO - SOLO ICONOS) ------------------ */
.q-drawer--mini {
  border-right: 1px solid #e5e7eb !important;
  background: white !important;
}

.q-drawer--mini .q-item__label,
.q-drawer--mini .q-expansion-item__toggle-icon {
  display: none !important;
}

.q-drawer--mini .q-item {
  justify-content: center !important;
  padding: 10px 0 !important;
  min-height: 48px !important;
  margin: 2px 0 !important;
}

.q-drawer--mini .q-item__section--avatar {
  min-width: 100% !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

.q-drawer--mini .q-item__section--main {
  display: none !important;
}

.q-drawer--mini .q-icon {
  color: #6b7280 !important;
  font-size: 20px !important;
}

.q-drawer--mini .q-item:hover {
  background-color: #f3f4f6 !important;
}

.q-drawer--mini .q-item:hover .q-icon {
  color: #2563eb !important;
}

/* Activo en modo mini */
.q-drawer--mini .active-item,
.q-drawer--mini .menu-child--active {
  background-color: #dbeafe !important;
  border-left: 3px solid #2563eb !important;
  border-radius: 0 !important;
}

.q-drawer--mini .active-item .q-icon,
.q-drawer--mini .menu-child--active .q-icon {
  color: #2563eb !important;
}

.q-drawer--mini .q-expansion-item {
  padding: 0 !important;
  margin: 0 !important;
}

.q-drawer--mini .q-expansion-item__content {
  display: none !important;
}

.q-drawer--mini .q-list {
  padding: 8px 0 !important;
}

.q-drawer--mini .q-scrollarea__content {
  width: 56px !important;
}

/* ------------------ TOPBAR ------------------ */
.topbar {
  background: white !important;
  border-bottom: 1px solid #e5e7eb;
  height: 64px;
  z-index: 3000 !important;
}

.header-bar {
  min-height: 64px;
  height: 64px;
  z-index: 3000 !important;
  padding: 0 12px;
}

.hamburger {
  color: #6b7280 !important;
}

.hamburger:hover {
  color: #2563eb !important;
  background: #f3f4f6;
}

/* ------------------ RESPONSIVIDAD ------------------ */
@media (max-width: 599px) {
  /* Solo móviles reales (<600px): drawer modal con overlay */
  .q-drawer {
    z-index: 6000 !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  }

  .topbar {
    z-index: 5500 !important;
  }

  .q-layout__backdrop {
    z-index: 5000 !important;
    background: rgba(0, 0, 0, 0.5) !important;
  }

  /* Drawer ocupa altura completa en mobile */
  .sidebar {
    height: 100vh !important;
  }
}

/* Para tablets (600-1023px) y desktop (>=1024px): comportamiento fijo */
@media (min-width: 600px) {
  .q-drawer {
    z-index: 2000 !important;
  }

  .topbar {
    z-index: 3000 !important;
  }

  /* Ocultar botón cerrar en tablet y desktop */
  .mobile-header {
    display: none !important;
  }

  /* No overlay en tablet y desktop */
  .q-layout__backdrop {
    display: none !important;
  }
}

/* ===========================
   EXPANSION ITEMS - LIMPIEZA
   =========================== */
.q-expansion-item {
  border-radius: 0 !important;
}

.q-expansion-item .q-item {
  border-radius: 0 !important;
}
/* ==================================
   ITEMS GENERALES
   ================================== */
.q-item {
  border-radius: 0 !important;
}

/* --- MENÚ DE USUARIO --- */
.user-menu {
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-title {
  font-weight: 500;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px;
}

.user-option {
  padding: 10px 12px;
  color: #374151;
  font-size: 14px;
  border-radius: 6px;
  margin-bottom: 2px;
  transition: all 0.15s ease;
}

.user-option:hover {
  background: #dbeafe !important;
  color: #2563eb !important;
}

.user-option:hover .q-icon {
  color: #2563eb !important;
}

.logout-option {
  padding: 10px 12px;
  color: #dc2626 !important;
  border-radius: 6px;
  font-weight: 400;
  margin-top: 4px;
}

.logout-option:hover {
  background: #fee2e2 !important;
}
</style>

<style>
/* --- SCROLLBAR OCULTO --- */
.q-drawer__content::-webkit-scrollbar {
  width: 0 !important;
}

.q-scrollarea__thumb {
  display: none !important;
}
</style>
