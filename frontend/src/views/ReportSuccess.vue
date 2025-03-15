<template>
    <div class="container">
      <div class="success-container">
        <div class="success-card">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 class="success-title">Report Submitted Successfully!</h1>
          
          <p class="success-message" v-if="reportType === 'lost'">
            Your lost item has been reported. We'll notify you if a matching item is found.
          </p>
          <p class="success-message" v-else-if="reportType === 'found'">
            Thank you for reporting a found item. We'll try to locate its owner.
          </p>
          
          <div class="success-actions">
            <router-link to="/" class="btn btn-primary">Go to Home</router-link>
            <router-link :to="reportType === 'lost' ? '/report-found' : '/report-lost'" class="btn btn-secondary">
              Report {{ reportType === 'lost' ? 'a Found' : 'a Lost' }} Item
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  
  export default {
    name: 'ReportSuccessView',
    setup() {
      const route = useRoute();
      
      const reportType = computed(() => {
        return route.query.type || 'lost';
      });
      
      return {
        reportType
      };
    }
  };
  </script>
  
  <style scoped>
  .success-container {
    max-width: 600px;
    margin: 4rem auto;
    text-align: center;
  }
  
  .success-card {
    background-color: white;
    border-radius: 0.5rem;
    padding: 3rem 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .success-icon {
    color: #10b981;
    margin-bottom: 1.5rem;
  }
  
  .success-title {
    font-size: 1.75rem;
    color: #111827;
    margin-bottom: 1rem;
  }
  
  .success-message {
    color: #4b5563;
    margin-bottom: 2rem;
  }
  
  .success-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-weight: 500;
    text-align: center;
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
  
  .btn-secondary {
    background-color: white;
    color: #111827;
    border: 1px solid #d1d5db;
  }
  
  .btn-secondary:hover {
    background-color: #f3f4f6;
  }
  
  @media (max-width: 640px) {
    .success-actions {
      flex-direction: column;
    }
  }
  </style>