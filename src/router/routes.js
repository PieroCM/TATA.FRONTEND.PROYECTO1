const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard'
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
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
