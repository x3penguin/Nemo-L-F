<template>
  <div id="app">
    <NavBar v-if="showNavbar" />
    <router-view />
    <NotificationCenter />
  </div>
</template>

<script>
import { computed,ref } from "vue";
import { useRoute } from "vue-router";
import NavBar from "@/components/NavBar.vue";
import NotificationCenter from "@/components/NotificationCenter.vue";

export default {
  name: "App",
  components: {
    NavBar,
    NotificationCenter,
  },
  setup() {
    const route = useRoute();
    const navbarRef = ref(null);

    const showNavbar = computed(() => {
      // Hide navbar on login and register pages
      return !["login", "register"].includes(route.name);
    });

    const refreshPotentialMatches = () => {
      // Find NavBar component instance using ref
      if (navbarRef.value) {
        navbarRef.value.checkPotentialMatches();
      }
    };

    window.refreshPotentialMatches = refreshPotentialMatches;

    return {
      showNavbar,
    };
  },
};
</script>

<style>
/* Global CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f9f9f9;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

button,
input,
select,
textarea {
  font-family: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.75rem;
  }
}
</style>
