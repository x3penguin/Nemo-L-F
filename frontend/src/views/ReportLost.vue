<template>
  <div class="container">
    <div class="report-container">
      <h1 class="report-title">Report a Lost Item</h1>

      <div class="report-card">
        <div class="form-progress">
          <div
            class="progress-step"
            :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
          >
            <div class="step-number">1</div>
            <div class="step-title">Item Details</div>
          </div>
          <div class="progress-line" :class="{ active: currentStep > 1 }"></div>
          <div
            class="progress-step"
            :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
          >
            <div class="step-number">2</div>
            <div class="step-title">Location</div>
          </div>
          <div class="progress-line" :class="{ active: currentStep > 2 }"></div>
          <div
            class="progress-step"
            :class="{ active: currentStep >= 3, completed: currentStep > 3 }"
          >
            <div class="step-number">3</div>
            <div class="step-title">Image</div>
          </div>
          <div class="progress-line" :class="{ active: currentStep > 3 }"></div>
          <div class="progress-step" :class="{ active: currentStep >= 4 }">
            <div class="step-number">4</div>
            <div class="step-title">Confirmation</div>
          </div>
        </div>

        <div class="form-content">
          <!-- Step 1: Item Details -->
          <div v-if="currentStep === 1" class="form-step">
            <h2 class="step-heading">Item Details</h2>
            <p class="step-description">
              Please provide details about the item you've lost.
            </p>

            <div class="form-group">
              <label for="itemName">Item Name *</label>
              <input
                type="text"
                id="itemName"
                v-model="formData.name"
                class="form-control"
                :class="{ error: errors.name }"
                placeholder="e.g. Black Leather Wallet"
              />
              <div v-if="errors.name" class="error-message">
                {{ errors.name }}
              </div>
            </div>

            <div class="form-group">
              <label for="itemCategory">Category *</label>
              <select
                id="itemCategory"
                v-model="formData.category"
                class="form-control"
                :class="{ error: errors.category }"
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
              <div v-if="errors.category" class="error-message">
                {{ errors.category }}
              </div>
            </div>

            <div class="form-group">
              <label for="itemDescription">Description *</label>
              <textarea
                id="itemDescription"
                v-model="formData.description"
                class="form-control"
                :class="{ error: errors.description }"
                placeholder="Provide any distinguishing details that might help identify your item..."
                rows="4"
              ></textarea>
              <div v-if="errors.description" class="error-message">
                {{ errors.description }}
              </div>
            </div>
          </div>

          <!-- Step 2: Location -->
          <div v-if="currentStep === 2" class="form-step">
            <h2 class="step-heading">Location Details</h2>
            <p class="step-description">
              Where and when did you lose the item?
            </p>

            <div class="form-group">
              <label for="venue">Venue/Location *</label>
              <div class="location-input-container">
                <input
                  type="text"
                  id="venue-input"
                  v-model="formData.venue"
                  class="form-control"
                  :class="{ error: errors.venue }"
                  placeholder="e.g. Downtown Mall, Bus #36"
                />
                <button
                  type="button"
                  @click="getCurrentLocation"
                  class="current-location-btn"
                  title="Use my current location"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <div v-if="errors.venue" class="error-message">
                {{ errors.venue }}
              </div>
            </div>

            <!-- Map display -->
            <div class="map-container">
              <div ref="mapElement" class="google-map"></div>
              <p class="map-instruction">
                You can drag the marker to adjust the location
              </p>
            </div>

            <div class="form-group">
              <label for="specificLocation"
                >Specific Location (if applicable)</label
              >
              <input
                type="text"
                id="specificLocation"
                v-model="formData.specificLocation"
                class="form-control"
                placeholder="e.g. Food Court, 3rd Floor"
              />
            </div>

            <div class="form-group">
              <label for="lostDate">Date Lost *</label>
              <input
                type="date"
                id="lostDate"
                v-model="formData.lostDate"
                class="form-control"
                :class="{ error: errors.lostDate }"
              />
              <div v-if="errors.lostDate" class="error-message">
                {{ errors.lostDate }}
              </div>
            </div>

            <div class="form-group">
              <label for="lostTime">Approximate Time</label>
              <input
                type="time"
                id="lostTime"
                v-model="formData.lostTime"
                class="form-control"
              />
            </div>
          </div>

          <!-- Step 3: Image Upload -->
          <div v-if="currentStep === 3" class="form-step">
            <h2 class="step-heading">Upload Images</h2>
            <p class="step-description">
              Adding clear images will significantly improve the chances of
              finding your item.
            </p>

            <div
              class="image-upload-area"
              @click="triggerFileInput"
              @dragover.prevent
              @drop.prevent="onFileDrop"
            >
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                @change="onFileSelected"
              />

              <div v-if="!formData.imageFile" class="upload-placeholder">
                <div class="upload-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p>Click or drag & drop to upload an image</p>
                <span class="upload-note">Max file size: 5MB</span>
              </div>

              <div v-else class="image-preview">
                <img :src="imagePreviewUrl" alt="Preview" />
                <button @click.stop="removeImage" class="remove-image-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
            </div>

            <div v-if="errors.imageFile" class="error-message">
              {{ errors.imageFile }}
            </div>
          </div>

          <!-- Step 4: Confirmation -->
          <div v-if="currentStep === 4" class="form-step">
            <h2 class="step-heading">Confirm Details</h2>
            <p class="step-description">
              Please review the information below before submitting your report.
            </p>

            <div class="confirmation-summary">
              <div class="summary-section">
                <h3>Item Details</h3>
                <div class="summary-item">
                  <span class="summary-label">Name:</span>
                  <span class="summary-value">{{ formData.name }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Category:</span>
                  <span class="summary-value">{{ formData.category }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Description:</span>
                  <span class="summary-value">{{ formData.description }}</span>
                </div>
              </div>

              <div class="summary-section">
                <h3>Location Details</h3>
                <div class="summary-item">
                  <span class="summary-label">Venue:</span>
                  <span class="summary-value">{{ formData.venue }}</span>
                </div>
                <div v-if="formData.specificLocation" class="summary-item">
                  <span class="summary-label">Specific Location:</span>
                  <span class="summary-value">{{
                    formData.specificLocation
                  }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Date Lost:</span>
                  <span class="summary-value">{{
                    formatDate(formData.lostDate)
                  }}</span>
                </div>
                <div v-if="formData.lostTime" class="summary-item">
                  <span class="summary-label">Time:</span>
                  <span class="summary-value">{{ formData.lostTime }}</span>
                </div>
              </div>

              <div class="summary-section">
                <h3>Image</h3>
                <div v-if="formData.imageFile" class="summary-image">
                  <img :src="imagePreviewUrl" alt="Item Image" />
                </div>
                <div v-else class="summary-image-none">No image provided</div>
              </div>
            </div>

            <div class="confirmation-agreement">
              <label class="checkbox-container">
                <input type="checkbox" v-model="formData.agreement" />
                <span class="checkbox-label"
                  >I confirm that all the information provided is accurate to
                  the best of my knowledge.</span
                >
              </label>
              <div v-if="errors.agreement" class="error-message">
                {{ errors.agreement }}
              </div>
            </div>
          </div>

          <!-- Form Buttons -->
          <div class="form-actions">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="btn btn-secondary"
            >
              Back
            </button>

            <button
              v-if="currentStep < 4"
              @click="nextStep"
              class="btn btn-primary"
            >
              Next
            </button>

            <button
              v-else
              @click="submitForm"
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="spinner"></span>
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import locationService from "@/services/location.service";
import { getLoader } from "@/services/googleMapsLoader";

export default {
  name: "ReportLostView",
  setup() {
    const router = useRouter();
    const store = useStore();
    const googleMapsApiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY;
    const loader = getLoader(googleMapsApiKey);

    const currentStep = ref(1);
    const isSubmitting = ref(false);
    const fileInput = ref(null);

    const mapElement = ref(null);
    let map = null;
    let marker = null;

    const formData = ref({
      name: "",
      category: "",
      description: "",
      venue: "",
      specificLocation: "",
      lostDate: "",
      lostTime: "",
      imageFile: null,
      agreement: false,
      coordinates: {
        lat: null,
        lng: null,
      },
    });

    const errors = ref({});

    const imagePreviewUrl = computed(() => {
      if (!formData.value.imageFile) return "";
      return URL.createObjectURL(formData.value.imageFile);
    });

    // Initialize map when component is mounted
    onMounted(() => {
      // Only attempt to load map if we're on step 2
      if (currentStep.value !== 2) return;

      loader
        .load()
        .then(() => {
          initMap();
          initAutocomplete();
        })
        .catch((err) => {
          console.error("Error loading Google Maps API:", err);
        });

      // Add event listener for enter key on venue input
      const venueInput = document.getElementById("venue-input");
      if (venueInput) {
        venueInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            geocodeAddress(formData.value.venue);
          }
        });
      }
    });

    // Clean up on component unmount
    onUnmounted(() => {
      if (map) {
        // Clean up map resources if needed
        map = null;
        marker = null;
      }
    });

    // Watch for step changes to initialize map when reaching step 2
    watch(currentStep, (newStep) => {
      if (newStep === 2) {
        // We're now on the location step
        console.log("Now on step 2, initializing map");

        // Use setTimeout to ensure the DOM is updated
        setTimeout(() => {
          loader
            .load()
            .then(() => {
              console.log("Google Maps API loaded from step change");
              initMap();
              initAutocomplete();
            })
            .catch((err) => {
              console.error("Error loading Google Maps API:", err);
            });
        }, 300);
      }
    });

    // Add this geocodeAddress function to move pin when address is entered
    const geocodeAddress = async (address) => {
      try {
        const result = await locationService.geocodeAddress(address);
        if (result.results && result.results.length > 0) {
          const location = result.results[0].geometry.location;
          formData.value.coordinates.lat = location.lat;
          formData.value.coordinates.lng = location.lng;

          // Update marker and center map
          if (map && marker) {
            const position = { lat: location.lat, lng: location.lng };
            marker.setPosition(position);
            map.setCenter(position);
            map.setZoom(17);
          }
        }
      } catch (error) {
        console.error("Error geocoding address:", error);

        // Fallback to Google Maps API if the service fails
        if (window.google && window.google.maps && address) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK" && results[0] && results[0].geometry) {
              const location = results[0].geometry.location;
              const lat = location.lat();
              const lng = location.lng();

              formData.value.coordinates.lat = lat;
              formData.value.coordinates.lng = lng;

              // Update marker and center map
              if (map && marker) {
                const position = { lat, lng };
                marker.setPosition(position);
                map.setCenter(position);
                map.setZoom(17);
              }
            } else {
              console.error("Geocoder failed due to: " + status);
            }
          });
        }
      }
    };

    // Initialize Google Map
    const initMap = async () => {
      if (currentStep.value !== 2 || !mapElement.value) return;

      // Import required libraries
      const { Map } = await window.google.maps.importLibrary("maps");
      const { Marker } = await window.google.maps.importLibrary("marker");

      // Default to Singapore coordinates if no location is set
      const defaultPosition = { lat: 1.3521, lng: 103.8198 };
      const position = formData.value.coordinates.lat
        ? {
            lat: formData.value.coordinates.lat,
            lng: formData.value.coordinates.lng,
          }
        : defaultPosition;

      try {
        map = new Map(mapElement.value, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          mapId: "DEMO_MAP_ID", // Required for advanced markers
        });

        marker = new Marker({
          position: position,
          map: map,
          draggable: true,
        });

        window.google.maps.event.addListener(marker, "dragend", () => {
          const position = marker.getPosition();
          const lat = position.lat();
          const lng = position.lng();

          console.log("Marker dragged to:", lat, lng);
          formData.value.coordinates.lat = lat;
          formData.value.coordinates.lng = lng;

          // Explicitly call reverseGeocode to update the venue field
          reverseGeocode(lat, lng);
        });

        // Update marker when clicking on map
        window.google.maps.event.addListener(map, "click", (event) => {
          marker.setPosition(event.latLng);
          formData.value.coordinates.lat = event.latLng.lat();
          formData.value.coordinates.lng = event.latLng.lng();

          // Reverse geocode to get address
          reverseGeocode(event.latLng.lat(), event.latLng.lng());
        });

        console.log("Map initialized successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // In your setup function, add this method to initialize autocomplete
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places)
        return;

      const input = document.getElementById("venue-input");
      if (!input) return;

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        fields: ["formatted_address", "geometry", "name"],
        types: ["establishment", "geocode"],
        componentRestrictions: { country: "sg" },
        locationBias: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(1.1304753, 103.6020558), // Southwest corner of Singapore
          new window.google.maps.LatLng(1.4504753, 104.0120558) // Northeast corner of Singapore
        ),
      });

      autocomplete.addListener("place_changed", async () => {
        console.log("Place selected via Autocomplete");
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        formData.value.venue = place.formatted_address || place.name;
        formData.value.coordinates.lat = place.geometry.location.lat();
        formData.value.coordinates.lng = place.geometry.location.lng();

        // Update map
        if (map && marker) {
          const position = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          marker.setPosition(position);
          map.setCenter(position);
          map.setZoom(17);
        }
      });
    };

    // Update map when location is selected from autocomplete
    const updateLocationFromAutocomplete = (place) => {
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        formData.value.coordinates.lat = lat;
        formData.value.coordinates.lng = lng;

        // Update marker and center map
        if (map && marker) {
          const position = { lat, lng };
          marker.setPosition(position);
          map.setCenter(position);
          map.setZoom(17);
        }
      }
    };

    // Get current location using browser's geolocation API
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log("Got current location:", lat, lng);
            formData.value.coordinates.lat = lat;
            formData.value.coordinates.lng = lng;

            // Update marker and center map
            if (map && marker) {
              const pos = { lat, lng };
              marker.setPosition(pos);
              map.setCenter(pos);
              map.setZoom(17);
            }

            // Explicitly call reverseGeocode to update the venue field
            reverseGeocode(lat, lng);
          },
          (error) => {
            console.error("Error getting current location:", error);
            alert(
              "Unable to get your current location. Please enter it manually."
            );
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    };

    // Convert coordinates to address using reverse geocoding
    const reverseGeocode = async (lat, lng) => {
      try {
        console.log("Reverse geocoding coordinates:", lat, lng);
        const result = await locationService.reverseGeocode(lat, lng);
        console.log("Reverse geocode result:", result);

        if (result.results && result.results.length > 0) {
          formData.value.venue = result.results[0].formatted_address;
          console.log("Updated venue to:", formData.value.venue);
        } else {
          console.warn("No reverse geocoding results found");
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error);

        // Fallback to Google Maps API if the service fails
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results[0]) {
              formData.value.venue = results[0].formatted_address;
              console.log(
                "Updated venue via fallback to:",
                formData.value.venue
              );
            } else {
              console.error("Geocoder failed due to: " + status);
            }
          });
        }
      }
    };

    const validateStep = () => {
      errors.value = {};

      if (currentStep.value === 1) {
        if (!formData.value.name) {
          errors.value.name = "Item name is required";
        }
        if (!formData.value.category) {
          errors.value.category = "Please select a category";
        }
        if (!formData.value.description) {
          errors.value.description = "Description is required";
        } else if (formData.value.description.length < 10) {
          errors.value.description =
            "Description should be at least 10 characters";
        }
      } else if (currentStep.value === 2) {
        if (!formData.value.venue) {
          errors.value.venue = "Venue/location is required";
        }
        if (
          !formData.value.coordinates.lat ||
          !formData.value.coordinates.lng
        ) {
          errors.value.venue = "Please select a valid location on the map";
        }
        if (!formData.value.lostDate) {
          errors.value.lostDate = "Date lost is required";
        }
      } else if (currentStep.value === 4) {
        if (!formData.value.agreement) {
          errors.value.agreement =
            "You must confirm that the information is accurate";
        }
      }

      return Object.keys(errors.value).length === 0;
    };

    const nextStep = () => {
      if (validateStep()) {
        currentStep.value++;
      }
    };

    const prevStep = () => {
      currentStep.value--;
    };

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const onFileSelected = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          errors.value.imageFile = "File size should not exceed 5MB";
          return;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
          errors.value.imageFile = "Only image files are allowed";
          return;
        }

        formData.value.imageFile = file;
        errors.value.imageFile = null;
      }
    };

    const onFileDrop = (event) => {
      const file = event.dataTransfer.files[0];
      if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          errors.value.imageFile = "File size should not exceed 5MB";
          return;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
          errors.value.imageFile = "Only image files are allowed";
          return;
        }

        formData.value.imageFile = file;
        errors.value.imageFile = null;
      }
    };

    const removeImage = () => {
      formData.value.imageFile = null;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "";

      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const submitForm = async () => {
      if (!validateStep()) {
        return;
      }

      isSubmitting.value = true;

      try {
        // Create FormData object for API call
        const apiFormData = new FormData();
        apiFormData.append("name", formData.value.name);
        apiFormData.append("category", formData.value.category);
        apiFormData.append("description", formData.value.description);
        apiFormData.append("venue", formData.value.venue);
        apiFormData.append(
          "specific_location",
          formData.value.specificLocation
        );
        apiFormData.append("latitude", formData.value.coordinates.lat);
        apiFormData.append("longitude", formData.value.coordinates.lng);

        const now = new Date();
        const formattedDateTime = now.toISOString();

        apiFormData.append("date_time", formattedDateTime);

        const currentUser = store.getters["auth/user"];
        const userId = currentUser ? currentUser.id : "1"; // Fallback to 1 for testing
        apiFormData.append("userId", userId);

        if (formData.value.imageFile) {
          apiFormData.append("image", formData.value.imageFile);
        }

        // Call API via Vuex action
        await store.dispatch("items/reportLostItem", apiFormData);

        store.dispatch("notifications/add", {
          type: "info",
          message:
            "Your lost item has been reported. We'll notify you if a match is found.",
        });

        // Redirect to success page
        router.push({
          path: "/report-success",
          query: { type: "lost" },
        });
      } catch (error) {
        // Error handling
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      currentStep,
      formData,
      errors,
      isSubmitting,
      fileInput,
      mapElement,
      googleMapsApiKey,
      initAutocomplete,
      imagePreviewUrl,
      nextStep,
      prevStep,
      triggerFileInput,
      onFileSelected,
      onFileDrop,
      removeImage,
      formatDate,
      submitForm,
      updateLocationFromAutocomplete,
      getCurrentLocation,
    };
  },
};
</script>

