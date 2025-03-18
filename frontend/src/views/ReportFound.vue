<template>
  <div class="container">
    <div class="report-container">
      <h1 class="report-title">Report a Found Item</h1>

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
              Please provide details about the item you've found.
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
                placeholder="Provide any distinguishing details that might help identify the item..."
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
              Where and when did you find the item?
            </p>

            <div class="form-group">
              <label for="venue">Venue/Location *</label>
              <input
                type="text"
                id="venue"
                v-model="formData.venue"
                class="form-control"
                :class="{ error: errors.venue }"
                placeholder="e.g. Downtown Mall, Bus #36"
              />
              <div v-if="errors.venue" class="error-message">
                {{ errors.venue }}
              </div>
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
              <label for="foundDate">Date Found *</label>
              <input
                type="date"
                id="foundDate"
                v-model="formData.foundDate"
                class="form-control"
                :class="{ error: errors.foundDate }"
              />
              <div v-if="errors.foundDate" class="error-message">
                {{ errors.foundDate }}
              </div>
            </div>

            <div class="form-group">
              <label for="foundTime">Approximate Time</label>
              <input
                type="time"
                id="foundTime"
                v-model="formData.foundTime"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="currentLocation">Current Item Location *</label>
              <select
                id="currentLocation"
                v-model="formData.currentLocation"
                class="form-control"
                :class="{ error: errors.currentLocation }"
              >
                <option value="">Select current location</option>
                <option value="with_me">With me</option>
                <option value="venue_staff">Left with venue staff</option>
                <option value="lost_found_office">
                  At lost & found office
                </option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.currentLocation" class="error-message">
                {{ errors.currentLocation }}
              </div>
            </div>

            <div v-if="formData.currentLocation === 'other'" class="form-group">
              <label for="otherLocation">Please specify</label>
              <input
                type="text"
                id="otherLocation"
                v-model="formData.otherLocationDetails"
                class="form-control"
                :class="{ error: errors.otherLocationDetails }"
              />
              <div v-if="errors.otherLocationDetails" class="error-message">
                {{ errors.otherLocationDetails }}
              </div>
            </div>
          </div>

          <!-- Step 3: Image Upload -->
          <div v-if="currentStep === 3" class="form-step">
            <h2 class="step-heading">Upload Images</h2>
            <p class="step-description">
              Adding clear images will significantly improve matching with lost
              items.
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
                  <span class="summary-label">Date Found:</span>
                  <span class="summary-value">{{
                    formatDate(formData.foundDate)
                  }}</span>
                </div>
                <div v-if="formData.foundTime" class="summary-item">
                  <span class="summary-label">Time:</span>
                  <span class="summary-value">{{ formData.foundTime }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Current Location:</span>
                  <span class="summary-value">{{ formatCurrentLocation }}</span>
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
// import GoogleAddressAutocomplete from 'vue3-google-address-autocomplete';

export default {
  name: "ReportFoundView",
  setup() {
    const router = useRouter();
    const store = useStore();

    const currentStep = ref(1);
    const isSubmitting = ref(false);
    const fileInput = ref(null);

    const formData = ref({
      name: "",
      category: "",
      description: "",
      venue: "",
      specificLocation: "",
      foundDate: "",
      foundTime: "",
      currentLocation: "",
      otherLocationDetails: "",
      imageFile: null,
      agreement: false,
    });

    const errors = ref({});

    const imagePreviewUrl = computed(() => {
      if (!formData.value.imageFile) return "";
      return URL.createObjectURL(formData.value.imageFile);
    });

    const formatCurrentLocation = computed(() => {
      const locationMap = {
        with_me: "With me",
        venue_staff: "Left with venue staff",
        lost_found_office: "At lost & found office",
        other: formData.value.otherLocationDetails,
      };

      return locationMap[formData.value.currentLocation] || "";
    });

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
        if (!formData.value.foundDate) {
          errors.value.foundDate = "Date found is required";
        }
        if (!formData.value.currentLocation) {
          errors.value.currentLocation =
            "Current location of the item is required";
        }
        if (
          formData.value.currentLocation === "other" &&
          !formData.value.otherLocationDetails
        ) {
          errors.value.otherLocationDetails =
            "Please specify the current location";
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
        apiFormData.append("current_location", formData.value.currentLocation);

        if (formData.value.currentLocation === "other") {
          apiFormData.append(
            "other_location_details",
            formData.value.otherLocationDetails
          );
        }

        // Combine date and time
        let dateTime;
        if (formData.value.lostTime) {
          dateTime = `${formData.value.lostDate}T${formData.value.lostTime}:00`;
        } else {
          dateTime = `${formData.value.lostDate}T00:00:00`;
        }

        apiFormData.append("date_time", dateTime);

        if (formData.value.imageFile) {
          apiFormData.append("image", formData.value.imageFile);
        }

        // Here would be the actual API call to submit the found item
        // For now, we'll simulate a delay and success
        await store.dispatch("items/reportFoundItem", apiFormData);

        // Redirect to success page
        router.push({
          path: "/report-success",
          query: { type: "found" },
        });
      } catch (error) {
        console.error("Error submitting report:", error);
        alert("There was an error submitting your report. Please try again.");
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
      imagePreviewUrl,
      formatCurrentLocation,
      nextStep,
      prevStep,
      triggerFileInput,
      onFileSelected,
      onFileDrop,
      removeImage,
      formatDate,
      submitForm,
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
</style>
