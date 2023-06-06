import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import BluetoothPage from "@/views/BluetoothPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'setting',
        component: () => import('@/views/SettingPage.vue')
      },
      {
        path: 'info',
        component: () => import('@/views/InfoPage.vue')
      },
      {
        path: 'track',
        component: () => import('@/views/TrackPage.vue')
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      }
    ]
  },
  {
    name: 'bluetooth',
    path: '/bluetooth',
    component: BluetoothPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
