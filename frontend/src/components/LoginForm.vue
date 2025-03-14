<template>
    <div class="login-form-container">
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          placeholder="name@example.com" 
          class="form-control"
          @keyup.enter="login"
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
          @keyup.enter="login"
        />
      </div>
      
      <div class="remember-me">
        <label class="checkbox-container">
          <input type="checkbox" v-model="rememberMe">
          <span class="checkbox-label">Remember me</span>
        </label>
        <a href="#" class="forgot-password" @click.prevent="forgotPassword">Forgot password?</a>
      </div>
      
      <button 
        @click="login" 
        class="btn-sign-in"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
        Sign In
      </button>
      
      <div class="register-link">
        <slot name="register-link">
          Don't have an account? <router-link to="/register">Register</router-link>
        </slot>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'LoginForm',
    emits: ['login', 'forgot-password'],
    setup(props, { emit }) {
      const email = ref('');
      const password = ref('');
      const rememberMe = ref(false);
      const error = ref('');
      const isLoading = ref(false);
      
      const login = async () => {
        if (!email.value || !password.value) {
          error.value = 'Email and password are required';
          return;
        }
        
        isLoading.value = true;
        error.value = '';
        
        try {
          await emit('login', {
            email: email.value,
            password: password.value,
            rememberMe: rememberMe.value
          });
        } catch (err) {
          error.value = err.message || 'Login failed';
        } finally {
          isLoading.value = false;
        }
      };
      
      const forgotPassword = () => {
        emit('forgot-password', email.value);
      };
      
      return {
        email,
        password,
        rememberMe,
        error,
        isLoading,
        login,
        forgotPassword
      };
    }
  };
  </script>
  
  <style scoped>
  .login-form-container {
    width: 100%;
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
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .form-control:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    outline: none;
  }
  
  .remember-me {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .checkbox-container {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .checkbox-label {
    margin-left: 0.5rem;
    font-size: 0.875rem;
    color: #4b5563;
  }
  
  .forgot-password {
    font-size: 0.875rem;
    color: #111827;
    text-decoration: none;
  }
  
  .forgot-password:hover {
    text-decoration: underline;
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
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .btn-sign-in:hover {
    background-color: #1f2937;
  }
  
  .btn-sign-in:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .spinner-border {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 0.2em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-border 0.75s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes spinner-border {
    to { transform: rotate(360deg); }
  }
  
  .register-link {
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: #4b5563;
  }
  
  .register-link a {
    color: #111827;
    font-weight: 500;
    text-decoration: none;
  }
  
  .register-link a:hover {
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
  </style>