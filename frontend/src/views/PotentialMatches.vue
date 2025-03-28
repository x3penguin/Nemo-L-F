// frontend/src/views/PotentialMatches.vue
<template>
  <div class="container">
    <div class="matches-container">
      <h1 class="matches-title">
        {{
          itemId
            ? "Potential Matches for " + (sourceItem?.name || "Item")
            : "Potential Matches"
        }}
      </h1>

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

      <!-- When we have a specific item ID -->
      <div v-else-if="itemId" class="item-matches">
        <!-- Display source item information -->
        <div v-if="sourceItem" class="source-item-container">
          <div class="source-item-card">
            <div class="item-image">
              <img
                :src="sourceItem.imageUrl || '/img/placeholder-image.jpg'"
                :alt="sourceItem.name"
                @error="handleImageError"
              />
              <div
                class="item-status"
                :class="`status-${sourceItem.status.toLowerCase()}`"
              >
                {{ formatStatus(sourceItem.status) }}
              </div>
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ sourceItem.name }}</h3>
              <p class="item-category">{{ sourceItem.category }}</p>
              <p class="item-description">
                {{ truncateDescription(sourceItem.description) }}
              </p>
              <p class="item-location">Location: {{ sourceItem.location }}</p>
              <p class="item-date">{{ formatDate(sourceItem.dateTime) }}</p>
            </div>
          </div>
        </div>

        <!-- Display potential matches carousel -->
        <div v-if="matches.length > 0" class="matches-carousel-container">
          <h2 class="section-title">Potential Matches</h2>
          <ItemCarousel :items="matches" />
        </div>

        <div v-else class="empty-state">
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
          <p>There are currently no potential matches for this item.</p>
          <router-link to="/potential-matches" class="btn btn-primary"
            >All Items</router-link
          >
        </div>

        <div class="actions">
          <router-link to="/potential-matches" class="btn btn-secondary">
            Back to All Items
          </router-link>
        </div>
      </div>

      <!-- When displaying lost items (no specific itemId) -->
      <div v-else class="matches-content">
        <h2 class="section-title">Your Lost Items</h2>

        <div v-if="!matches.length" class="empty-state">
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
          <h2>No Lost Items</h2>
          <p>You don't have any lost items with potential matches.</p>
          <router-link to="/report-lost" class="btn btn-primary"
            >Report a Lost Item</router-link
          >
        </div>

        <div v-else class="items-grid">
          <div
            v-for="item in matches"
            :key="item.id"
            class="item-card"
            @click="viewItem(item)"
          >
            <div class="item-image">
              <img
                :src="item.imageUrl || '/img/placeholder-image.jpg'"
                :alt="item.name"
                @error="handleImageError"
              />
              <div
                class="item-status"
                :class="`status-${item.status.toLowerCase()}`"
              >
                {{ formatStatus(item.status) }}
              </div>
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-category">{{ item.category }}</p>
              <p class="item-description">
                {{ truncateDescription(item.description) }}
              </p>
              <p class="item-location">Location: {{ item.location }}</p>
              <p class="item-date">{{ formatDate(item.dateTime) }}</p>
            </div>
            <div class="item-actions">
              <button class="btn btn-primary" @click.stop="viewItem(item)">
                View Potential Matches
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import itemService from "@/services/item.service";
import ItemCarousel from "@/components/ItemCarousel.vue";
import { useStore } from "vuex";
import axios from "axios";

export default {
  name: "PotentialMatchesView",
  components: {
    ItemCarousel,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const matches = ref([]);
    const sourceItem = ref(null);
    const isLoading = ref(true);
    const error = ref(null);

    // Determine if we're looking at a specific item's matches
    const itemId = computed(() => route.params.id);

    const fetchMatches = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        if (itemId.value) {
          // If we have a specific item ID, fetch that item and its matches
          const sourceResponse = await itemService.getItemById(itemId.value);
          sourceItem.value = sourceResponse.data;

          // Then fetch potential matches for this specific item
          const matchesResponse = await itemService.getPotentialMatches(
            itemId.value
          );
          matches.value = matchesResponse.data || [];
        } else {
          // No itemId - show only lost items with potential matches
          const userId = store.getters["auth/user"]?.id;
          if (!userId) {
            error.value = "User not logged in";
            isLoading.value = false;
            return;
          }

          try {
            const response = await axios.get(
              `http://localhost:3004/api/users/${userId}/lost-items-with-matches`
            );
            matches.value = (response.data.items || []).filter(
              (item) =>
                // Only include items that have potential matches
                item.hasPotentialMatches === true
            );
          } catch (err) {
            console.error("Error fetching lost items with matches:", err);
            error.value = "Failed to load your items. Please try again.";
          }
        }
      } catch (err) {
        console.error("Error fetching potential matches:", err);
        error.value = "Failed to load potential matches. Please try again.";
      } finally {
        isLoading.value = false;
      }
    };

    // Watch for route parameter changes to reload data
    watch(
      () => route.params.id,
      (newId) => {
        if (newId !== undefined) {
          fetchMatches();
        }
      }
    );

    const handleImageError = (event) => {
      event.target.src = "/img/placeholder-image.jpg";
    };

    const formatStatus = (status) => {
      const statusMap = {
        LOST: "Lost",
        FOUND: "Found",
        MATCHED: "Matched",
        COLLECTING: "In Collection",
        RETRIEVED: "Retrieved",
      };

      return statusMap[status] || status;
    };

    const formatDate = (dateTime) => {
      if (!dateTime) return "N/A";

      // Handle Firebase timestamp
      if (dateTime.seconds) {
        const date = new Date(dateTime.seconds * 1000);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      // Handle regular date string
      const date = new Date(dateTime);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const truncateDescription = (description, maxLength = 100) => {
      if (!description) return "";
      if (description.length <= maxLength) return description;
      return description.substring(0, maxLength) + "...";
    };

    const viewItem = (item) => {
      // Navigate to the item detail page with potential matches
      router.push({
        name: "item-details",
        params: { id: item.id },
        query: { showMatches: "true" },
      });
    };

    onMounted(() => {
      fetchMatches();
    });

    return {
      matches,
      sourceItem,
      isLoading,
      error,
      itemId,
      fetchMatches,
      handleImageError,
      formatStatus,
      formatDate,
      truncateDescription,
      viewItem,
    };
  },
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

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.item-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  padding: 1.5rem;
}

.item-image {
  width: 200px;
  height: 200px;
  position: relative;
  flex-shrink: 0;
  margin-right: 1.5rem;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
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
  flex: 1;
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

.matches-carousel-container {
  margin-top: 2rem;
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
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>
