<template>
  <div class="register-container">
    <div class="register-content">
      <div class="logo-container">
        <h1 class="logo-text">Nemo</h1>
      </div>

      <div class="register-form">
        <h1 class="title">Create Account</h1>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

      <!-- Two-column layout -->
      <div class="form-grid">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" v-model="name" placeholder="Jacob Milles" class="form-control" />
        </div>
        <div class="form-group">
          <label for="streetAddress">Street Address</label>
          <input type="text" id="streetAddress" v-model="streetAddress" placeholder="23 Bukit Merah St" class="form-control" />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="JacobMilles@gmail.com" class="form-control" />
        
        </div>
        <div class="form-group">
          <label for="city">City</label>
          <input type="text" id="city" v-model="city" placeholder="Singapore" class="form-control" />
        </div>
      
        

        <!-- Address Details -->
        
        
        <div class="form-group">
          <label for="phone">Phone</label>
          <input type="text" id="phone" v-model="phone" placeholder="82930191" class="form-control" />
        </div>
        <div class="form-group">
          <label for="postalCode">Postal Code</label>
          <input type="text" id="postalCode" v-model="postalCode" placeholder="081999" class="form-control" />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" placeholder="Password" class="form-control" />
        </div>
        <div class="form-group">
          <label for="unitNumber">Unit Number</label>
          <input type="text" id="unitNumber" v-model="unitNumber" placeholder="#15-01" class="form-control" />
        </div>
        <div class="form-group">
          <label for="passwordConfirm">Confirm Password</label>
          <input type="password" id="passwordConfirm" v-model="passwordConfirm" placeholder="Confirm Password"
            class="form-control" />
        </div>
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
import { ref,watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';


export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter();
    const store = useStore();

    const name = ref('');
    const email = ref('');
    const phone = ref('');
    const password = ref('');
    const passwordConfirm = ref('');
    const error = ref('');
    

    // Email validation regex
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      watch(email, (newEmail) => {
      if (!newEmail) {
        error.value = 'Email is required.';
      } else if (!emailPattern.test(newEmail)) {
        error.value = 'Invalid email format. Please enter a valid email.';
      } else {
       error.value = ''; // Clear error when valid
      }
    });
    const register = async () => {
      // Validate form
      if (!name.value || !email.value ||!phone.value|| !password.value || !passwordConfirm.value) {
        error.value = 'All fields are required';
        return;
      }

      if (password.value !== passwordConfirm.value) {
        error.value = 'Passwords do not match';
        return;
      }
      if (!emailPattern.test(email.value)) {
    error.value = 'Invalid email format. Please enter a valid email.';
    return;
  }


      try {
        error.value = '';
        const response= await store.dispatch('auth/register', {
          name: name.value,
          email: email.value,
          password: password.value,
          phone: phone.value,
        });
        console.log('User ID:', response.userId);
        localStorage.setItem("user", JSON.stringify({ name: response.name, userId: response.userId, token: response.token }));
        router.push(`/home/${response.userId}`);
      } catch (err) {
        error.value = err.response?.data?.message || 'Registration failed';
      }
    };

    return {
      name,
      email,
      phone,
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
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two equal-width columns */
  gap: 15px; /* Space between fields */
}

.form-group {
  display: flex;
  flex-direction: column;
}
.register-content {
  display: flex;
  flex: 1;}

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
  max-width: 35rem;
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
