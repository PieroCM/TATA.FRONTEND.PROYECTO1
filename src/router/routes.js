const routes = [
  {
    // Ruta raíz: Login
    path: '/',
    component: () => import('src/view/InicioSesion/LoginForm.vue'),
    meta: { public: true },
  },
  {
    // Ruta explícita para login
    path: '/login',
    component: () => import('src/view/InicioSesion/LoginForm.vue'),
    meta: { public: true },
  },
  {
    path: '/forgot-password',
    component: () => import('src/view/InicioSesion/ForgotPassword.vue'),
    meta: { public: true },
  },
  {
    path: '/activacion-cuenta',
    component: () => import('src/view/InicioSesion/ActivacionCuentaPage.vue'),
    meta: { public: true },
  },
  {
    path: '/no-autorizado',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { public: true, title: 'No Autorizado' },
  },
  {
    // Ruta del sistema con MainLayout
    path: '/sistema',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/sistema/dashboard',
    meta: { requiresAuth: true },
    beforeEnter: async (to, from, next) => {
      // Pre-cargar datos críticos en paralelo para todas las vistas del sistema
      if (from.path === '/' || from.path === '/login') {
        try {
          const { useSlaStore } = await import('src/stores/useSlaStore')
          const store = useSlaStore()

          // Pre-cargar datos en paralelo sin bloquear la navegación
          Promise.all([
            store.fetchSolicitudes(false),
            store.fetchRoles(false),
            store.fetchConfigSla(false),
          ]).catch((err) => console.log('Pre-carga en segundo plano:', err))
        } catch (error) {
          console.log('Error en pre-carga:', error)
        }
      }
      next()
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard-ejecutivo',
        component: () => import('src/view/DashBoard/SLA_FiltrosReporte.vue'),
        meta: { title: 'Dashboard Ejecutivo SLA', permisos: ['DASHBOARD_EJECUTIVO'] },
      },
      {
        path: 'analitica-interactiva',
        name: 'analitica-interactiva',
        component: () => import('src/view/DashBoard/SLA_AnaliticaInteractiva.vue'),
        meta: { title: 'Análisis Interactivo SLA', permisos: ['ANALISIS_INTERACTIVO'] },
      },
      {
        path: 'alertas',
        name: 'alertas',
        component: () => import('src/view/Alertas/PageGestionAlertas.vue'),
        meta: { title: 'Gestión de Alertas', permisos: ['GESTION_ALERTAS'] },
      },
      {
        path: 'alertas/config-email',
        name: 'alertas-config-email',
        component: () => import('src/view/Alertas/PageConfigEmail.vue'),
        meta: { title: 'Configuración de Email', permisos: ['CONFIGURAR_EMAIL'] },
      },
      {
        path: 'gestion-sla',
        name: 'GestionSLAView',
        component: () => import('src/view/SLA/GestionSLAView.vue'),
        meta: { title: 'Gestión SLA', permisos: ['GESTION_SOLICITUD'] },
      },
      {
        path: 'carga-volumen',
        name: 'CargaVolumenSolicitudView',
        component: () => import('src/view/SLA/CargaVolumenSolicitudView.vue'),
        meta: { title: 'Carga de Volumen', permisos: ['CARGA_DATOS'] },
      },
      {
        path: 'log-view',
        name: 'LogView',
        component: () => import('src/view/Sistemas/logView.vue'),
        meta: { title: 'Logs del Sistema', permisos: ['LOGS'] },
      },
      {
        path: 'usuario',
        name: 'usuario-perfil',
        component: () => import('src/view/Usuarios/UsuarioView.vue'),
        meta: { title: 'Mi Perfil' },
        // Sin permisos: accesible para cualquier usuario autenticado
      },
      {
        path: 'reportes/sla-indicadores',
        name: 'reportes-sla-indicadores',
        component: () => import('src/view/Reportes/ReporteSLAIndicadores.vue'),
        meta: { title: 'Reporte SLA - Indicadores', permisos: ['REPORTE_CUMPLIMIENTO'] },
      },
      {
        path: 'reportes/sla-historial',
        name: 'reportes-sla-historial',
        component: () => import('src/view/Reportes/HistorialReportesSLA.vue'),
        meta: { title: 'Historial de Reportes SLA', permisos: ['HISTORIAL_REPORTES'] },
      },
      {
        path: 'usuarios',
        name: 'gestion-usuarios',
        component: () => import('src/view/Usuarios/GestionUsuarios.vue'),
        meta: { title: 'Gestión de Usuarios', permisos: ['GESTION_USUARIOS'] },
      },
      {
        path: 'configuracion',
        name: 'configuracion-sistema',
        component: () => import('src/view/Sistemas/ConfiguracionView.vue'),
        meta: { title: 'Configuración del Sistema' },
      },
      {
        path: 'predicciones/dashboard',
        name: 'predicciones-dashboard',
        component: () => import('src/view/Predicciones/DashboardPredicciones.vue'),
        meta: { title: 'Dashboard de Predicciones', permisos: ['DASHBOARD_PREDICCIONES'] },
      },
      {
        path: 'predicciones/riesgo',
        name: 'predicciones-riesgo',
        component: () => import('src/view/Predicciones/PrediccionesRiesgoSLA.vue'),
        meta: { title: 'Predicción de Riesgo SLA', permisos: ['PREDICCIONES_RIESGO_SLA'] },
      },
    ],
  },

  // Siempre dejar esta al final
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { public: true, title: 'Página No Encontrada' },
  },
]

export default routes
