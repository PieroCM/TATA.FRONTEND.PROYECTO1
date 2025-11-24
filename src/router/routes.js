const routes = [
  {
    // Ruta raíz: Login
    path: '/',
    component: () => import('src/view/InicioSesion/LoginForm.vue'),
  },
  {
    path: '/register',
    component: () => import('src/view/InicioSesion/RegisterForm.vue'),
  },
  {
    // Ruta del sistema con MainLayout
    path: '/sistema',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/sistema/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard-ejecutivo',
        component: () => import('src/view/DashBoard/SLA_FiltrosReporte.vue'),
        meta: { title: 'Dashboard Ejecutivo SLA' },
      },
      {
        path: 'analitica-interactiva',
        name: 'analitica-interactiva',
        component: () => import('src/view/DashBoard/SLA_AnaliticaInteractiva.vue'),
        meta: { title: 'Análisis Interactivo SLA' },
      },
      {
        path: 'alertas',
        name: 'alertas',
        component: () => import('src/view/Alertas/PageGestionAlertas.vue'),
      },
      {
        path: 'alertas/email',
        name: 'alertas-email',
        component: () => import('src/view/Configuraciones/PageConfigEmail.vue'),
      },
      {
        path: 'gestion-sla',
        name: 'GestionSLAView',
        component: () => import('src/view/SLA/GestionSLAView.vue'),
      },
      {
        path: 'carga-volumen',
        name: 'CargaVolumenSolicitudView',
        component: () => import('src/view/SLA/CargaVolumenSolicitudView.vue'),
      },
      {
        path: 'log-view',
        name: 'LogView',
        component: () => import('src/view/Sistemas/logView.vue'),
      },
      {
        path: '/reportes/sla-indicadores',
        component: () => import('src/view/Reportes/ReporteSLAIndicadores.vue')
      },
      {
        path: '/reportes/sla-historial',
        component: () => import('src/view/Reportes/HistorialReportesSLA.vue')
      }

    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
