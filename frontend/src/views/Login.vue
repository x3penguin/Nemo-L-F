<template>
  <div class="login-container">
    <div class="login-content">
      <div class="logo-container">
        <h1 class="logo-text">Nemo</h1>
      </div>

      <div class="login-form">
        <h1 class="title">Sign In To Nemo Portal</h1>
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="name@example.com" class="form-control" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" placeholder="Password" class="form-control" />
        </div>

        <button @click="login" class="btn-sign-in">Sign In</button>

        <div class="register-link">
          <router-link to="/register" class="btn-register">Register</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';


export default {
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const store = useStore(); 
    const email = ref('');
    const password = ref('');
    const error = ref('');

    const login = async () => {
      try {
        error.value = '';
        const userId = await store.dispatch('auth/login', { email: email.value, password: password.value });

        router.push(`/home/${userId}`);
      } catch (err) {
        if (err.response?.status === 401) {
        error.value = 'Incorrect email or password. Please try again.';
      } else {
        error.value = err.response?.data?.message || 'Login failed. Please try again later.';
    }
      }
    };

    return {
      email,
      password,
      error,
      login
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background-color: #f9f9f9;
}

.login-content {
  display: flex;
  flex: 1;
}

.logo-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
}

.logo-text {
  font-size: 3.5rem;
  font-weight: bold;
  color: #111827;
}

.login-form {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 28rem;
  margin: 0 auto;
}
.alert {
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
}

.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}


.title {
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
}

.btn-sign-in {
  width: 100%;
  padding: 0.75rem 1.25rem;
  background-color: #111827;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.btn-sign-in:hover {
  background-color: #1f2937;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
}

.btn-register {
  display: inline-block;
  width: 100%;
  padding: 0.75rem 1.25rem;
  background-color: white;
  color: #111827;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-register:hover {
  background-color: #f3f4f6;
}

@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
  }

  .logo-container {
    padding: 2rem 0;
  }

  .login-form {
    padding: 2rem 1rem;
  }
}
</style>