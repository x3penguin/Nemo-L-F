<template>
    <div class="container">
      <div class="matches-container">
        <h1 class="matches-title">Potential Matches</h1>
        
        <div v-if="isLoading" class="loading-indicator">
          <div class="spinner"></div>
          <p>Loading potential matches...</p>
        </div>
  
        <div v-else-if="error" class="error-alert">
          <p>{{ error }}</p>
          <button @click="fetchMatches" class="btn btn-primary btn-sm">
            Try Again
          </button>
        </div>
  
        <div v-else-if="!matches.length" class="empty-state">
          <div class="empty-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2>No Potential Matches</h2>
          <p>
            There are currently no potential matches for your item.
          </p>
          <router-link to="/" class="btn btn-primary">Back to Home</router-link>
        </div>
  
        <div v-else class="matches-content">
          <div class="source-item-container" v-if="sourceItem">
            <h2 class="section-title">Your Item</h2>
            <div class="source-item-card">
              <div class="item-image">
                <img
                  :src="sourceItem.imageUrl || '/img/placeholder-image.jpg'"
                  alt="Your Item"
                  @error="handleImageError"
                />
                <div class="item-status" :class="`status-${sourceItem.status.toLowerCase()}`">
                  {{ formatStatus(sourceItem.status) }}
                </div>
              </div>
              <div class="item-details">
                <h3 class="item-name">{{ sourceItem.name }}</h3>
                <p class="item-category">{{ sourceItem.category }}</p>
                <p class="item-description">{{ truncateDescription(sourceItem.description) }}</p>
                <p class="item-location">Location: {{ sourceItem.location }}</p>
                <p class="item-date">{{ formatDate(sourceItem.dateTime) }}</p>
              </div>
            </div>
          </div>
  
          <div class="matches-list-container">
            <h2 class="section-title">Potential Matches</h2>
            <div class="matches-grid">
              <div
                v-for="match in matches"
                :key="match.id"
                class="match-card"
                @click="viewMatchDetails(match)"
              >
                <div class="match-image">
                  <img
                    :src="match.imageUrl || '/img/placeholder-image.jpg'"
                    :alt="match.name"
                    @error="handleImageError"
                  />
                  <div class="match-confidence">
                    {{ Math.round(match.confidence) }}% Match
                  </div>
                </div>
                <div class="match-details">
                  <h3 class="match-name">{{ match.name }}</h3>
                  <p class="match-category">{{ match.category }}</p>
                  <p class="match-description">{{ truncateDescription(match.description) }}</p>
                  <p class="match-location">Location: {{ match.location }}</p>
                  <p class="match-date">{{ formatDate(match.dateTime) }}</p>
                  <div class="match-distance" v-if="match.distance">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {{ formatDistance(match.distance) }} away
                  </div>
                </div>
                <div class="match-actions">
                  <button class="btn btn-primary btn-sm">View Details</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import itemService from '@/services/item.service';
  
  export default {
    name: 'PotentialMatchesView',
    setup() {
      const route = useRoute();
      const router = useRouter();
      const matches = ref([]);
      const sourceItem = ref(null);
      const isLoading = ref(true);
      const error = ref(null);
  
      const fetchMatches = async () => {
        const itemId = route.params.id;
        if (!itemId) {
          error.value = 'No item ID provided';
          isLoading.value = false;
          return;
        }
  
        try {
          isLoading.value = true;
          error.value = null;
  
          // Fetch the source item first
          const sourceResponse = await itemService.getItemById(itemId);
          sourceItem.value = sourceResponse.data;
  
          // Then fetch potential matches
          const matchesResponse = await itemService.getPotentialMatches(itemId);
          matches.value = matchesResponse.data || [];
        } catch (err) {
          console.error('Error fetching potential matches:', err);
          error.value = 'Failed to load potential matches. Please try again.';
        } finally {
          isLoading.value = false;
        }
      };
  
      const viewMatchDetails = (match) => {
        router.push(`/items/${match.id}`);
      };
  
      const handleImageError = (event) => {
        event.target.src = '/img/placeholder-image.jpg';
      };
  
      const formatStatus = (status) => {
        const statusMap = {
          'LOST': 'Lost',
          'FOUND': 'Found',
          'MATCHED': 'Matched',
          'COLLECTING': 'In Collection',
          'RETRIEVED': 'Retrieved'
        };
        
        return statusMap[status] || status;
      };
  
      const formatDate = (dateTime) => {
        if (!dateTime) return 'N/A';
        
        // Handle Firebase timestamp
        if (dateTime.seconds) {
          const date = new Date(dateTime.seconds * 1000);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        
        // Handle regular date string
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      };
  
      const formatDistance = (distance) => {
        if (distance < 1) {
          return `${(distance * 1000).toFixed(0)} m`;
        }
        return `${distance.toFixed(1)} km`;
      };
  
      const truncateDescription = (description, maxLength = 100) => {
        if (!description) return '';
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength) + '...';
      };
  
      onMounted(() => {
        fetchMatches();
      });
  
      return {
        matches,
        sourceItem,
        isLoading,
        error,
        fetchMatches,
        viewMatchDetails,
        handleImageError,
        formatStatus,
        formatDate,
        formatDistance,
        truncateDescription
      };
    }
  };
  </script>
  
  <style scoped>
  .matches-container {
    max-width: 1000px;
    margin: 2rem auto;
  }
  
  .matches-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #111827;
  }
  
  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
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
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .error-alert {
    background-color: #fee2e2;
    color: #dc2626;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .empty-icon {
    color: #10b981;
    margin-bottom: 1.5rem;
  }
  
  .empty-state h2 {
    font-size: 1.5rem;
    color: #111827;
    margin-bottom: 0.5rem;
  }
  
  .empty-state p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
    color: #111827;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .source-item-container {
    margin-bottom: 2rem;
  }
  
  .source-item-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    overflow: hidden;
  }
  
  .item-image {
    width: 200px;
    height: 200px;
    position: relative;
    flex-shrink: 0;
  }
  
  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .item-status {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
  }
  
  .status-lost {
    background-color: #ef4444;
  }
  
  .status-found {
    background-color: #10b981;
  }
  
  .status-matched {
    background-color: #3b82f6;
  }
  
  .status-collecting {
    background-color: #f59e0b;
  }
  
  .status-retrieved {
    background-color: #6b7280;
  }
  
  .item-details {
    padding: 1.5rem;
  }
  
  .item-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }
  
  .item-category {
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
  
  .item-description {
    color: #4b5563;
    margin-bottom: 1rem;
  }
  
  .item-location,
  .item-date {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
  
  .matches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .match-card {
    background-color: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  
  .match-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .match-image {
    height: 200px;
    position: relative;
  }
  
  .match-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .match-confidence {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #111827;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .match-details {
    padding: 1.5rem;
  }
  
  .match-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }
  
  .match-category {
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
  
  .match-description {
    color: #4b5563;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  
  .match-location,
  .match-date {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
  
  .match-distance {
    display: flex;
    align-items: center;
    color: #3b82f6;
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 0.5rem;
  }
  
  .match-distance svg {
    margin-right: 0.25rem;
  }
  
  .match-actions {
    padding: 0 1.5rem 1.5rem;
  }
  
  .btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    text-align: center;
    transition: all 0.2s;
    cursor: pointer;
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
  
  .btn-sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }
  
  @media (max-width: 768px) {
    .source-item-card {
      flex-direction: column;
    }
    
    .item-image {
      width: 100%;
    }
  }
  </style>