<template>
    <div id="app">
      <NavBar v-if="showNavbar" />
      <router-view />
    </div>
  </template>
  
  <script>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import NavBar from '@/components/NavBar.vue';
  
  export default {
    name: 'App',
    components: {
      NavBar
    },
    setup() {
      const route = useRoute();
      
      const showNavbar = computed(() => {
        // Hide navbar on login and register pages
        return !['login', 'register'].includes(route.name);
      });
      
      return {
        showNavbar
      };
    }
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
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
  
  button, input, select, textarea {
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