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
        
        <div class="profile-tabs">
          <button 
            class="tab-button" 
            :class="{ 'active': activeTab === 'info' }"
            @click="activeTab = 'info'"
          >
            Personal Information
          </button>
          <button 
            class="tab-button" 
            :class="{ 'active': activeTab === 'items' }"
            @click="activeTab = 'items'"
          >
            My Items
          </button>
          <button 
            class="tab-button" 
            :class="{ 'active': activeTab === 'addresses' }"
            @click="activeTab = 'addresses'"
          >
            Addresses
          </button>
        </div>
        
        <div class="tab-content">
          <!-- Personal Information Tab -->
          <div v-if="activeTab === 'info'" class="info-tab">
            <div class="form-group">
              <label for="fullName">Full Name</label>
              <input type="text" id="fullName" v-model="userData.full_name" class="form-control">
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="userData.email" class="form-control">
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input type="tel" id="phone" v-model="userData.phone" class="form-control">
            </div>
            
            <div class="form-actions">
              <button @click="updateProfile" class="btn btn-primary">Update Profile</button>
            </div>
          </div>
          
          <!-- My Items Tab -->
          <div v-else-if="activeTab === 'items'" class="items-tab">
            <div class="tab-subtabs">
              <button 
                class="subtab-button" 
                :class="{ 'active': activeSubTab === 'lost' }"
                @click="activeSubTab = 'lost'"
              >
                Lost Items
              </button>
              <button 
                class="subtab-button" 
                :class="{ 'active': activeSubTab === 'found' }"
                @click="activeSubTab = 'found'"
              >
                Found Items
              </button>
              <button 
                class="subtab-button" 
                :class="{ 'active': activeSubTab === 'matched' }"
                @click="activeSubTab = 'matched'"
              >
                Matched Items
              </button>
            </div>
            
            <div v-if="isLoading" class="loading-spinner">
              <div class="spinner"></div>
              <p>Loading items...</p>
            </div>
            
            <div v-else-if="getItemsToShow.length === 0" class="empty-items">
              <p>No {{ activeSubTab }} items to display.</p>
              <router-link 
                :to="activeSubTab === 'found' ? '/report-found' : '/report-lost'" 
                class="btn btn-primary"
              >
                Report {{ activeSubTab === 'found' ? 'a Found' : 'a Lost' }} Item
              </router-link>
            </div>
            
            <div v-else class="items-grid">
              <!-- Items will go here -->
              <div v-for="item in getItemsToShow" :key="item.id" class="item-card">
                <div class="item-image">
                  <img :src="item.image_url || '/img/placeholder.jpg'" :alt="item.name">
                </div>
                <div class="item-details">
                  <h3>{{ item.name }}</h3>
                  <p>Status: {{ item.status }}</p>
                  <p>Reported: {{ formatDate(item.report_date) }}</p>
                </div>
                <div class="item-actions">
                  <button @click="viewItemDetails(item)" class="btn btn-secondary btn-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Addresses Tab -->
          <div v-else-if="activeTab === 'addresses'" class="addresses-tab">
            <button @click="showAddAddressForm = true" class="btn btn-primary mb-4">
              Add New Address
            </button>
            
            <div v-if="showAddAddressForm" class="address-form">
              <h3>Add New Address</h3>
              <div class="form-group">
                <label for="street">Street Address</label>
                <input type="text" id="street" v-model="newAddress.street_address" class="form-control">
              </div>
              
              <div class="form-group">
                <label for="unit">Unit Number</label>
                <input type="text" id="unit" v-model="newAddress.unit_number" class="form-control">
              </div>
              
              <div class="form-row">
                <div class="form-group col">
                  <label for="postal">Postal Code</label>
                  <input type="text" id="postal" v-model="newAddress.postal_code" class="form-control">
                </div>
                <div class="form-group col">
                  <label for="city">City</label>
                  <input type="text" id="city" v-model="newAddress.city" class="form-control">
                </div>
              </div>
              
              <div class="form-check">
                <input type="checkbox" id="isDefault" v-model="newAddress.is_default" class="form-check-input">
                <label for="isDefault" class="form-check-label">Set as default address</label>
              </div>
              
              <div class="form-actions">
                <button @click="addAddress" class="btn btn-primary">Save Address</button>
                <button @click="showAddAddressForm = false" class="btn btn-secondary">Cancel</button>
              </div>
            </div>
            
            <div v-if="addresses.length === 0 && !showAddAddressForm" class="empty-addresses">
              <p>You don't have any saved addresses yet.</p>
            </div>
            
            <div v-else class="addresses-list">
              <div v-for="address in addresses" :key="address.id" class="address-card">
                <div class="address-details">
                  <div class="address-header">
                    <h3>{{ formatAddress(address) }}</h3>
                    <span v-if="address.is_default" class="default-badge">Default</span>
                  </div>
                  <p>{{ address.street_address }}, {{ address.unit_number }}</p>
                  <p>{{ address.city }}, {{ address.postal_code }}</p>
                </div>
                <div class="address-actions">
                  <button v-if="!address.is_default" @click="setDefaultAddress(address)" class="btn btn-sm btn-outline">
                    Set as Default
                  </button>
                  <button @click="editAddress(address)" class="btn btn-sm btn-secondary">
                    Edit
                  </button>
                  <button @click="deleteAddress(address)" class="btn btn-sm btn-danger">
                    Delete
                  </button>
                </div>
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

