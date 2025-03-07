import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/zone/:zoneId',
      name: 'zone-zoneId',
      component: () => import('../views/ZoneView.vue'),
    },
    {
      path: '/zone',
      name: 'zone',
      component: () => import('../views/ZoneView.vue'),
    },
    // {
    //   path: '/takePhoto/:zoneId',
    //   name: 'takePhoto-zoneId',
    //   component: () => import('../views/TakePhotosView.vue'),
    // },
    {
      path: '/photoList',
      name: 'photoList',
      component: () => import('../views/PhotoListView.vue'),
    }
  ],
})

export default router
