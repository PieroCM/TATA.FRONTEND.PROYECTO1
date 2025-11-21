const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
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

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
