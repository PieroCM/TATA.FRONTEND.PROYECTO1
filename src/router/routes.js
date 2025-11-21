const routes = [
  {
    // Ruta raíz: Login
    path: '/',
    component: () => import('src/view/Sistemas/logView.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
    component: () => import('src/view/InicioSesion/LoginForm.vue'),
  },
  {
    // Ruta del sistema con MainLayout
    path: '/sistema',
    component: () => import('layouts/MainLayout.vue'),
    children: [
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
    ],
  },
  {
    path: '/register',
    component: () => import('src/view/InicioSesion/RegisterForm.vue'),
  },

  {
    path: '/GestionSLAView',
    name: 'GestionSLAView',
    component: () => import('src/view/SLA/GestionSLAView.vue'),
  },

  {
    path: '/CargaVolumenSolicitudView',
    name: 'CargaVolumenSolicitudView',
    component: () => import('src/view/SLA/CargaVolumenSolicitudView.vue'),
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
