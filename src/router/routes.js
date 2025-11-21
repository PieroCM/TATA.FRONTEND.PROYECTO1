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
        redirect: '/sistema/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
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
