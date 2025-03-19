<template>
  <nav class="navbar">
    <div class="container navbar-container">

      <router-link :to="isLoggedIn ? `/home/${user.id}` : '/'" class="navbar-logo">
        Nemo
      </router-link>
      <div class="navbar-links">
        <router-link :to="isLoggedIn ? `/home/${user.id}` : '/'" class="navbar-link">Home</router-link>
        <router-link to="/report-lost" class="navbar-link">Report Lost</router-link>
        <router-link to="/report-found" class="navbar-link">Report Found</router-link>
        <router-link to="/collections" class="navbar-link">Collections</router-link>
      </div>

      <div class="navbar-auth">
        <router-link v-if="!isLoggedIn" to="/login" class="login-btn">Login</router-link>
        <div v-else class="user-menu">
          <button @click="toggleDropdown" class="user-btn">
            {{ user.name }}
            <span class="dropdown-arrow">▼</span>
          </button>
          <div v-if="showDropdown" class="dropdown-menu">
            <router-link to="/profile" class="dropdown-item">Profile</router-link>
            <button @click="logout" class="dropdown-item logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'NavBar',
  setup() {
    const store = useStore();
    const router = useRouter();
    const showDropdown = ref(false);

    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn']);
    const user = computed(() => store.getters['auth/user']);

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const logout = async () => {
      await store.dispatch('auth/logout');
      router.push('/login');
    };

    return {
      isLoggedIn,
      user,
      showDropdown,
      toggleDropdown,
      logout
    };
  }
};
</script>

<style scoped>
.navbar {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.navbar-logo {
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
}

.navbar-link {
  color: #4b5563;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar-link:hover,
.navbar-link.router-link-active {
  color: #111827;
}

.navbar-auth {
  position: relative;
}

.login-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #111827;
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background-color: #1f2937;
}

.user-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #111827;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
}

.dropdown-arrow {
  font-size: 0.75rem;
  margin-left: 0.25rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 180px;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-top: 0.5rem;
  z-index: 10;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.logout-btn {
  color: #ef4444;
}

.logout-btn:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

@media (max-width: 768px) {
  .navbar-links {
    display: none;
  }
}
</style>