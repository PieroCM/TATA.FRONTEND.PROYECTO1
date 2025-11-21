const routes = [
  {
    // Ruta raíz: Login
    path: '/',
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
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
