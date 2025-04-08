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
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h2>No Matched Items Yet</h2>
        <p>
          When one of your lost items is found and matched, it will appear here
          for collection.
        </p>
        <router-link to="/report-lost" class="btn btn-primary">Report a Lost Item</router-link>
      </div>

      <div v-else class="collection-content">
        <div class="collection-filters">
          <div class="search-bar">
            <input type="text" v-model="searchQuery" placeholder="Search by item name..." class="form-control" />
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
          <ItemCard v-for="item in filteredItems" :key="item.id" :item="item" @click="viewItemDetails(item)">
            <template v-slot:actions>
              <button v-if="item.status === 'MATCHED' && isItemOwner(item)" @click.stop="initiateCollection(item)"
                class="btn btn-primary">
                Arrange Collection
              </button>
              <div v-else-if="item.status === 'MATCHED' && !isItemOwner(item)" class="status-message finder-info">
                Waiting for Owner to Arrange Collection
              </div>
              <div v-else-if="item.status === 'COLLECTING'" class="status-badge collecting">
                Collection in Progress
                <button @click.stop="viewItemDetails(item)" class="btn btn-sm btn-outline">
                  View Details
                </button>
              </div>
              <div v-else-if="item.status === 'RETRIEVED'" class="status-badge retrieved">
                Item Retrieved
              </div>
              <div v-else class="status-message">
                {{ getStatusMessage(item.status) }}
              </div>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
              <div class="collection-method" :class="{ selected: collectionMethod === 'SELF_PICKUP' }"
                @click="collectionMethod = 'SELF_PICKUP'">
                <div class="method-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3>Self Pickup</h3>
                <p>Collect the item yourself from the designated location</p>
                <span v-if="collectionMethod === 'SELF_PICKUP'" class="selected-badge">Selected</span>
              </div>

              <div class="collection-method" :class="{ selected: collectionMethod === 'COURIER' }"
                @click="collectionMethod = 'COURIER'">
                <div class="method-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <h3>Courier Delivery</h3>
                <p>Have the item delivered to your address (fees apply)</p>
                <span v-if="collectionMethod === 'COURIER'" class="selected-badge">Selected</span>
              </div>
            </div>

            <div v-if="collectionMethod === 'COURIER'" class="delivery-form">
              <h3>Delivery Address</h3>

              <div v-if="isLoadingAddress" class="loading-indicator">
                <div class="spinner small"></div>
                <p>Loading address information...</p>
              </div>

              <div v-else-if="addressError" class="address-error">
                <div class="error-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p>{{ addressError }}</p>
                <button @click="fetchUserAddress(selectedItem.id)" class="btn btn-secondary btn-sm">
                  Try Again
                </button>
              </div>

              <div v-else-if="userAddress" class="address-details">
                <div class="address-card">
                  <h4>Delivery Address</h4>
                  <p class="address-name">{{ userAddress.fullName }}</p>
                  <p class="address-line">
                    {{ userAddress.address.unitNumber }},
                    {{ userAddress.address.streetAddress }}
                  </p>
                  <p class="address-line">
                    {{ userAddress.address.city }}
                    {{ userAddress.address.postalCode }}
                  </p>
                  <p class="address-contact">Phone: {{ userAddress.phone }}</p>
                  <p class="address-contact">Email: {{ userAddress.email }}</p>
                </div>

                <div class="note-section">
                  <p class="note">
                    This address information will be used by the logistics
                    service to deliver the item. The actual delivery options and
                    pricing will be provided by the integrated logistics
                    service.
                  </p>
                </div>
              </div>

              <div v-else class="no-address">
                <p>No address information available for delivery.</p>
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
                <img :src="selectedItem.imageUrl || '/img/placeholder-image.jpg'" :alt="selectedItem.name" />
              </div>
              <div class="item-info">
                <h3>{{ selectedItem.name }}</h3>
                <p><strong>Category:</strong> {{ selectedItem.category }}</p>
                <p v-if="selectedItem.description">
                  <strong>Description:</strong> {{ selectedItem.description }}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span class="status-badge" :class="'status-' + selectedItem.status.toLowerCase()">{{
                    formatStatus(selectedItem.status) }}</span>
                </p>
                <div v-if="canEditItem(selectedItem)" class="item-actions mt-2">
                  <button @click="editItem(selectedItem)" class="btn btn-secondary btn-sm">
                    Edit Details
                  </button>
                  <button @click="confirmDelete(selectedItem)" class="btn btn-danger btn-sm ml-2">
                    Delete Item
                  </button>
                </div>
              </div>
            </div>

            <div v-if="selectedItem.status === 'COLLECTING' && collectionDetails" class="collection-info">
              <h3>Collection Details</h3>

              <!-- Common details section -->
              <div class="detail-row">
                <span class="detail-label">Delivery Status:</span>
                <span class="detail-value status-badge"
                  :class="`delivery-${collectionDetails.delivery_status?.toLowerCase()}`">
                  {{
                    formatDeliveryStatus(
                      collectionDetails.delivery_status || "PENDING"
                    )
                  }}
                </span>
              </div>

              <!-- Shipping details -->
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">{{
                  collectionDetails.service_name || "Standard Delivery"
                }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">${{ collectionDetails.price || "0.00" }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">From:</span>
                <span class="detail-value">{{
                  collectionDetails.pick_code || "N/A"
                }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">To:</span>
                <span class="detail-value">{{
                  collectionDetails.send_address || "N/A"
                }}</span>
              </div>

              <!-- Different actions for finder vs owner -->
              <div class="collection-actions">
                <!-- Finder-specific actions -->
                <div v-if="isItemFinder(selectedItem)" class="action-section">
                  <h4>Finder Actions</h4>

                  <!-- For courier delivery -->
                  <button v-if="
                    (collectionDetails.delivery_status === 'PAID' ||
                      collectionDetails.delivery_status === 'PENDING') &&
                    collectionDetails.service_name !== 'Self Pickup'
                  " @click="updateDeliveryStatus(selectedItem.id, 'PICKED_UP')" class="btn btn-primary">
                    Confirm Item Picked Up by Courier
                  </button>

                  <!-- For self pickup -->
                  <button v-if="
                    collectionDetails.service_name === 'Self Pickup' &&
                    (collectionDetails.delivery_status === 'ARRANGED' ||
                      collectionDetails.delivery_status === 'PENDING')
                  " @click="updateDeliveryStatus(selectedItem.id, 'PICKED_UP')" class="btn btn-primary">
                    Confirm Item Picked Up by Owner
                  </button>

                  <div v-else-if="
                    collectionDetails.delivery_status === 'PICKED_UP'
                  " class="status-message">
                    Item has been picked up
                  </div>
                  <div v-else-if="
                    collectionDetails.delivery_status === 'DELIVERED'
                  " class="status-message">
                    Item has been delivered successfully
                  </div>
                </div>

                <!-- Owner-specific actions -->
                <div v-if="isItemOwner(selectedItem)" class="action-section">
                  <h4>Owner Actions</h4>
                  <div v-if="collectionDetails.delivery_status === 'PAID'" class="status-message">
                    Waiting for item to be picked up from finder
                  </div>
                  <button v-else-if="
                    collectionDetails.delivery_status === 'PICKED_UP'
                  " @click="markItemAsDelivered(selectedItem.id)" class="btn btn-success">
                    Confirm Item Received
                  </button>
                  <div v-else-if="
                    collectionDetails.delivery_status === 'DELIVERED'
                  " class="status-message">
                    You've confirmed receipt of this item
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="collection-not-started">
              <p class="collection-message">
                {{ getCollectionStatusMessage(selectedItem.status) }}
              </p>
            </div>
          </div>

          <!-- Payment Form -->
          <div v-else-if="modalType === 'payment'" class="payment-form">
            <div class="delivery-details">
              <h3>Delivery Details</h3>
              <div class="delivery-route">
                <div class="location-card">
                  <div class="location-icon pickup">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="location-info">
                    <span class="location-label">Pickup Location</span>
                    <span class="location-value">{{
                      paymentDetails.pickup_location || "Unknown location"
                    }}</span>
                    <span class="location-postal">Postal code:
                      {{ paymentDetails.pick_code || "N/A" }}</span>
                  </div>
                </div>

                <div class="route-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                <div class="location-card">
                  <div class="location-icon dropoff">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div class="location-info">
                    <span class="location-label">Delivery Location</span>
                    <span class="location-value">{{
                      formatDeliveryAddress()
                    }}</span>
                    <span class="location-postal">{{
                      userAddress?.address?.postalCode || "N/A"
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Options from rate-check API -->
            <div class="shipping-options-container">
              <h3>Select a Shipping Option</h3>
              <div class="shipping-options">
                <div v-for="option in shippingOptions" :key="option.service_name" class="shipping-option" :class="{
                  selected:
                    selectedOption &&
                    selectedOption.service_name === option.service_name,
                }" @click="selectShippingOption(option)">
                  <div class="option-header">
                    <div class="option-name">{{ option.service_name }}</div>
                    <div class="option-price">${{ option.price }}</div>
                  </div>
                  <div class="option-details">
                    <div class="option-detail">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{
                        option.estimated_delivery || "Standard delivery time"
                      }}</span>
                    </div>
                    <div class="option-detail" v-if="option.features">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ option.features }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="!shippingOptions || shippingOptions.length === 0" class="no-options">
                  <p>
                    No shipping options are currently available for this
                    address. Please try again later.
                  </p>
                </div>
              </div>
            </div>

            <div class="order-summary">
              <h3>Order Summary</h3>
              <div class="fee-details">
                <div v-if="selectedOption" class="selected-service">
                  <div class="service-header">
                    <span class="service-name">{{
                      selectedOption.service_name
                    }}</span>
                    <span class="service-price">${{ selectedOption.price }}</span>
                  </div>
                  <div class="service-details" v-if="selectedOption.estimated_delivery">
                    <div class="detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ selectedOption.estimated_delivery }}</span>
                    </div>
                  </div>
                </div>

                <div v-else class="no-selection">
                  <p>Please select a delivery option to see pricing.</p>
                </div>

                <div class="fee-row total">
                  <span>Total</span>
                  <span v-if="selectedOption">${{ selectedOption.price }}</span>
                  <span v-else>$0.00</span>
                </div>
              </div>

              <div v-if="paymentError" class="payment-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{{ paymentError }}</span>
              </div>

              <div class="payment-buttons">
                <button @click="processPayment" class="btn btn-primary btn-large"
                  :disabled="!selectedOption || isProcessingPayment">
                  <span v-if="isProcessingPayment" class="spinner small"></span>
                  Proceed to Payment
                </button>
                <button @click="closeModal" class="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div v-if="modalType === 'initiate'" class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary">
              Cancel
            </button>
            <button @click="submitCollectionRequest" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner small"></span>
              View Delivery Fee
            </button>
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
              <input type="text" id="itemName" v-model="editForm.name" class="form-control"
                :class="{ error: editErrors.name }" />
              <div v-if="editErrors.name" class="error-message">
                {{ editErrors.name }}
              </div>
            </div>

            <div class="form-group">
              <label for="itemCategory">Category *</label>
              <select id="itemCategory" v-model="editForm.category" class="form-control"
                :class="{ error: editErrors.category }">
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
              <textarea id="itemDescription" v-model="editForm.description" class="form-control"
                :class="{ error: editErrors.description }" rows="4"></textarea>
              <div v-if="editErrors.description" class="error-message">
                {{ editErrors.description }}
              </div>
            </div>

            <div class="form-group">
              <label for="itemVenue">Venue/Location *</label>
              <input type="text" id="itemVenue" v-model="editForm.venue" class="form-control"
                :class="{ error: editErrors.venue }" />
              <div v-if="editErrors.venue" class="error-message">
                {{ editErrors.venue }}
              </div>
            </div>

            <div class="form-group">
              <label for="specificLocation">Specific Location</label>
              <input type="text" id="specificLocation" v-model="editForm.specificLocation" class="form-control" />
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeEditModal" class="btn btn-secondary">
              Cancel
            </button>
            <button @click="saveItemChanges" class="btn btn-primary" :disabled="isSaving">
              <span v-if="isSaving" class="spinner small"></span>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import itemService from "@/services/item.service";
