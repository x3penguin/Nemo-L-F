import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

// Views
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import ReportLost from '@/views/ReportLost.vue';
import ReportFound from '@/views/ReportFound.vue';
import Collection from '@/views/Collection.vue';
import Profile from '@/views/Profile.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { 
      guest: true 
    }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { 
      guest: true 
    }
  },
  {
    path: '/report-lost',
    name: 'report-lost',
    component: ReportLost,
    meta: { 
      requiresAuth: true 
    }
  },
  {
    path: '/report-found',
    name: 'report-found',
    component: ReportFound,
    meta: { 
      requiresAuth: true 
    }
  },
  {
    path: '/collections',
    name: 'collections',
    component: Collection,
    meta: { 
      requiresAuth: true 
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { 
      requiresAuth: true 
    }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters['auth/isLoggedIn'];
  
  // Routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } 
  // Routes for guests only (login, register)
  else if (to.matched.some(record => record.meta.guest)) {
    if (isLoggedIn) {
      next({ path: '/' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;