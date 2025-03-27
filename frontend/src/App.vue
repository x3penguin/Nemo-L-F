<template>
  <div id="app">
    <NavBar v-if="showNavbar" />
    <router-view />
    <NotificationCenter />
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import NavBar from "@/components/NavBar.vue";
import NotificationCenter from "@/components/NotificationCenter.vue";
import * as notifService from "@/services/notifService";

export default {
  name: "App",
  components: {
    NavBar,
    NotificationCenter,
  },
  setup() {
    const route = useRoute();
    const store = useStore();
    const pollingIntervalId = ref(null);

    const showNavbar = computed(() => {
      // Hide navbar on login and register pages
      return !["login", "register"].includes(route.name);
    });

    const user = computed(() => store.getters["auth/user"]);

    // Function to handle new matches
    const handleNewMatches = (matches) => {
      matches.forEach((match) => {
        const notificationType = match.type === "lost" ? "success" : "info";
        const message =
          match.type === "lost"
            ? `Your ${
                match.itemName
              } has been found! Match confidence: ${Math.round(
                match.confidence
              )}%`
            : `The ${
                match.itemName
              } you found has been matched to its owner! Match confidence: ${Math.round(
                match.confidence
              )}%`;

        // Add notification without auto-removal timeout
        store.dispatch("notifications/add", {
          type: notificationType,
          message: message,
          itemId: match.itemId,
          matchedItemId: match.matchedItemId,
          confidence: match.confidence,
          isPersistent: true  // Flag to indicate notification should persist
        });
      });
    };

    // Start or stop polling based on user login state
    const updatePolling = () => {
      // Clear existing interval if any
      if (pollingIntervalId.value) {
        notifService.stopMatchPolling(pollingIntervalId.value);
        pollingIntervalId.value = null;
      }

      // If user is logged in, start polling
      if (user.value && user.value.id) {
        pollingIntervalId.value = notifService.startMatchPolling(
          handleNewMatches,
          user.value.id,
          30000 // Check every 30 seconds
        );
      }
    };

    // Watch for changes in user login state
    watch(
      () => user.value,
      () => {
        updatePolling();
      }
    );

    onMounted(() => {
      updatePolling();
    });

    onUnmounted(() => {
      if (pollingIntervalId.value) {
        notifService.stopMatchPolling(pollingIntervalId.value);
      }
    });

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