export default {
  name: 'ProfileView',
  setup() {
    const store = useStore();
    const activeTab = ref('info');
    const activeSubTab = ref('lost');
    const isLoading = ref(false);
    
    const user = computed(() => store.getters['auth/user'] || {});
    const userInitials = computed(() => {
      if (!user.value.full_name) return '';
      return user.value.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase();
    });
    
    const userData = ref({
      full_name: '',
      email: '',
      phone: ''
    });
    
    const addresses = ref([]);
    const showAddAddressForm = ref(false);
    const newAddress = ref({
      street_address: '',
      unit_number: '',
      postal_code: '',
      city: '',
      is_default: false
    });
    
    const lostItems = ref([]);
    const foundItems = ref([]);
    const matchedItems = ref([]);
    
    const getItemsToShow = computed(() => {
      if (activeSubTab.value === 'lost') return lostItems.value;
      if (activeSubTab.value === 'found') return foundItems.value;
      if (activeSubTab.value === 'matched') return matchedItems.value;
      return [];
    });
    
    onMounted(async () => {
      // Initialize user data
      userData.value = {
        full_name: user.value.full_name || '',
        email: user.value.email || '',
        phone: user.value.phone || ''
      };
      
      await fetchUserAddresses();
      await fetchUserItems();
    });
    
    const fetchUserAddresses = async () => {
      try {
        // Replace with your API call
        // const response = await api.get('/users/addresses');
        // addresses.value = response.data;
        
        // Mock data for now
        addresses.value = [
          {
            id: 1,
            street_address: '123 Main St',
            unit_number: '#04-05',
            city: 'Singapore',
            postal_code: '123456',
            is_default: true
          },
          {
            id: 2,
            street_address: '456 Oak Avenue',
            unit_number: '#08-11',
            city: 'Singapore',
            postal_code: '654321',
            is_default: false
          }
        ];
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };
    
    const fetchUserItems = async () => {
      isLoading.value = true;
      try {
        // Replace with your API calls
        // const lostResponse = await api.get('/items/lost');
        // lostItems.value = lostResponse.data;
        
        // Mock data for now
        lostItems.value = [
          {
            id: 1,
            name: 'Black Wallet',
            status: 'LOST',
            report_date: '2023-03-15T08:30:00Z',
            image_url: null
          }
        ];
        
        foundItems.value = [
          {
            id: 2,
            name: 'Silver Watch',
            status: 'FOUND',
            report_date: '2023-03-20T14:15:00Z',
            image_url: null
          }
        ];
        
        matchedItems.value = [
          {
            id: 3,
            name: 'Blue Backpack',
            status: 'MATCHED',
            report_date: '2023-03-10T11:45:00Z',
            matched_date: '2023-03-12T09:20:00Z',
            image_url: null
          }
        ];
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    const updateProfile = async () => {
      try {
        // Replace with your API call
        // await api.put('/users/profile', userData.value);

        // Update the store
        // await store.dispatch('auth/updateProfile', userData.value);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    };
    
    const addAddress = async () => {
      try {
        // Replace with your API call
        // const response = await api.post('/users/addresses', newAddress.value);
        // addresses.value.push(response.data);
        
        // Mock for now
        const newId = addresses.value.length + 1;
        const address = { ...newAddress.value, id: newId };
        
        // If setting as default, update all other addresses
        if (address.is_default) {
          addresses.value.forEach(a => { a.is_default = false; });
        }
        
        addresses.value.push(address);
        showAddAddressForm.value = false;
        
        // Reset form
        newAddress.value = {
          street_address: '',
          unit_number: '',
          postal_code: '',
          city: '',
          is_default: false
        };
      } catch (error) {
        console.error('Error adding address:', error);
      }
    };
    
    const setDefaultAddress = async (address) => {
      try {
        // Replace with your API call
        // await api.put(`/users/addresses/${address.id}/default`);
        
        // Update locally
        addresses.value.forEach(a => { a.is_default = (a.id === address.id); });
      } catch (error) {
        console.error('Error setting default address:', error);
      }
    };
    
    const deleteAddress = async (address) => {
      try {
        // Replace with your API call
        // await api.delete(`/users/addresses/${address.id}`);
        
        // Remove locally
        addresses.value = addresses.value.filter(a => a.id !== address.id);
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    };
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    const formatAddress = (address) => {
      if (!address) return '';
      return `${address.unit_number}, ${address.street_address}`;
    };
    
    return {
      user,
      userInitials,
      activeTab,
      activeSubTab,
      userData,
      addresses,
      showAddAddressForm,
      newAddress,
      isLoading,
      getItemsToShow,
      updateProfile,
      addAddress,
      setDefaultAddress,
      deleteAddress,
      formatDate,
      formatAddress
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

.profile-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button.active {
  color: #111827;
  border-bottom-color: #111827;
}

.tab-content {
  padding: 1.5rem;
}

.tab-subtabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.subtab-button {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.subtab-button.active {
  color: #111827;
  border-bottom-color: #111827;
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

.form-row {
  display: flex;
  margin: 0 -0.5rem;
}

.form-row .form-group {
  flex: 1;
  padding: 0 0.5rem;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #111827;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #1f2937;
}

.btn-secondary {
  background-color: white;
  color: #111827;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f3f4f6;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-outline {
  background-color: white;
  color: #111827;
  border: 1px solid #d1d5db;
}

.mb-4 {
  margin-bottom: 1rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.item-card {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-image {
  height: 160px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  padding: 1rem;
}

.item-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
}

.item-details p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.item-actions {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.addresses-list {
  display: grid;
  gap: 1rem;
}

.address-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.address-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.default-badge {
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  background-color: #111827;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.address-details p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #111827;
  border-radius: 50%;
  animation: spinner 0.8s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spinner {
  to { transform: rotate(360deg); }
}

.empty-items, .empty-addresses {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.form-check {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-check-input {
  margin-right: 0.5rem;
}

.form-check-label {
  font-size: 0.875rem;
  display: inline;
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
  
  .profile-tabs {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1;
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .address-card {
    flex-direction: column;
  }
  
  .address-actions {
    margin-top: 1rem;
    justify-content: flex-start;
  }
}
</style>