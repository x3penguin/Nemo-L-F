// frontend/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";

// Views
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import ItemDetail from '@/views/ItemDetail.vue';
import PotentialMatches from '@/views/PotentialMatches.vue';

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/home/:userId",
    name: "Userhome",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      guest: true,
    },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/Register.vue"),
    meta: {
      guest: true,
    },
  },
  {
    path: "/report-lost",
    name: "report-lost",
    component: () => import("@/views/ReportLost.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/report-found",
    name: "report-found",
    component: () => import("@/views/ReportFound.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import("@/views/Chat.vue"),
    meta: { 
      requiresAuth: true 
    }
  },
  // {
  //   path: '/chats/:id',
  //   name: 'ChatDetail',
  //   component: ChatDetail,
  //   meta: { 
  //     requiresAuth: true 
  //   } 
  // },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/Profile.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/collections",
    name: "collection",
    component: () => import("@/views/Collection.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/report-success",
    name: "report-success",
    component: () => import("@/views/ReportSuccess.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/logistics-form",
    name: "LogisticsForm",
    component: () => import("@/views/LogisticsForm.vue"),
  },
  {
    path: "/potential-matches",
    name: "all-potential-matches",
    component: PotentialMatches,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/payment-form",
    name: "PaymentForm",
    component: () => import("@/views/PaymentForm.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/paymentResult",
    name: "PaymentResult",
    component: () => import("@/views/PaymentResult.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/items/:id",
    name: "item-details",
    component: ItemDetail,
    props: true,
    meta: {
      requiresAuth: true,
    },
    beforeRouteUpdate: (to, from, next) => {
      to.meta.skipFetchingData = false;
      next();
    }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters["auth/isLoggedIn"];

  // Routes that require authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  }
  // Routes for guests only (login, register)
  else if (to.matched.some((record) => record.meta.guest)) {
    if (isLoggedIn) {
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;