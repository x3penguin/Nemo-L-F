import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";

// Views
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";

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
    path: "/payment-form",
    name: "PaymentForm",
    component: () => import("@/views/PaymentForm.vue"),
  },
  {
    path: "/potential-matches/:id",
    name: "potential-matches",
    component: () => import("@/views/PotentialMatches.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/items/:id",
    name: "item-details",
    component: () => import("@/views/ItemDetail.vue"),
    meta: {
      requiresAuth: true,
    },
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
