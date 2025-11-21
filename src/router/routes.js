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
    children: [
      {
        path: '',
        redirect: '/dashboard'
        redirect: '/sistema/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/Dashboard.vue'),
        meta: { title: 'Dashboard Ejecutivo SLA' }
      },
      {
        path: 'sla-analitica',
        name: 'sla-analitica',
        component: () => import('pages/SLA_AnaliticaInteractiva.vue'),
        meta: { title: 'Analítica Interactiva SLA' }
      },
      // Ruta comentada - Filtros y Reportes manejado en otra rama
      // {
      //   path: 'sla-filtros',
      //   name: 'sla-filtros',
      //   component: () => import('pages/SLA_FiltrosReporte.vue'),
      //   meta: { title: 'Filtros de Reporte SLA' }
      // },
      {
        path: 'productos',
        name: 'productos',
        component: () => import('pages/Productos.vue'),
        meta: { title: 'Productos' }
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('pages/Usuarios.vue'),
        meta: { title: 'Usuarios' }
      },
      {
        path: 'reportes',
        name: 'reportes',
        component: () => import('pages/Reportes.vue'),
        meta: { title: 'Reportes' }
      },
      {
        path: 'index',
        component: () => import('pages/IndexPage.vue')
      }
        component: () => import('src/view/DashBoard/DashBoard.vue'),
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
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
