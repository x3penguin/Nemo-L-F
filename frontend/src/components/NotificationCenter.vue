<!-- Create a new component: NotificationCenter.vue -->
<template>
    <div class="notification-center">
      <div 
        v-for="notification in activeNotifications" 
        :key="notification.id"
        class="notification"
        :class="`notification-${notification.type}`"
      >
        <div class="notification-content">
          <div class="notification-icon">
            <svg v-if="notification.type === 'info'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <svg v-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
        </div>
        <button class="notification-close" @click="removeNotification(notification.id)">
          ×
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';
  
  export default {
    name: 'NotificationCenter',
    setup() {
      const store = useStore();
      
      const activeNotifications = computed(() => 
        store.getters['notifications/notifications']
      );
      
      const removeNotification = (id) => {
        store.dispatch('notifications/remove', id);
      };
      
      return {
        activeNotifications,
        removeNotification
      };
    }
  }
  </script>
  
  <style scoped>
  .notification-center {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .notification {
    min-width: 300px;
    max-width: 450px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    animation: slide-in 0.3s ease;
  }
  
  .notification-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  
  .notification-icon {
    flex-shrink: 0;
  }
  
  .notification-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #6b7280;
  }
  
  .notification-info {
    border-left: 4px solid #3b82f6;
  }
  
  .notification-success {
    border-left: 4px solid #10b981;
  }
  
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  </style>