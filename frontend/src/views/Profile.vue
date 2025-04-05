<template>
  <div class="container">
    <div class="profile-container">
      <h1 class="profile-title">My Profile</h1>
      
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-placeholder">
              {{ userInitials }}
            </div>
          </div>
          <div class="profile-info">
            <h2 class="user-name">{{ user.full_name }}</h2>
            <p class="user-email">{{ user.email }}</p>
          </div>
        </div>
        
        <div class="tab-content">
          <!-- Personal Information Tab -->
          <div class="info-tab">
            <div v-if="isLoading" class="loading-indicator">
              <div class="spinner"></div>
              <p>Loading user information...</p>
            </div>
            
            <div v-else-if="error" class="error-message">
              {{ error }}
              <button @click="fetchUserDetails" class="btn btn-sm btn-primary mt-4">Retry</button>
            </div>
            
            <div v-else>
              <div class="profile-field">
                <label>Full Name</label>
                <div class="field-value">{{ userData.full_name }}</div>
              </div>
              
              <div class="profile-field">
                <label>Email</label>
                <div class="field-value">{{ userData.email }}</div>
              </div>
              
              <div class="profile-field">
                <label>Address</label>
                <div class="field-value">{{ userData.address }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
  name: 'ProfileView',
  setup() {
    const store = useStore();
    const isLoading = ref(false);
    const error = ref('');
    
    const user = computed(() => store.getters['auth/user'] || {});
    const userInitials = computed(() => {
      if (!user.value.full_name && !userData.value.full_name) return '';
      const name = userData.value.full_name || user.value.full_name || '';
      return name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase();
    });
    
    const userData = ref({
      full_name: '',
      email: '',
      address: ''
    });
    
    const fetchUserDetails = async () => {
      if (!user.value || !user.value.id) {
        error.value = 'User not authenticated';
        return;
      }
      
      isLoading.value = true;
      error.value = '';
      
      try {
        // Fetch user details from API
        const userId = user.value.id;
        const response = await axios.get(`http://localhost:8000/user/api/users/${userId}/address`);
        
        if (response.data && response.data.success) {
          const addressData = response.data.address;
          
          userData.value = {
            full_name: addressData.fullName || user.value.full_name || '',
            email: addressData.email || user.value.email || '',
            address: `${addressData.address.streetAddress}, ${addressData.address.unitNumber}, ${addressData.address.city}, ${addressData.address.postalCode}`
          };
        } else {
          // Fallback to data from store if API fails
          userData.value = {
            full_name: user.value.full_name || user.value.name || '',
            email: user.value.email || '',
            address: user.value.address || ''
          };
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        error.value = 'Failed to load user details';
        
        // Fallback to data from store
        userData.value = {
          full_name: user.value.full_name || user.value.name || '',
          email: user.value.email || '',
          address: user.value.address || ''
        };
      } finally {
        isLoading.value = false;
      }
    };
    
    onMounted(() => {
      fetchUserDetails();
    });

    return {
      user,
      userInitials,
      userData,
      isLoading,
      error,
      fetchUserDetails
    };
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
}

.profile-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #111827;
}

.profile-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.profile-avatar {
  margin-right: 1.5rem;
}

.avatar-placeholder {
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  background-color: #111827;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.user-name {
  margin: 0;
  font-size: 1.5rem;
  color: #111827;
}

.user-email {
  margin: 0.25rem 0 0;
  color: #6b7280;
}

.tab-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #111827;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #1f2937;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.mt-4 {
  margin-top: 1rem;
}

.profile-field {
  margin-bottom: 1.5rem;
}

.profile-field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.field-value {
  font-size: 1rem;
  color: #111827;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(17, 24, 39, 0.1);
  border-radius: 50%;
  border-top-color: #111827;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

.spinner-sm {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 1rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.field-hint {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

@media (max-width: 640px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>