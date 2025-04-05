<template>
  <div class="container">
    <div class="item-detail-container">
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Loading item details...</p>
      </div>

      <div v-else-if="error" class="error-alert">
        <p>{{ error }}</p>
        <button @click="fetchItemDetails" class="btn btn-primary btn-sm">
          Try Again
        </button>
      </div>

      <div v-else-if="item" class="item-detail-card">
        <div class="item-header">
          <h1 class="item-title">{{ item.name }}</h1>
          <div
            class="item-status"
            :class="`status-${item.status.toLowerCase()}`"
          >
            {{ formatStatus(item.status) }}
          </div>
        </div>

        <div class="item-content">
          <div class="item-image-container">
            <img
              :src="item.imageUrl || '/img/placeholder-image.jpg'"
              :alt="item.name"
              @error="handleImageError"
              class="item-image"
            />
          </div>

          <div class="item-details">
            <div v-if="item.matchedItemId && matchedItem" class="match-info">
              <h2 class="section-title">Match Information</h2>
              <div class="match-badge">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Matched with {{ matchedItem.name }}</span>
              </div>

              <div class="match-details">
                <div class="detail-row">
                  <span class="detail-label">Match Confidence:</span>
                  <span class="detail-value"
                    >{{ Math.round(item.matchingConfidence || 0) }}%</span
                  >
                </div>

                <div class="detail-row">
                  <span class="detail-label">Matched Date:</span>
                  <span class="detail-value">{{
                    formatDate(item.matchedDate)
                  }}</span>
                </div>

                <button @click="viewMatchedItem" class="btn btn-primary mt-4">
                  View Matched Item
                </button>
              </div>
            </div>

            <div class="detail-section">
              <h2 class="section-title">Item Details</h2>

              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">{{ item.category }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span class="detail-value">{{ item.description }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">{{
                  formatStatus(item.status)
                }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">{{ item.location }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Date Reported:</span>
                <span class="detail-value">{{
                  formatDate(item.dateTime)
                }}</span>
              </div>

              <div v-if="hasCoordinates" class="map-section">
                <h3 class="subsection-title">Item Location</h3>
                <div ref="mapElement" class="map-container"></div>
                <div v-if="mapError" class="map-error">
                  <p>{{ mapError }}</p>
                  <button @click="initMap" class="btn btn-primary btn-sm mt-2">
                    Retry
                  </button>
                </div>
                <div v-if="mapLoading" class="map-loading">
                  <div class="spinner small"></div>
                  <span>Loading map...</span>
                </div>
              </div>
            </div>

            <div class="action-section">
              <router-link
                v-if="item.status === 'MATCHED'"
                :to="`/collection?itemId=${item.id}`"
                class="btn btn-primary"
              >
                Arrange Collection
              </router-link>

              <router-link
                v-if="sourceItemId"
                :to="`/items/${sourceItemId}?showMatches=true`"
                class="btn btn-secondary"
              >
                Back to Matches
              </router-link>
              <router-link v-else to="/" class="btn btn-secondary">
                Back to Home
              </router-link>
            </div>
            <div class="action-section" v-if="canEditItem">
              <button @click="editItem" class="btn btn-secondary">
                Edit Item
              </button>
              <button @click="confirmDelete" class="btn btn-danger ml-2">
                Delete Item
              </button>
            </div>
          </div>
        </div>

        <!-- Add potential matches carousel if query has showMatches=true and item is of status LOST -->
        <div
          v-if="shouldShowMatches && potentialMatches.length > 0"
          class="potential-matches-section"
        >
          <h2 class="section-title">Potential Matches</h2>
          <p class="section-description">
            These items might be a match for your lost item.
          </p>
          <ItemCarousel :items="potentialMatches" />
        </div>
        <div
          v-else-if="shouldShowMatches && isLoadingMatches"
          class="loading-matches"
        >
          <div class="spinner"></div>
          <p>Loading potential matches...</p>
        </div>
        <div
          v-else-if="
            shouldShowMatches &&
            potentialMatches.length === 0 &&
            !isLoadingMatches
          "
          class="no-matches"
        >
          <p>No potential matches found for this item.</p>
        </div>
      </div>
    </div>
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="edit-modal" @click.stop>
        <div class="modal-header">
          <h2>Edit Item</h2>
          <button class="close-button" @click="closeEditModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="itemName">Item Name *</label>
            <input
              type="text"
              id="itemName"
              v-model="editForm.name"
              class="form-control"
              :class="{ error: editErrors.name }"
            />
            <div v-if="editErrors.name" class="error-message">
              {{ editErrors.name }}
            </div>
          </div>

          <div class="form-group">
            <label for="itemCategory">Category *</label>
            <select
              id="itemCategory"
              v-model="editForm.category"
              class="form-control"
              :class="{ error: editErrors.category }"
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessories">Accessories</option>
              <option value="Documents">Documents</option>
              <option value="Keys">Keys</option>
              <option value="Other">Other</option>
            </select>
            <div v-if="editErrors.category" class="error-message">
              {{ editErrors.category }}
            </div>
          </div>

          <div class="form-group">
            <label for="itemDescription">Description *</label>
            <textarea
              id="itemDescription"
              v-model="editForm.description"
              class="form-control"
              :class="{ error: editErrors.description }"
              rows="4"
            ></textarea>
            <div v-if="editErrors.description" class="error-message">
              {{ editErrors.description }}
            </div>
          </div>

          <div class="form-group">
            <label for="itemVenue">Venue/Location *</label>
            <input
              type="text"
              id="itemVenue"
              v-model="editForm.venue"
              class="form-control"
              :class="{ error: editErrors.venue }"
            />
            <div v-if="editErrors.venue" class="error-message">
              {{ editErrors.venue }}
            </div>
          </div>

          <div class="form-group">
            <label for="specificLocation">Specific Location</label>
            <input
              type="text"
              id="specificLocation"
              v-model="editForm.specificLocation"
              class="form-control"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeEditModal" class="btn btn-secondary">
            Cancel
          </button>
          <button
            @click="saveItemChanges"
            class="btn btn-primary"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="spinner small"></span>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

// frontend/src/views/ItemDetail.vue - Focused fix for potential matches logic
<script>
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import itemService from "@/services/item.service";
import ItemCarousel from "@/components/ItemCarousel.vue";
import { getLoader } from "@/services/googleMapsLoader";
import store from "@/store";

export default {
  name: "ItemDetailView",
  components: {
    ItemCarousel,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const mapElement = ref(null);

    const item = ref(null);
    const matchedItem = ref(null);
    const potentialMatches = ref([]);
    const isLoading = ref(true);
    const isLoadingMatches = ref(false);
    const error = ref(null);

    // Map-specific state
    const mapLoading = ref(false);
    const mapLoaded = ref(false);
    const mapError = ref(null);
    const sourceItem = ref(null);
    let map = null;
    let marker = null;
    const selectedItem = ref(null);

    // Check if we came from a potential matches page
    const sourceItemId = computed(() => {
      return route.query.sourceId || "";
    });

    const canEditItem = computed(() => {
      if (!item.value) return false;

      // Only allow editing/deleting if:
      // 1. User is the reportOwner
      // 2. Item is not matched/collecting/retrieved
      const userId = store.getters["auth/user"]?.id;
      const itemStatus = item.value.status;

      return (
        item.value.reportOwner === userId &&
        !["MATCHED", "COLLECTING", "RETRIEVED"].includes(itemStatus)
      );
    });

    // Determine if we should show potential matches
    const shouldShowMatches = computed(() => {
      return (
        route.query.showMatches === "true" &&
        item.value &&
        item.value.status === "LOST"
      );
    });

    // Add a computed property to check if coordinates are valid
    const hasCoordinates = computed(() => {
      return (
        (item.value &&
          item.value.coordinates &&
          item.value.coordinates.lat &&
          item.value.coordinates.lng) ||
        (item.value && item.value.latitude && item.value.longitude)
      );
    });

    // Get coordinates helper function
    const getCoordinates = () => {
      if (!item.value) return null;

      let lat, lng;

      if (
        item.value.coordinates &&
        item.value.coordinates.lat &&
        item.value.coordinates.lng
      ) {
        lat = parseFloat(item.value.coordinates.lat);
        lng = parseFloat(item.value.coordinates.lng);
      } else if (item.value.latitude && item.value.longitude) {
        lat = parseFloat(item.value.latitude);
        lng = parseFloat(item.value.longitude);
      } else {
        return null;
      }

      // Verify coordinates are valid numbers
      if (isNaN(lat) || isNaN(lng)) {
        console.error("Invalid coordinates:", lat, lng);
        return null;
      }

      return { lat, lng };
    };

    const fetchItemDetails = async () => {
      const itemId = route.params.id;
      if (!itemId) {
        error.value = "No item ID provided";
        isLoading.value = false;
        return;
      }

      try {
        isLoading.value = true;
        error.value = null;


        const response = await itemService.getItemById(itemId);
        item.value = response.data;



        // If sourceId is provided, load it separately but don't display as main item
        if (route.query.sourceId) {
          try {
            const sourceResponse = await itemService.getItemById(
              route.query.sourceId
            );
            sourceItem.value = sourceResponse.data;

          } catch (err) {
            console.error("Error fetching source item:", err);
          }
        }

        // If the item is matched, fetch the matched item details
        if (item.value.matchedItemId) {
          try {
            const matchedResponse = await itemService.getItemById(
              item.value.matchedItemId
            );
            matchedItem.value = matchedResponse.data;
          } catch (err) {
            console.error("Error fetching matched item:", err);
            // Don't set an error here, it's not critical
          }
        }

        // If showMatches is true and the item is LOST, fetch potential matches
        if (shouldShowMatches.value) {
          fetchPotentialMatches(itemId);
        }
      } catch (err) {
        console.error("Error fetching item details:", err);
        error.value = "Could not load item details. Please try again.";
      } finally {
        isLoading.value = false;
      }
    };

    const fetchPotentialMatches = async (itemId) => {
      try {
        isLoadingMatches.value = true;
        const response = await itemService.getPotentialMatches(itemId);
        potentialMatches.value = response.data || [];

      } catch (err) {
        console.error("Error fetching potential matches:", err);
        // Don't set main error, just log it
      } finally {
        isLoadingMatches.value = false;
      }
    };

    const initMap = async () => {
      // Make sure the DOM element exists before trying to create the map
      if (!mapElement.value) {
        console.error("Map element ref not available");

        // Try again after a short delay to allow DOM to update
        setTimeout(() => {
          if (mapElement.value) {

            initMap();
          }
        }, 500);

        return;
      }

      if (!hasCoordinates.value) {
        console.error("Item has no valid coordinates");
        return;
      }

      try {
        // Reset map state
        mapError.value = null;
        mapLoading.value = true;

        // Get API key from environment
        const googleMapsApiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY;

        if (!googleMapsApiKey) {
          console.error(
            "Google Maps API key not found in environment variables"
          );
          mapError.value = "Map API key not configured";
          mapLoading.value = false;
          return;
        }



        // Load Google Maps API
        const loader = getLoader(googleMapsApiKey);
        await loader.load();

        // Check if Google Maps is loaded
        if (!window.google || !window.google.maps) {
          throw new Error("Google Maps failed to load");
        }



        // Get Map class - we'll use standard Marker instead of importing from library
        const { Map } = await window.google.maps.importLibrary("maps");

        // Get coordinates
        const coords = getCoordinates();
        if (!coords) {
          throw new Error("Could not determine coordinates");
        }



        // Create map
        map = new Map(mapElement.value, {
          center: coords,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Create marker using the standard Marker class
        marker = new window.google.maps.Marker({
          position: coords,
          map: map,
          title: item.value.name || "Item location",
        });

        // Store the marker in a variable so it's "used"
        if (!marker) {
          console.error("Failed to create marker");
          return;
        }

        mapLoaded.value = true;
        console.log(
          "Map initialized successfully with marker at:",
          marker.getPosition().toString()
        );

        // Add event listener to marker to show it's used
        marker.addListener("click", () => {

          // Optionally add some interaction with the marker
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>${item.value.name}</strong><p>${
              item.value.location || ""
            }</p></div>`,
          });
          infoWindow.open(map, marker);
        });
      } catch (err) {
        console.error("Error initializing map:", err);
        mapError.value =
          "Failed to load map: " + (err.message || "Unknown error");
        mapLoaded.value = false;
      } finally {
        mapLoading.value = false;
      }
    };

    const initGoogleMap = () => {
      nextTick(() => {
        if (mapElement.value) {
          initMap();
        } else {

          setTimeout(initGoogleMap, 100);
        }
      });
    };

    // Then call this in your relevant watchers
    watch(
      () => item.value,
      (newItem) => {
        if (newItem && hasCoordinates.value) {
          initGoogleMap();
        }
      }
    );

    const showEditModal = ref(false);

    const editForm = ref({
      name: "",
      category: "",
      description: "",
      venue: "",
      specificLocation: "",
    });
    const editErrors = ref({});
    const isSaving = ref(false);

    const editItem = () => {
      // Make sure selectedItem includes the ID from the route
      selectedItem.value = {
        ...item.value,
        id: route.params.id, // Ensure ID is included in the object
      };

      // Log for debugging


      // Populate form
      let venue = "";
      let specificLocation = "";

      if (item.value.location) {
        const locationParts = item.value.location.split(" | ");
        venue = locationParts[0] || "";
        specificLocation = locationParts.length > 1 ? locationParts[1] : "";
      }

      // Populate form
      editForm.value = {
        name: item.value.name || "",
        category: item.value.category || "",
        description: item.value.description || "",
        venue: venue,
        specificLocation: specificLocation,
      };

      // Show modal
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editErrors.value = {};
    };

    const validateEditForm = () => {
      editErrors.value = {};
      let isValid = true;

      if (!editForm.value.name) {
        editErrors.value.name = "Item name is required";
        isValid = false;
      }

      if (!editForm.value.category) {
        editErrors.value.category = "Category is required";
        isValid = false;
      }

      if (!editForm.value.description) {
        editErrors.value.description = "Description is required";
        isValid = false;
      } else if (editForm.value.description.length < 10) {
        editErrors.value.description =
          "Description should be at least 10 characters";
        isValid = false;
      }

      if (!editForm.value.venue) {
        editErrors.value.venue = "Venue/location is required";
        isValid = false;
      }

      return isValid;
    };

    const saveItemChanges = async () => {
      if (!validateEditForm()) return;

      isSaving.value = true;

      try {
        // Use the ID directly from selectedItem, as in Collection.vue
        const itemId = selectedItem.value.id;

        // Log for debugging


        // Prepare data
        const updateData = {
          name: editForm.value.name,
          category: editForm.value.category,
          description: editForm.value.description,
          venue: editForm.value.venue,
          specific_location: editForm.value.specificLocation,
          userId: store.getters["auth/user"]?.id || "1",
        };

        // Call API with the direct item ID from the selected item
        await itemService.updateItem(itemId, updateData);

        // Success notification
        store.dispatch("notifications/add", {
          message: "Item updated successfully",
          type: "success",
        });

        // Close and refresh
        closeEditModal();
        await fetchItemDetails();
      } catch (error) {
        console.error("Error updating item:", error);
        store.dispatch("notifications/add", {
          message:
            "Failed to update item: " +
            (error.response?.data?.error || error.message),
          type: "error",
        });
      } finally {
        isSaving.value = false;
      }
    };

    const confirmDelete = async () => {
      // if (!item.value || !item.value.id) {
      //   store.dispatch("notifications/add", {
      //     type: "error",
      //     message: "Item ID not found",
      //   });
      //   return;
      // }

      if (!confirm("Are you sure you want to delete this item?")) {
        return;
      }

      try {
        // Include user ID in request for permission check
        const userId = store.getters["auth/user"]?.id;

        // Make sure to use the correct item ID
        selectedItem.value = {
          ...item.value,
          id: route.params.id, // Ensure ID is included in the object
        };


        // Call the service with the item ID and user ID
        await itemService.deleteItem(selectedItem.value.id, { userId });

        // Show success notification
        store.dispatch("notifications/add", {
          type: "success",
          message: "Item deleted successfully",
        });

        if (window.refreshPotentialMatches) {
          window.refreshPotentialMatches();
        }
        router.push("/");
      } catch (error) {
        console.error("Error deleting item:", error);
        store.dispatch("notifications/add", {
          type: "error",
          message:
            "Failed to delete item: " +
            (error.response?.data?.error || error.message),
        });
      }
    };

    // Clean up map resources when component is unmounted
    onUnmounted(() => {
      if (map) {
        // Google Maps doesn't have explicit destroy methods, but we can
        // help garbage collection by removing references
        map = null;
        marker = null;
      }
    });

    // Watch for changes to coordinates and map element
    watch(
      [() => hasCoordinates.value, () => mapElement.value],
      ([hasCoords, mapEl]) => {
        console.log(
          "Watch triggered - hasCoordinates:",
          hasCoords,
          "mapElement exists:",
          !!mapEl
        );
        if (hasCoords && mapEl && !mapLoaded.value && !mapLoading.value) {

          initMap();
        }
      }
    );

    // Watch for changes to the query parameter
    watch(
      () => route.query.showMatches,
      (newShowMatches) => {
        if (
          newShowMatches === "true" &&
          item.value &&
          item.value.status === "LOST"
        ) {
          fetchPotentialMatches(item.value.id);
        }
      }
    );

    watch(
      () => route.params.id,
      (newId, oldId) => {
        if (newId !== oldId) {

          fetchItemDetails();
        }
      },
      { immediate: true }
    );

    const viewMatchedItem = () => {
      if (matchedItem.value && matchedItem.value.id) {
        router.push(`/items/${matchedItem.value.id}?sourceId=${item.value.id}`);
      }
    };

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
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // Handle regular date string
      const date = new Date(dateTime);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    onMounted(() => {
      fetchItemDetails();
      if (hasCoordinates.value) {
        initGoogleMap();
      }
    });

    return {
      item,
      matchedItem,
      potentialMatches,
      isLoading,
      isLoadingMatches,
      error,
      mapElement,
      sourceItemId,
      shouldShowMatches,
      hasCoordinates,
      mapLoading,
      mapLoaded,
      mapError,
      fetchItemDetails,
      viewMatchedItem,
      handleImageError,
      formatStatus,
      formatDate,
      initMap,
      sourceItem,
      canEditItem,
      editItem,
      confirmDelete,
      showEditModal,
      editForm,
      editErrors,
      isSaving,
      closeEditModal,
      saveItemChanges,
    };
  },
};
</script>

<style scoped>
.item-detail-container {
  max-width: 900px;
  margin: 2rem auto;
}

.loading-indicator,
.loading-matches {
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
  text-align: center;
  margin-bottom: 1rem;
}

.item-detail-card {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  font-size: 1.5rem;
  color: #111827;
  margin: 0;
}

.item-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
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

.item-content {
  display: flex;
  padding: 1.5rem;
}

.item-image-container {
  width: 300px;
  margin-right: 2rem;
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-details {
  flex: 1;
}

.match-info {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.match-badge {
  display: flex;
  align-items: center;
  color: #0284c7;
  font-weight: 500;
  margin-bottom: 1rem;
}

.match-badge svg {
  margin-right: 0.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  color: #111827;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.subsection-title {
  font-size: 1.125rem;
  color: #111827;
  margin: 1.5rem 0 1rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.detail-label {
  font-weight: 500;
  width: 40%;
  color: #6b7280;
}

.detail-value {
  width: 60%;
}

.map-container {
  height: 300px;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-top: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  background-color: #f3f4f6;
}

.map-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
  padding: 0.5rem;
}

.map-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.spinner.small {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(17, 24, 39, 0.1);
  border-top-color: #111827;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.action-section {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
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

.mt-4 {
  margin-top: 1rem;
}

/* Potential matches section */
.potential-matches-section {
  border-top: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.section-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.no-matches {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .item-content {
    flex-direction: column;
  }

  .item-image-container {
    width: 100%;
    margin-right: 0;
    margin-bottom: 1.5rem;
  }

  .action-section {
    flex-direction: column;
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-modal {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>
