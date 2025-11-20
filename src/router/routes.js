const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'dashboard', component: () => import('src/view/DashBoard/DashBoard.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('src/view/InicioSesion/LoginForm.vue'),
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