<style scoped>
.report-container {
  max-width: 800px;
  margin: 2rem auto;
}

.report-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #111827;
}

.report-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-progress {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background-color: #111827;
  color: white;
}

.progress-step.completed .step-number {
  background-color: #10b981;
  color: white;
}

.step-title {
  font-size: 0.875rem;
  color: #6b7280;
  transition: color 0.3s ease;
}

.progress-step.active .step-title,
.progress-step.completed .step-title {
  color: #111827;
  font-weight: 500;
}

.progress-line {
  flex: 1;
  height: 2px;
  background-color: #e5e7eb;
  margin: 0 0.5rem 1rem;
  transition: background-color 0.3s ease;
}

.progress-line.active {
  background-color: #10b981;
}

.form-content {
  padding: 1.5rem;
}

.form-step {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-heading {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.step-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
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
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #111827;
  outline: none;
}

.form-control.error {
  border-color: #ef4444;
}

.error-message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.image-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.image-upload-area:hover {
  border-color: #111827;
  background-color: #f9fafb;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  color: #6b7280;
  margin-bottom: 1rem;
}

.upload-note {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.image-preview {
  position: relative;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background-color: white;
}

.confirmation-summary {
  margin-bottom: 2rem;
}

.summary-section {
  margin-bottom: 1.5rem;
}

.summary-section h3 {
  font-size: 1.125rem;
  color: #111827;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item {
  display: flex;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-weight: 500;
  width: 40%;
  color: #6b7280;
}

.summary-value {
  width: 60%;
}

.summary-image {
  max-width: 300px;
}

.summary-image img {
  max-width: 100%;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-image-none {
  font-style: italic;
  color: #6b7280;
}

.confirmation-agreement {
  margin-bottom: 1.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
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

.btn-secondary {
  background-color: white;
  color: #111827;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f3f4f6;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .form-progress {
    padding: 1rem 0.5rem;
  }

  .step-number {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
  }

  .step-title {
    font-size: 0.75rem;
  }

  .progress-line {
    margin: 0 0.25rem 1rem;
  }

  .form-content {
    padding: 1rem;
  }
}
/* Map and location input styles */
.location-input-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.current-location-btn {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-left: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.current-location-btn:hover {
  background-color: #e5e7eb;
}

.map-container {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: hidden;
}

.google-map {
  width: 100%;
  height: 250px;
  background-color: #f9fafb;
}

.map-instruction {
  padding: 0.5rem;
  background-color: #f9fafb;
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}
</style>
