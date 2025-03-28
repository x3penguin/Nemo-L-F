<template>
  <div class="container">
    <div class="collection-container">
      <h1 class="collection-title">Item Collection</h1>

      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Loading your matched items...</p>
      </div>

      <div v-else-if="error" class="error-alert">
        <p>{{ error }}</p>
        <button @click="fetchMatchedItems" class="btn btn-primary btn-sm">
          Try Again
        </button>
      </div>

      <div v-else-if="!matchedItems.length" class="empty-state">
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h2>No Matched Items Yet</h2>
        <p>
          When one of your lost items is found and matched, it will appear here
          for collection.
        </p>
        <router-link to="/report-lost" class="btn btn-primary"
          >Report a Lost Item</router-link
        >
      </div>

      <div v-else class="collection-content">
        <div class="collection-filters">
          <div class="search-bar">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search by item name..."
              class="form-control"
            />
          </div>
          <div class="filter-options">
            <select v-model="statusFilter" class="form-control">
              <option value="all">All Statuses</option>
              <option value="MATCHED">Matched</option>
              <option value="COLLECTING">In Collection</option>
              <option value="RETRIEVED">Retrieved</option>
            </select>
          </div>
        </div>

        <div class="matched-items">
          <ItemCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            @click="viewItemDetails(item)"
          >
            <template #actions>
              <button
                @click.stop="initiateCollection(item)"
                class="btn btn-primary"
              >
                Arrange Collection
              </button>
            </template>
          </ItemCard>
        </div>
      </div>
    </div>

    <!-- Collection Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button class="close-button" @click="closeModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Initiate Collection Form -->
          <div v-if="modalType === 'initiate'" class="collection-form">
            <p class="modal-description">
              Please select how you would like to collect your item:
            </p>

            <div class="collection-methods">
              <div
                class="collection-method"
                :class="{ selected: collectionMethod === 'SELF_PICKUP' }"
                @click="collectionMethod = 'SELF_PICKUP'"
              >
                <div class="method-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <h3>Self Pickup</h3>
                <p>Collect the item yourself from the designated location</p>
                <span
                  v-if="collectionMethod === 'SELF_PICKUP'"
                  class="selected-badge"
                  >Selected</span
                >
              </div>

              <div
                class="collection-method"
                :class="{ selected: collectionMethod === 'COURIER' }"
                @click="collectionMethod = 'COURIER'"
              >
                <div class="method-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                    />
                  </svg>
                </div>
                <h3>Courier Delivery</h3>
                <p>Have the item delivered to your address (fees apply)</p>
                <span
                  v-if="collectionMethod === 'COURIER'"
                  class="selected-badge"
                  >Selected</span
                >
              </div>
            </div>

            <div v-if="collectionMethod === 'COURIER'" class="delivery-form">
              <h3>Delivery Address</h3>

              <div v-if="savedAddresses.length > 0">
                <div class="saved-addresses">
                  <div
                    v-for="address in savedAddresses"
                    :key="address.id"
                    class="saved-address"
                    :class="{
                      selected:
                        selectedAddress && selectedAddress.id === address.id,
                    }"
                    @click="selectAddress(address)"
                  >
                    <div class="address-details">
                      <h4 class="address-name">
                        {{ formatAddressName(address) }}
                      </h4>
                      <p class="address-line">
                        {{ formatAddressLine(address) }}
                      </p>
                      <span v-if="address.is_default" class="default-badge"
                        >Default</span
                      >
                    </div>
                    <div class="address-selection">
                      <div
                        class="radio-button"
                        :class="{
                          selected:
                            selectedAddress &&
                            selectedAddress.id === address.id,
                        }"
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  @click="showNewAddressForm = true"
                  class="btn btn-secondary btn-small"
                  v-if="!showNewAddressForm"
                >
                  + Add New Address
                </button>
              </div>

              <div
                v-if="showNewAddressForm || savedAddresses.length === 0"
                class="new-address-form"
              >
                <div v-if="savedAddresses.length > 0" class="form-header">
                  <h4>New Address</h4>
                  <button
                    @click="showNewAddressForm = false"
                    class="btn btn-text"
                  >
                    Cancel
                  </button>
                </div>

                <div class="form-group">
                  <label for="street">Street Address *</label>
                  <input
                    type="text"
                    id="street"
                    v-model="newAddress.street_address"
                    class="form-control"
                    :class="{ error: addressErrors.street_address }"
                  />
                  <div
                    v-if="addressErrors.street_address"
                    class="error-message"
                  >
                    {{ addressErrors.street_address }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="unit">Unit Number *</label>
                  <input
                    type="text"
                    id="unit"
                    v-model="newAddress.unit_number"
                    class="form-control"
                    :class="{ error: addressErrors.unit_number }"
                  />
                  <div v-if="addressErrors.unit_number" class="error-message">
                    {{ addressErrors.unit_number }}
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group half">
                    <label for="postal">Postal Code *</label>
                    <input
                      type="text"
                      id="postal"
                      v-model="newAddress.postal_code"
                      class="form-control"
                      :class="{ error: addressErrors.postal_code }"
                    />
                    <div v-if="addressErrors.postal_code" class="error-message">
                      {{ addressErrors.postal_code }}
                    </div>
                  </div>

                  <div class="form-group half">
                    <label for="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      v-model="newAddress.city"
                      class="form-control"
                      :class="{ error: addressErrors.city }"
                    />
                    <div v-if="addressErrors.city" class="error-message">
                      {{ addressErrors.city }}
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="phone">Contact Phone *</label>
                  <input
                    type="text"
                    id="phone"
                    v-model="newAddress.phone"
                    class="form-control"
                    :class="{ error: addressErrors.phone }"
                  />
                  <div v-if="addressErrors.phone" class="error-message">
                    {{ addressErrors.phone }}
                  </div>
                </div>

                <div class="form-check">
                  <input
                    type="checkbox"
                    id="default"
                    v-model="newAddress.is_default"
                  />
                  <label for="default" class="check-label"
                    >Set as default address</label
                  >
                </div>

                <button @click="saveAddress" class="btn btn-primary btn-small">
                  Save Address
                </button>
              </div>
            </div>

            <div v-if="collectionError" class="alert alert-danger">
              {{ collectionError }}
            </div>
          </div>

          <!-- View Collection Details -->
          <div v-else-if="modalType === 'details'" class="collection-details">
            <div class="item-summary">
              <div class="item-image">
                <img
                  :src="selectedItem.image_url || '/img/placeholder-image.jpg'"
                  :alt="selectedItem.name"
                />
              </div>
              <div class="item-info">
                <h3>{{ selectedItem.name }}</h3>
                <p><strong>Category:</strong> {{ selectedItem.category }}</p>
                <p>
                  <strong>Status:</strong>
                  <span
                    class="status-badge"
                    :class="'status-' + selectedItem.status.toLowerCase()"
                    >{{ formatStatus(selectedItem.status) }}</span
                  >
                </p>
              </div>
            </div>

            <div class="collection-info">
              <h3>Collection Details</h3>

              <div class="detail-row">
                <span class="detail-label">Collection Method:</span>
                <span class="detail-value">{{
                  formatCollectionMethod(collectionDetails.type)
                }}</span>
              </div>

              <div
                v-if="collectionDetails.type === 'SELF_PICKUP'"
                class="pickup-details"
              >
                <div class="detail-row">
                  <span class="detail-label">Pickup Location:</span>
                  <span class="detail-value">{{
                    collectionDetails.pickup_venue
                  }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">{{
                    collectionDetails.pickup_address || "Not specified"
                  }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Available From:</span>
                  <span class="detail-value">{{
                    formatDate(collectionDetails.pickup_start)
                  }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Available Until:</span>
                  <span class="detail-value">{{
                    formatDate(collectionDetails.pickup_end)
                  }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Instructions:</span>
                  <span class="detail-value">{{
                    collectionDetails.pickup_instructions ||
                    "No special instructions"
                  }}</span>
                </div>

                <div class="map-container">
                  <div class="map-placeholder">
                    <div class="map-pin"></div>
                    <p>Map view would appear here<br />using Google Maps API</p>
                  </div>
                </div>
              </div>

              <div
                v-else-if="collectionDetails.type === 'COURIER'"
                class="courier-details"
              >
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span
                    class="detail-value status-badge"
                    :class="
                      'delivery-' + collectionDetails.status.toLowerCase()
                    "
                    >{{ formatDeliveryStatus(collectionDetails.status) }}</span
                  >
                </div>

                <div class="detail-row">
                  <span class="detail-label">Delivery Address:</span>
                  <span class="detail-value">{{
                    formatFullAddress(collectionDetails)
                  }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Estimated Delivery:</span>
                  <span class="detail-value">{{
                    formatDate(collectionDetails.estimated_delivery)
                  }}</span>
                </div>

                <div
                  v-if="collectionDetails.courier_provider"
                  class="detail-row"
                >
                  <span class="detail-label">Courier:</span>
                  <span class="detail-value">{{
                    collectionDetails.courier_provider
                  }}</span>
                </div>

                <div v-if="collectionDetails.tracking_id" class="detail-row">
                  <span class="detail-label">Tracking ID:</span>
                  <span class="detail-value">{{
                    collectionDetails.tracking_id
                  }}</span>
                </div>

                <div class="delivery-progress">
                  <div
                    class="progress-step"
                    :class="{ active: isDeliveryStepActive('PAID') }"
                  >
                    <div class="step-dot"></div>
                    <div class="step-label">Payment Confirmed</div>
                    <div
                      class="step-time"
                      v-if="collectionDetails.payment_time"
                    >
                      {{ formatTime(collectionDetails.payment_time) }}
                    </div>
                  </div>

                  <div
                    class="progress-line"
                    :class="{ active: isDeliveryStepActive('IN_PROGRESS') }"
                  ></div>

                  <div
                    class="progress-step"
                    :class="{ active: isDeliveryStepActive('IN_PROGRESS') }"
                  >
                    <div class="step-dot"></div>
                    <div class="step-label">Pickup Scheduled</div>
                    <div class="step-time" v-if="collectionDetails.pickup_time">
                      {{ formatTime(collectionDetails.pickup_time) }}
                    </div>
                  </div>

                  <div
                    class="progress-line"
                    :class="{ active: isDeliveryStepActive('COMPLETED') }"
                  ></div>

                  <div
                    class="progress-step"
                    :class="{ active: isDeliveryStepActive('COMPLETED') }"
                  >
                    <div class="step-dot"></div>
                    <div class="step-label">Delivered</div>
                    <div
                      class="step-time"
                      v-if="collectionDetails.delivery_time"
                    >
                      {{ formatTime(collectionDetails.delivery_time) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <div v-else-if="modalType === 'payment'" class="payment-form">
            <div class="payment-summary">
              <h3>Delivery Fee</h3>
              <div class="fee-details">
                <div class="fee-row">
                  <span>Base Delivery Fee</span>
                  <span>${{ (paymentDetails.base_fee || 0).toFixed(2) }}</span>
                </div>
                <div class="fee-row">
                  <span>Distance Fee</span>
                  <span
                    >${{ (paymentDetails.distance_fee || 0).toFixed(2) }}</span
                  >
                </div>
                <div v-if="paymentDetails.surcharge" class="fee-row">
                  <span>Surcharge</span>
                  <span>${{ (paymentDetails.surcharge || 0).toFixed(2) }}</span>
                </div>
                <div class="fee-row total">
                  <span>Total</span>
                  <span>${{ (paymentDetails.total || 0).toFixed(2) }}</span>
                </div>
              </div>

              <p class="payment-description">
                Click the button below to proceed to our secure payment gateway.
                Once payment is completed, your delivery will be scheduled.
              </p>

              <div class="payment-buttons">
                <button
                  @click="processPayment"
                  class="btn btn-primary btn-large"
                >
                  <span v-if="isProcessingPayment" class="spinner small"></span>
                  Proceed to Payment
                </button>
                <button @click="closeModal" class="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="modalType === 'initiate'" class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button
            @click="submitCollectionRequest"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner small"></span>
            Submit Request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import itemService from "@/services/item.service";
import ItemCard from "@/components/ItemCard.vue";
import { useStore } from "vuex";
export default {
  name: "CollectionView",
  components: {
    ItemCard,
  },
  setup() {
    const store = useStore();
    const activeSubTab = ref("lost");

    const getItemsToShow = computed(() => {
      // User ID from store
      const userId = store.getters["auth/user"]?.id;

      if (!userId) return [];

      // Filter based on active subtab
      let filteredItems = [];

      if (activeSubTab.value === "lost") {
        // Show matched items where user is the owner AND reportType is LOST
        filteredItems = matchedItems.value.filter(
          (item) =>
            item.ownerId === userId &&
            item.status.toUpperCase() === "MATCHED" &&
            item.reportType === "LOST"
        );
      } else if (activeSubTab.value === "found") {
        // Show matched items where user is the finder AND reportType is FOUND
        filteredItems = matchedItems.value.filter(
          (item) =>
            item.finderId === userId &&
            item.status.toUpperCase() === "MATCHED" &&
            item.reportType === "FOUND"
        );
      } else if (activeSubTab.value === "matched") {
        // Show items in collection or retrieval process
        filteredItems = matchedItems.value.filter(
          (item) =>
            (item.ownerId === userId || item.finderId === userId) &&
            (item.status.toUpperCase() === "COLLECTING" ||
              item.status.toUpperCase() === "RETRIEVED")
        );
      }

      return filteredItems;
    });

    const viewItemDetails = (item) => {
      selectedItem.value = item;
      modalType.value = "details";
      showModal.value = true;

      // If you have a function to fetch collection details, call it here
      if (item.status === "COLLECTING" || item.status === "MATCHED") {
        fetchCollectionDetails(item.id);
      }
    };
    async function fetchMatchedItems() {
      isLoading.value = true;
      error.value = null;

      try {
        const userId = store.getters["auth/user"]?.id || 1;

        const [matchedResponse, collectingResponse, retrievedResponse] =
          await Promise.all([
            itemService.getMatchedItems(),
            itemService.getCollectingItems(),
            itemService.getRetrievedItems(),
          ]);

        // Combine items but avoid duplicates by using both ID and reportType for filtering
        let allItems = [
          ...matchedResponse.data,
          ...collectingResponse.data,
          ...retrievedResponse.data,
        ].filter((item) => item.ownerId === userId || item.finderId === userId);

        // Use a Map with a composite key of id+reportType to ensure uniqueness
        const uniqueItemsMap = new Map();

        for (const item of allItems) {
          // Create a unique key combining the item ID and report type
          const key = `${item.id}-${item.reportType || "UNKNOWN"}`;

          // Only add if this combination doesn't exist yet
          if (!uniqueItemsMap.has(key)) {
            uniqueItemsMap.set(key, item);
          }
        }

        // Convert back to array
        matchedItems.value = Array.from(uniqueItemsMap.values());
        console.log("Items fetched:", matchedItems.value);
      } catch (err) {
        console.error("Error fetching items:", err);
        error.value = "Failed to load your items. Please try again.";
      } finally {
        isLoading.value = false;
      }
    }

    const fetchItems = async () => {
      try {
        const response = await itemService.getLostItems();
        matchedItems.value = response.data;
        console.log("Items fetched:", response.data);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    const handleImageError = (event) => {
      // Fallback to placeholder if image fails to load
      event.target.src = "/img/placeholder-image.jpg";
    };

    const isLoading = ref(false);
    const error = ref(null);
    const matchedItems = ref([]);
    const searchQuery = ref("");
    const statusFilter = ref("all");

    // Modal state
    const showModal = ref(false);
    const modalType = ref("initiate"); // 'initiate', 'details', 'payment'
    const selectedItem = ref(null);
    const collectionMethod = ref("SELF_PICKUP");
    const collectionDetails = ref({});
    const collectionError = ref(null);
    const isSubmitting = ref(false);
    const isProcessingPayment = ref(false);

    // Address state
    const savedAddresses = ref([]);
    const selectedAddress = ref(null);
    const showNewAddressForm = ref(false);
    const newAddress = ref({
      street_address: "",
      unit_number: "",
      postal_code: "",
      city: "",
      phone: "",
      is_default: false,
    });
    const addressErrors = ref({});

    // Payment state
    const paymentDetails = ref({
      base_fee: 5.0,
      distance_fee: 3.5,
      surcharge: 0,
      total: 8.5,
    });

    const fetchSavedAddresses = async () => {
      try {
        // In a real application, this would be an API call
        // For now, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 500));

        savedAddresses.value = [
          {
            id: 1,
            street_address: "123 Main Street",
            unit_number: "#04-05",
            postal_code: "123456",
            city: "Singapore",
            phone: "+65 9123 4567",
            is_default: true,
          },
          {
            id: 2,
            street_address: "456 Orchard Road",
            unit_number: "#12-34",
            postal_code: "654321",
            city: "Singapore",
            phone: "+65 8765 4321",
            is_default: false,
          },
        ];

        // Select default address if available
        const defaultAddress = savedAddresses.value.find(
          (addr) => addr.is_default
        );
        if (defaultAddress) {
          selectedAddress.value = defaultAddress;
        }
      } catch (err) {
        console.error("Error fetching saved addresses:", err);
      }
    };

    const fetchCollectionDetails = async (itemId) => {
      try {
        // Show loading state
        collectionError.value = null;

        // Call your backend API to get collection details
        const response = await fetch(`/api/items/${itemId}/collection`);

        if (!response.ok) {
          throw new Error("Failed to fetch collection details");
        }

        // Update the collection details
        collectionDetails.value = await response.json();
      } catch (err) {
        console.error("Error fetching collection details:", err);
        collectionError.value =
          "Failed to load collection details. Please try again.";
      }
    };

    onMounted(() => {
      fetchMatchedItems();
      fetchSavedAddresses();
    });

    const filteredItems = computed(() => {
      let items = [...matchedItems.value];

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
      }

      // Filter by status
      if (statusFilter.value !== "all") {
        items = items.filter((item) => item.status === statusFilter.value);
      }

      return items;
    });

    const modalTitle = computed(() => {
      if (modalType.value === "initiate") {
        return "Arrange Collection";
      } else if (modalType.value === "details") {
        return "Collection Details";
      } else if (modalType.value === "payment") {
        return "Payment";
      }
      return "";
    });

    const formatStatus = (status) => {
      const statusMap = {
        MATCHED: "Matched",
        COLLECTING: "In Collection",
        RETRIEVED: "Retrieved",
      };
      return statusMap[status] || status;
    };

    const formatTime = (dateStr) => {
      if (!dateStr) return "";

      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatCollectionMethod = (type) => {
      const typeMap = {
        SELF_PICKUP: "Self Pickup",
        COURIER: "Courier Delivery",
      };
      return typeMap[type] || type;
    };

    const formatDeliveryStatus = (status) => {
      const statusMap = {
        SCHEDULED: "Scheduled",
        PAID: "Payment Confirmed",
        IN_PROGRESS: "In Progress",
        COMPLETED: "Delivered",
      };
      return statusMap[status] || status;
    };

    const formatAddressName = (address) => {
      return `${address.unit_number}, ${address.street_address}`;
    };

    const formatAddressLine = (address) => {
      return `${address.city}, ${address.postal_code}`;
    };

    const formatFullAddress = (details) => {
      if (!details || !details.delivery_address) return "N/A";
      return details.delivery_address;
    };

    const isDeliveryStepActive = (step) => {
      const statusOrder = ["SCHEDULED", "PAID", "IN_PROGRESS", "COMPLETED"];
      const currentStatus = collectionDetails.value.status;

      if (!currentStatus || !statusOrder.includes(currentStatus)) return false;

      const currentIndex = statusOrder.indexOf(currentStatus);
      const stepIndex = statusOrder.indexOf(step);

      return stepIndex <= currentIndex;
    };

    const initiateCollection = (item) => {
      selectedItem.value = item;
      modalType.value = "initiate";
      collectionMethod.value = "SELF_PICKUP";
      collectionError.value = null;
      showModal.value = true;
    };

    const viewCollectionDetails = async (item) => {
      selectedItem.value = item;
      modalType.value = "details";
      showModal.value = true;

      await fetchCollectionDetails(item.id);
    };

    const closeModal = () => {
      showModal.value = false;
      selectedItem.value = null;
      collectionError.value = null;
      showNewAddressForm.value = false;
      isSubmitting.value = false;
      isProcessingPayment.value = false;
    };

    const selectAddress = (address) => {
      selectedAddress.value = address;
    };

    const validateAddress = () => {
      addressErrors.value = {};

      if (!newAddress.value.street_address) {
        addressErrors.value.street_address = "Street address is required";
      }

      if (!newAddress.value.unit_number) {
        addressErrors.value.unit_number = "Unit number is required";
      }

      if (!newAddress.value.postal_code) {
        addressErrors.value.postal_code = "Postal code is required";
      }

      if (!newAddress.value.city) {
        addressErrors.value.city = "City is required";
      }

      if (!newAddress.value.phone) {
        addressErrors.value.phone = "Contact phone is required";
      }

      return Object.keys(addressErrors.value).length === 0;
    };

    const saveAddress = () => {
      if (!validateAddress()) {
        return;
      }

      // Create new address
      const newAddressObj = {
        id: savedAddresses.value.length + 1,
        ...newAddress.value,
      };

      // If setting as default, update other addresses
      if (newAddressObj.is_default) {
        savedAddresses.value.forEach((a) => {
          a.is_default = false;
        });
      }

      // Add to saved addresses
      savedAddresses.value.push(newAddressObj);

      // Select the new address
      selectedAddress.value = newAddressObj;

      // Reset form and hide it
      showNewAddressForm.value = false;
      newAddress.value = {
        street_address: "",
        unit_number: "",
        postal_code: "",
        city: "",
        phone: "",
        is_default: false,
      };
    };

    const submitCollectionRequest = async () => {
      collectionError.value = null;

      // Validate courier option requires address
      if (collectionMethod.value === "COURIER" && !selectedAddress.value) {
        collectionError.value = "Please select or add a delivery address";
        return;
      }

      isSubmitting.value = true;

      try {
        // In a real application, this would be an API call
        // For now, simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (collectionMethod.value === "COURIER") {
          // If courier, proceed to payment
          modalType.value = "payment";
        } else {
          // If self-pickup, show success and close
          showModal.value = false;
          // Show success message or redirect

          // Refresh items list to update status
          await fetchMatchedItems();
        }
      } catch (err) {
        console.error("Error submitting collection request:", err);
        collectionError.value =
          "Failed to submit collection request. Please try again.";
      } finally {
        isSubmitting.value = false;
      }
    };

    const processPayment = async () => {
      isProcessingPayment.value = true;

      try {
        // In a real application, redirect to payment gateway
        // For now, simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // After "payment", close modal and refresh items
        showModal.value = false;
        await fetchMatchedItems();
      } catch (err) {
        console.error("Error processing payment:", err);
      } finally {
        isProcessingPayment.value = false;
      }
    };

    return {
      isLoading,
      error,
      matchedItems,
      searchQuery,
      statusFilter,
      filteredItems,
      showModal,
      modalType,
      modalTitle,
      selectedItem,
      collectionMethod,
      collectionDetails,
      collectionError,
      isSubmitting,
      savedAddresses,
      selectedAddress,
      showNewAddressForm,
      newAddress,
      addressErrors,
      paymentDetails,
      isProcessingPayment,
      formatStatus,
      formatTime,
      formatCollectionMethod,
      formatDeliveryStatus,
      formatAddressName,
      formatAddressLine,
      formatFullAddress,
      isDeliveryStepActive,
      fetchMatchedItems,
      initiateCollection,
      viewCollectionDetails,
      closeModal,
      selectAddress,
      saveAddress,
      submitCollectionRequest,
      processPayment,
      handleImageError,
      fetchItems,
      viewItemDetails,
      getItemsToShow
    };
  },
};
</script>

<style scoped>
.collection-container {
  max-width: 1000px;
  margin: 2rem auto;
}

.collection-title {
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
  display: inline-block;
  width: 2rem;
  height: 2rem;
  border: 0.25rem solid rgba(17, 24, 39, 0.1);
  border-radius: 50%;
  border-top-color: #111827;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

.spinner.small {
  width: 1rem;
  height: 1rem;
  border-width: 0.125rem;
  margin-right: 0.5rem;
  margin-bottom: 0;
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
  color: #9ca3af;
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

.collection-filters {
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.search-bar {
  flex: 1;
}

.filter-options {
  width: 200px;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.matched-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.item-image {
  height: 200px;
  position: relative;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-status {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background-color: #9ca3af;
}

.status-matched {
  background-color: #3b82f6;
}

.status-collecting {
  background-color: #f59e0b;
}

.status-retrieved {
  background-color: #10b981;
}

.item-details {
  padding: 1rem;
}

.item-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
}

.item-category,
.item-location,
.item-date {
  color: #6b7280;
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.item-actions {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
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

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #111827;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f3f4f6;
}

.btn-text {
  background: none;
  border: none;
  color: #4b5563;
  padding: 0;
  font-size: 0.875rem;
}

.btn-text:hover {
  color: #111827;
  text-decoration: underline;
}

.btn-small {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.btn-large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.retrieved-message {
  color: #10b981;
  font-size: 0.875rem;
}

/* Modal Styles */
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
  z-index: 100;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-description {
  margin-bottom: 1.5rem;
  color: #4b5563;
}

/* Collection Form Styles */
.collection-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.collection-method {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.collection-method:hover {
  border-color: #9ca3af;
}

.collection-method.selected {
  border-color: #111827;
  background-color: #f8fafc;
}

.method-icon {
  color: #6b7280;
  margin-bottom: 1rem;
}

.selected-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: #111827;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.delivery-form {
  margin-top: 2rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.delivery-form h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #111827;
}

.saved-addresses {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.saved-address {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.saved-address:hover {
  border-color: #9ca3af;
}

.saved-address.selected {
  border-color: #111827;
  background-color: #f8fafc;
}

.address-name {
  font-weight: 500;
  margin: 0 0 0.25rem;
  color: #111827;
}

.address-line {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.default-badge {
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  margin-top: 0.5rem;
  display: inline-block;
}

.radio-button {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.radio-button.selected {
  border-color: #111827;
}

.radio-button.selected:after {
  content: "";
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background-color: #111827;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.form-header h4 {
  font-size: 1rem;
  margin: 0;
  color: #111827;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0;
}

.form-group.half {
  flex: 1;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.form-control.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-check {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.check-label {
  margin-left: 0.5rem;
  display: inline;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin: 1rem 0;
}

.alert-danger {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Collection Details Styles */
.item-summary {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

.item-summary .item-image {
  width: 120px;
  height: 120px;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.item-summary .item-image img {
  border-radius: 0.25rem;
}

.collection-info h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem;
  color: #111827;
}

.detail-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.detail-label {
  width: 40%;
  font-weight: 500;
  color: #6b7280;
}

.detail-value {
  width: 60%;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: white;
  background-color: #9ca3af;
}

.status-matched {
  background-color: #3b82f6;
}

.status-collecting {
  background-color: #f59e0b;
}

.status-retrieved {
  background-color: #10b981;
}

.delivery-scheduled {
  background-color: #9ca3af;
}

.delivery-paid {
  background-color: #3b82f6;
}

.delivery-in_progress {
  background-color: #f59e0b;
}

.delivery-completed {
  background-color: #10b981;
}

.map-container {
  margin-top: 1.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.map-placeholder {
  background-color: #f3f4f6;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  text-align: center;
}

.map-pin {
  width: 2rem;
  height: 2rem;
  background-color: #ef4444;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  margin-bottom: 0.75rem;
  position: relative;
}

.map-pin:after {
  content: "";
  width: 1rem;
  height: 1rem;
  background-color: white;
  position: absolute;
  border-radius: 50%;
  top: 0.5rem;
  left: 0.5rem;
}

.delivery-progress {
  margin-top: 2rem;
  display: flex;
  align-items: center;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 33.333%;
  position: relative;
}

.step-dot {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #e5e7eb;
  margin-bottom: 0.5rem;
  z-index: 5;
}

.progress-step.active .step-dot {
  background-color: #10b981;
}

.step-label {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-step.active .step-label {
  color: #111827;
  font-weight: 500;
}

.progress-line {
  flex-grow: 1;
  height: 0.25rem;
  background-color: #e5e7eb;
  margin: 0 -0.5rem 2rem;
}

.progress-line.active {
  background-color: #10b981;
}

.step-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Payment Form Styles */
.payment-summary {
  max-width: 400px;
  margin: 0 auto;
}

.payment-summary h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #111827;
}

.fee-details {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.fee-row.total {
  font-weight: 600;
  color: #111827;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.payment-description {
  margin-bottom: 1.5rem;
  color: #4b5563;
  text-align: center;
}

.payment-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .collection-filters {
    flex-direction: column;
  }

  .collection-methods {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