import ItemCard from "@/components/ItemCard.vue";
import { useStore } from "vuex";
import axios from "axios";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default {
  name: "CollectionView",
  components: {
    ItemCard,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const activeSubTab = ref("lost");

    const userAddress = ref(null);
    const isLoadingAddress = ref(false);
    const addressError = ref(null);
    const paymentError = ref(null);

    const getStatusMessage = (status) => {
      switch (status.toUpperCase()) {
        case "LOST":
          return "Awaiting matches";
        case "FOUND":
          return "Awaiting owner claim";
        default:
          return status;
      }
    };

    const getCollectionStatusMessage = (status) => {
      switch (status) {
        case "MATCHED":
          return "This item has been matched but collection has not been arranged yet. Click 'Arrange Collection' to proceed.";
        case "LOST":
          return "This item is currently marked as lost. Once it's found and matched, you can arrange collection.";
        case "FOUND":
          return "This item is currently marked as found. It's waiting to be matched with its owner.";
        case "RETRIEVED":
          return "This item has been successfully retrieved by its owner.";
        default:
          return "No collection information available.";
      }
    };

    // Function to fetch user's address when initiating delivery
    const fetchUserAddress = async (itemId) => {
      try {
        isLoadingAddress.value = true;
        addressError.value = null;

        // First get the owner ID from the item
        const itemResponse = await itemService.getItemById(itemId);
        const ownerId = itemResponse.data.ownerId;

        if (!ownerId) {
          throw new Error("Item owner information not found");
        }

        // Fetch address from user service
        const response = await axios.get(
          `http://localhost:8000/user/api/users/${ownerId}/address`
        );

        if (response.data.success) {
          userAddress.value = response.data.address;
        } else {
          throw new Error(
            response.data.error || "Failed to load address information"
          );
        }
      } catch (error) {
        console.error("Error fetching owner address:", error);
        addressError.value =
          error.message ||
          "Failed to load address information. Please try again.";
        userAddress.value = null;
      } finally {
        isLoadingAddress.value = false;
      }
    };

    // Function to determine pick code based on currentLocation
    const getPickCodeFromItem = async (itemId) => {
      try {
        // First, fetch the item details to get currentLocation
        const itemResponse = await itemService.getItemById(itemId);
        const itemData = itemResponse.data;

        if (!itemData) {
          throw new Error("Item not found");
        }

        // Check the currentLocation
        const currentLocation = itemData.currentLocation;

        let pickCode; // Declare a variable to store the pick code

        if (currentLocation === "with_me") {
          // If item is with finder, get finder's postal code
          const finderId = itemData.finderId;
          if (!finderId) {
            throw new Error("Finder information not found");
          }

          // Fetch address from user service
          const userResponse = await axios.get(
            `http://localhost:8000/user/api/users/${finderId}/address`
          );

          if (userResponse.data.success) {
            pickCode = userResponse.data.address.address.postalCode;
            return pickCode;
          } else {
            throw new Error("Failed to fetch finder's address");
          }
        } else if (
          currentLocation === "lost_found_office" ||
          currentLocation === "venue_staff"
        ) {
          // Extract postal code from location string
          // Example format: "202 Jurong East Street 21, Singapore 600202 | AF"
          const locationString = itemData.location;

          // Use regex to extract 6-digit postal code
          const postalCodeMatch = locationString.match(/Singapore\s+(\d{6})/i);

          if (postalCodeMatch && postalCodeMatch[1]) {
            pickCode = postalCodeMatch[1];
            return pickCode;
          } else {
            // Fallback to default if postal code not found in string
            console.warn(
              "Could not extract postal code from location:",
              locationString
            );
            pickCode = "059893"; // Default postal code
            return pickCode;
          }
        } else {
          // Fallback to default for unknown location type
          console.warn("Unknown currentLocation value:", currentLocation);
          pickCode = "059893"; // Default postal code
          return pickCode;
        }
      } catch (error) {
        console.error("Error getting pick code from item:", error);
        // Return default pick code on error
        const pickCode = "059893";
        return pickCode;
      }
    };

    // Enhanced submitCollectionRequest function to handle courier delivery
    const submitCollectionRequest = async () => {
      collectionError.value = null;
      isSubmitting.value = true;

      try {
        if (collectionMethod.value === "COURIER") {
          const pickCode = await getPickCodeFromItem(selectedItem.value.id);

          // Make sure we have user address
          if (!userAddress.value || !userAddress.value.address) {
            throw new Error("User address is missing. Please try again.");
          }

          // Call the logistics rate-check API to get shipping options
          try {
            const response = await axios.post(
              "http://localhost:8000/logistics/rate-check",
              {
                pick_code: pickCode,
                pick_country: "SG", // Default to Singapore
                send_code: userAddress.value.address.postalCode,
                send_country: "SG", // Default to Singapore
                weight: "1", // Default to 1kg for a typical lost item
              }
            );

            // Store the shipping options and additional details
            if (response.data && response.data.rates) {
              shippingOptions.value = response.data.rates;
              paymentDetails.value = {
                ...paymentDetails.value,
                pick_code: pickCode,
                pickup_location:
                  selectedItem.value.location || "Unknown location",
              };

              // Now change the modal type to 'payment' to show shipping options
              modalType.value = "payment";
            } else {
              throw new Error("No delivery options available for this route.");
            }
          } catch (apiError) {
            console.error("Logistics API error:", apiError);
            throw new Error(
              "Failed to retrieve delivery options: " +
              (apiError.response?.data?.error || apiError.message)
            );
          }
        } else {
          // Your existing self-pickup logic remains unchanged
          // First, get the current item to ensure we have the matchedItemId
          const itemResponse = await itemService.getItemById(
            selectedItem.value.id
          );
          const currentItem = itemResponse.data;
          const matchedItemId = currentItem.matchedItemId;

          if (!matchedItemId) {
            throw new Error(
              "Matched item ID not found. Cannot update collection status."
            );
          }

          // Create a collection details record
          const collectionData = {
            item_id: selectedItem.value.id,
            user_id: store.getters["auth/user"]?.id,
            service_name: "Self Pickup",
            price: "0.00",
            send_address: "Self pickup by owner",
            pick_code: "Self pickup",
            delivery_status: "ARRANGED", // New status for self-pickup
          };

          // Save the collection details to Firestore (similar to courier flow)
          const orderPayload = { order: collectionData };
          await axios.post(
            "http://localhost:8000/logistics/select-order",
            orderPayload
          );

          // Update both items to COLLECTING status
          await Promise.all([
            itemService.updateItemStatus(selectedItem.value.id, "COLLECTING"),
            itemService.updateItemStatus(matchedItemId, "COLLECTING"),
          ]);

          // Show success notification
          store.dispatch("notifications/add", {
            type: "success",
            message: "Self pickup arranged successfully!",
          });

          // Close modal and refresh items
          showModal.value = false;
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

    const getItemsToShow = computed(() => {
      // User ID from store
      const userId = store.getters["auth/user"]?.id;

      if (!userId) return [];

      // Filter based on active subtab
      if (activeSubTab.value === "lost") {
        // Show matched items that the user reported as lost
        return matchedItems.value.filter(
          (item) =>
            item.reportOwner === userId &&
            item.status.toUpperCase() === "MATCHED" &&
            // For lost items that were matched, the user is the owner
            item.ownerId === userId
        );
      } else if (activeSubTab.value === "found") {
        // Show matched items that the user reported as found
        return matchedItems.value.filter(
          (item) =>
            item.reportOwner === userId &&
            item.status.toUpperCase() === "MATCHED" &&
            // For found items that were matched, the user is the finder
            item.finderId === userId
        );
      } else if (activeSubTab.value === "matched") {
        // Show items in collection or retrieval process that the user reported
        return matchedItems.value.filter(
          (item) =>
            item.reportOwner === userId &&
            (item.status.toUpperCase() === "COLLECTING" ||
              item.status.toUpperCase() === "RETRIEVED")
        );
      }

      return [];
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
        // Get current user ID
        const userId = store.getters["auth/user"]?.id || 1; // Fallback to 1 for testing

        // Fetch items for all relevant statuses
        const [
          lostResponse,
          foundResponse,
          matchedResponse,
          collectingResponse,
          retrievedResponse,
        ] = await Promise.all([
          itemService.getLostItems(),
          itemService.getFoundItems(),
          itemService.getMatchedItems(),
          itemService.getCollectingItems(),
          itemService.getRetrievedItems(),
        ]);

        // Combine all items with status filtration
        const allItems = [
          ...lostResponse.data, // Add these items
          ...foundResponse.data, // Add these items
          ...matchedResponse.data,
          ...collectingResponse.data,
          ...retrievedResponse.data,
        ];

        // Only show items that this user reported themselves
        const filteredItems = allItems.filter(
          (item) =>
            // The key filter: only include items this user reported
            item.reportOwner === userId
        );

        matchedItems.value = filteredItems;
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
    const modalType = ref(null); // 'initiate', 'details', 'payment'
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
        // Clear previous data
        collectionDetails.value = null;
        collectionError.value = null;

        let targetItemId = itemId;
        const currentUser = store.getters["auth/user"];
        const userId = currentUser?.id;

        // Get the item details first to determine if the current user is the finder
        const itemResponse = await itemService.getItemById(itemId);
        const itemData = itemResponse.data;

        // If current user is the finder, use the matchedItemId instead
        if (itemData.finderId === userId && itemData.matchedItemId) {
          targetItemId = itemData.matchedItemId;
        }

        // Now try to fetch using the API with the correct item ID
        try {
          const response = await axios.get(
            `http://localhost:8000/user` + `/${targetItemId}`
          );

          if (response.data && response.data.success) {
            // Map API response to your collectionDetails format
            const orderData = response.data.order_data;
            collectionDetails.value = {
              delivery_status: orderData.delivery_status,
              service_name: orderData.service_name,
              pick_code: orderData.pick_code,
              send_address: orderData.send_address,
              price: orderData.price,
              timestamp: orderData.timestamp,
            };
          } else {
            throw new Error("No collection details found");
          }
        } catch (apiError) {
          console.warn(
            "API fetch failed, falling back to direct query:",
            apiError
          );

          // Fallback to direct query if needed
          const selectedOrdersRef = collection(db, "selected_orders");
          const q = query(
            selectedOrdersRef,
            where("order_data.item_id", "==", targetItemId)
          );

          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            const orderData = orderDoc.data().order_data;

            collectionDetails.value = {
              delivery_status: orderData.delivery_status,
              service_name: orderData.service_name,
              pick_code: orderData.pick_code,
              send_address: orderData.send_address,
              price: orderData.price,
              timestamp: orderData.timestamp,
            };
          } else {
            throw new Error("No collection details found");
          }
        }
      } catch (err) {
        console.error("Error fetching collection details:", err);
        collectionError.value =
          "Failed to load collection details. Please try again.";
      }
    };

    const selectShippingOption = (option) => {
      selectedOption.value = option;

      // If you want to update payment details when shipping option changes:
      if (option && paymentDetails.value) {
        paymentDetails.value = {
          ...paymentDetails.value,
          total: parseFloat(option.price),
        };
      }
    };

    const formatDeliveryAddress = () => {
      if (!userAddress.value || !userAddress.value.address)
        return "No address provided";

      const address = userAddress.value.address;
      if (!address.unitNumber || !address.streetAddress || !address.city) {
        return "Incomplete address";
      }

      return `${address.unitNumber}, ${address.streetAddress}, ${address.city}`;
    };

    const initiateCollection = async (item) => {
      selectedItem.value = item;
      modalType.value = "initiate";
      collectionMethod.value = "SELF_PICKUP";
      collectionError.value = null;
      showModal.value = true;

      // Clear previous address data
      userAddress.value = null;
      addressError.value = null;

      // Fetch the address when courier delivery option is available
      // This makes the address data ready for the logistics service to use
      await fetchUserAddress(item.id);
    };

    // Update updateDeliveryStatus to use the API
    const updateDeliveryStatus = async (itemId, newStatus) => {
      try {
        // First determine if we need to use a matched ID
        const itemResponse = await itemService.getItemById(itemId);
        const itemData = itemResponse.data;

        const currentUser = store.getters["auth/user"];
        const userId = currentUser?.id;

        // If current user is the finder, use the matchedItemId
        let targetItemId = itemId;
        if (itemData.finderId === userId && itemData.matchedItemId) {
          targetItemId = itemData.matchedItemId;
        }

        // For self-pickup, create the API request
        const response = await axios.put(
          `${process.env.VUE_APP_ORDERS_URL}/status`,
          {
            item_id: targetItemId,
            delivery_status: newStatus,
          }
        );

        if (response.data && response.data.success) {
          // Refresh the collection details
          await fetchCollectionDetails(itemId);

          // Show success notification
          store.dispatch("notifications/add", {
            type: "success",
            message: `Status updated to ${formatDeliveryStatus(newStatus)}`,
          });

          // If this was the final step (DELIVERED), update item statuses
          if (newStatus === "DELIVERED") {
            await Promise.all([
              itemService.updateItemStatus(itemId, "RETRIEVED"),
              itemData.matchedItemId
                ? itemService.updateItemStatus(
                  itemData.matchedItemId,
                  "RETRIEVED"
                )
                : Promise.resolve(),
            ]);

            // Refresh the items list
            await fetchMatchedItems();
          }
        } else {
          throw new Error(response.data?.error || "Failed to update status");
        }
      } catch (err) {
        console.error("Error updating delivery status:", err);
        store.dispatch("notifications/add", {
          type: "error",
          message:
            "Failed to update status: " +
            (err.response?.data?.error || err.message),
        });
      }
    };

    // For marking an item as collected by both parties
    const markItemAsDelivered = async (itemId) => {
      try {
        // First update delivery status
        await updateDeliveryStatus(itemId, "DELIVERED");

        // Then get the item to ensure we have the correct matchedItemId
        const itemResponse = await itemService.getItemById(itemId);
        const item = itemResponse.data;
        const matchedItemId = item.matchedItemId;

        if (!matchedItemId) {
          throw new Error(
            "Matched item ID not found. Cannot complete retrieval."
          );
        }

        // Update both items to RETRIEVED status
        await Promise.all([
          // Update this item
          itemService.updateItemStatus(itemId, "RETRIEVED"),

          // Update matched item
          itemService.updateItemStatus(matchedItemId, "RETRIEVED"),
        ]);

        // Refresh the items list
        await fetchMatchedItems();

        // Close the modal
        closeModal();

        store.dispatch("notifications/add", {
          type: "success",
          message: "Item successfully marked as delivered and retrieved!",
        });
      } catch (err) {
        console.error("Error marking item as delivered:", err);
        store.dispatch("notifications/add", {
          type: "error",
          message: "Error completing item retrieval: " + err.message,
        });
      }
    };

    const isItemOwner = (item) => {
      const userId = store.getters["auth/user"]?.id;
      return item.ownerId === userId;
    };

    const isItemFinder = (item) => {
      const userId = store.getters["auth/user"]?.id;
      return item.finderId === userId;
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
        PENDING: "Pending",
        PAID: "Payment Confirmed",
        PICKED_UP: "Picked Up by Courier",
        IN_PROGRESS: "In Transit",
        DELIVERED: "Delivered",
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

    const canEditItem = (item) => {
      if (!item) return false;
      const userId = store.getters["auth/user"]?.id;
      return (
        item.reportOwner === userId &&
        !["MATCHED", "COLLECTING", "RETRIEVED"].includes(item.status) &&
        ((item.ownerId === userId && item.status === "LOST") ||
          (item.finderId === userId && item.status === "FOUND"))
      );
    };

    const editItem = (item) => {
      // Use the approach from viewItemDetails that's already working correctly
      // Simply store the entire item object
      selectedItem.value = item;

      // Log for debugging

      // Parse location if present
      let venue = "";
      let specificLocation = "";

      if (item.location) {
        const locationParts = item.location.split(" | ");
        venue = locationParts[0] || "";
        specificLocation = locationParts.length > 1 ? locationParts[1] : "";
      }

      // Populate form
      editForm.value = {
        name: item.name || "",
        category: item.category || "",
        description: item.description || "",
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
        // Simply use the ID directly from selectedItem, which contains the full item object
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
          type: "success",
          message: "Item updated successfully",
        });

        // Close and refresh
        closeEditModal();
        await fetchMatchedItems();
      } catch (error) {
        console.error("Error updating item:", error);
        store.dispatch("notifications/add", {
          type: "error",
          message:
            "Failed to update item: " +
            (error.response?.data?.error || error.message),
        });
      } finally {
        isSaving.value = false;
      }
    };

    const confirmDelete = async (item) => {
      // Use the same approach as editItem - store the item in selectedItem first
      selectedItem.value = item;

      if (!selectedItem.value || !selectedItem.value.id) {
        store.dispatch("notifications/add", {
          type: "error",
          message: "Item ID not found",
        });
        return;
      }

      if (!confirm("Are you sure you want to delete this item?")) {
        return;
      }

      try {
        // Include user ID in request for permission check
        const userId = store.getters["auth/user"]?.id;

        // Now use selectedItem.value.id, just like in editItem and saveItemChanges
        const itemId = selectedItem.value.id;

        await itemService.deleteItem(itemId, { userId });

        // Show success notification
        store.dispatch("notifications/add", {
          type: "success",
          message: "Item deleted successfully",
        });

        // Close modal and refresh data
        closeModal();
        await fetchMatchedItems();
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

    // Add the missing refs for shipping options
    const shippingOptions = ref([]);
    const selectedOption = ref(null);

    const processPayment = async () => {
      isProcessingPayment.value = true;
      collectionError.value = null;

      try {
        // Validate shipping option
        if (collectionMethod.value === "COURIER" && !selectedOption.value) {
          collectionError.value = "Please select a shipping option first";
          return;
        }

        // For courier, prepare order details and create initial order record
        if (collectionMethod.value === "COURIER" && selectedOption.value) {
          // Get the dynamic pick code based on item's currentLocation
          const pickCode = await getPickCodeFromItem(selectedItem.value.id);

          const orderDetails = {
            item_id: selectedItem.value.id,
            user_id: store.getters["auth/user"]?.id,
            service_name: selectedOption.value.service_name,
            price: selectedOption.value.price,
            send_address: `${userAddress.value.address.unitNumber}, ${userAddress.value.address.streetAddress}, ${userAddress.value.address.city}, ${userAddress.value.address.postalCode}`,
            pick_code: pickCode,
            delivery_status: "PENDING", // Start with PENDING status
          };

          // Submit order to create the record
          const orderPayload = { order: orderDetails };
          const logisticsResponse = await axios.post(
            "http://localhost:8000/logistics/select-order",
            orderPayload
          );

          // Update status to COLLECTING for both items before redirecting
          await Promise.all([
            // Update current item
            itemService.updateItemStatus(selectedItem.value.id, "COLLECTING"),

            // Update matched item if it exists
            selectedItem.value.matchedItemId
              ? itemService.updateItemStatus(
                selectedItem.value.matchedItemId,
                "COLLECTING"
              )
              : Promise.resolve(),
          ]);

          // Show success notification for status update
          store.dispatch("notifications/add", {
            type: "success",
            message: "Item status updated to 'In Collection'",
          });

          // Save order data to localStorage before navigation
          const orderData = {
            orderId: logisticsResponse.data.order_id || selectedItem.value.id,
            itemId: selectedItem.value.id,
            serviceName: selectedOption.value.service_name,
            amount: selectedOption.value.price,
            pickupLocation: orderDetails.pick_code,
            deliveryLocation: orderDetails.send_address,
            itemName: selectedItem.value.name || "Lost Item",
          };

          localStorage.setItem("orderData", JSON.stringify(orderData));

          // Close modal
          showModal.value = false;

          // Redirect to payment form with proper query parameters
          router.push({
            name: "PaymentForm",
            query: {
              orderId: logisticsResponse.data.order_id || selectedItem.value.id,
              itemId: selectedItem.value.id,
              amount: selectedOption.value.price, // Make sure price is passed correctly
              serviceName: selectedOption.value.service_name,
            },
          });

          return; // Exit early since we're redirecting to payment page
        }

        // For self-pickup, continue with the existing flow...
        // [rest of the function remains unchanged]
      } catch (err) {
        console.error("Error processing payment:", err);
        collectionError.value = "Failed to process payment. Please try again.";
      } finally {
        isProcessingPayment.value = false;
      }
    };

    return {
      getStatusMessage,
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
      viewCollectionDetails,
      closeModal,
      selectAddress,
      saveAddress,
      getPickCodeFromItem,
      submitCollectionRequest,
      processPayment,
      handleImageError,
      fetchItems,
      viewItemDetails,
      getItemsToShow,
      userAddress,
      isLoadingAddress,
      addressError,
      fetchUserAddress,
      getCollectionStatusMessage,
      shippingOptions,
      selectedOption,
      isItemOwner,
      updateDeliveryStatus,
      markItemAsDelivered,
      isItemFinder,
      formatDeliveryAddress,
      selectShippingOption,
      initiateCollection,
      canEditItem,
      editItem,
      confirmDelete,
      showEditModal,
      editForm,
      editErrors,
      isSaving,
      closeEditModal,
      saveItemChanges,
      paymentError,
    };
  },
};
</script>

<style scoped>
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

.spinner.small {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

.collection-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.action-section {
  margin-bottom: 1rem;
}

.status-message {
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  color: #4b5563;
  font-style: italic;
}

.delivery-paid {
  background-color: #3b82f6;
}

.delivery-picked_up {
  background-color: #f59e0b;
}

.delivery-delivered {
  background-color: #10b981;
}

.collection-not-started {
  padding: 1.5rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.collection-message {
  color: #4b5563;
  text-align: center;
  font-style: italic;
}

.delivery-form {
  margin-top: 2rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.address-card {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.address-card h4 {
  font-size: 1.125rem;
  color: #111827;
  margin-bottom: 0.75rem;
}

.address-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.address-line {
  margin-bottom: 0.25rem;
}

.address-contact {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.note-section {
  margin-top: 1.5rem;
}

.note {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

.address-error {
  color: #ef4444;
  background-color: #fee2e2;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.error-icon {
  margin-bottom: 0.5rem;
}

.no-address {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.spinner.small {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(17, 24, 39, 0.1);
  border-top-color: #111827;
}

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

.ml-2 {
  margin-left: 0.5rem;
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

/* Payment form specific styles */
.payment-form {
  padding: 1rem 0;
}

/* Delivery route display styles */
.delivery-route {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  gap: 1rem;
}

.location-card {
  flex: 1;
  display: flex;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.location-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
}

.location-icon.pickup {
  background-color: #dbeafe;
  color: #3b82f6;
}

.location-icon.dropoff {
  background-color: #dcfce7;
  color: #10b981;
}

.location-info {
  display: flex;
  flex-direction: column;
}

.location-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.location-value {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.location-postal {
  font-size: 0.875rem;
  color: #64748b;
}

.route-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

/* Shipping options styles */
.shipping-options-container {
  margin-bottom: 2rem;
}

.shipping-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.shipping-option {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shipping-option:hover {
  border-color: #94a3b8;
  transform: translateY(-2px);
}

.shipping-option.selected {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.option-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.option-name {
  font-weight: 600;
  color: #0f172a;
}

.option-price {
  font-weight: 600;
  color: #0f172a;
}

.option-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-detail {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 0.875rem;
}

.option-detail svg {
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.no-options {
  padding: 2rem;
  text-align: center;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  color: #64748b;
}

/* Order summary styles */
.order-summary {
  background-color: #f8fafc;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.selected-service {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.service-name {
  color: #111827;
}

.service-price {
  color: #111827;
}

.service-details {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.detail-item {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.detail-item svg {
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.no-selection {
  padding: 1rem;
  background-color: #f3f4f6;
  text-align: center;
  color: #6b7280;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-style: italic;
}

.payment-error {
  display: flex;
  align-items: center;
  background-color: #fee2e2;
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .delivery-route {
    flex-direction: column;
  }

  .route-arrow {
    transform: rotate(90deg);
    margin: 0.5rem 0;
  }
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
