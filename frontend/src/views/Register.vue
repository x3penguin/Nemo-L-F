<template>
  <div class="register-container">
    <div class="register-content">
      <div class="logo-container">
        <h1 class="logo-text">All-In-One</h1>
      </div>
      
      <div class="register-form">
        <h1 class="title">Create Account</h1>
        
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            placeholder="John Doe" 
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="name@example.com" 
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Password" 
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="passwordConfirm">Confirm Password</label>
          <input 
            type="password" 
            id="passwordConfirm" 
            v-model="passwordConfirm" 
            placeholder="Confirm Password" 
            class="form-control"
          />
        </div>
        
        <button @click="register" class="btn-register">Create Account</button>
        
        <div class="login-link">
          Already have an account?
          <router-link to="/login">Sign in</router-link>
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
  name: 'RegisterView',
  setup() {
    const router = useRouter();
    const store = useStore();
    
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const passwordConfirm = ref('');
    const error = ref('');
    
    const register = async () => {
      // Validate form
      if (!name.value || !email.value || !password.value || !passwordConfirm.value) {
        error.value = 'All fields are required';
        return;
      }
      
      if (password.value !== passwordConfirm.value) {
        error.value = 'Passwords do not match';
        return;
      }
      
      try {
        error.value = '';
        await store.dispatch('auth/register', {
          name: name.value,
          email: email.value,
          password: password.value
        });
        router.push('/login');
      } catch (err) {
        error.value = err.response?.data?.message || 'Registration failed';
      }
    };
    
    return {
      name,
      email,
      password,
      passwordConfirm,
      error,
      register
    };
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  min-height: 100vh;
  background-color: #f9f9f9;
}

.register-content {
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

.register-form {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 28rem;
  margin: 0 auto;
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

.btn-register {
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

.btn-register:hover {
  background-color: #1f2937;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #4b5563;
}

.login-link a {
  color: #111827;
  font-weight: 500;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
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

@media (max-width: 768px) {
  .register-content {
    flex-direction: column;
  }
  
  .logo-container {
    padding: 2rem 0;
  }
  
  .register-form {
    padding: 2rem 1rem;
  }
}
</style>