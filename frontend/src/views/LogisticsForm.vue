<template>
  <div class="container">
    <div class="report-container">
      <h1 class="report-title">Delivery Form</h1>

      <div class="report-card">
        <!-- Progress steps remain unchanged -->
        <div class="form-progress">
          <div
            class="progress-step"
            :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
          >
            <div class="step-number">1</div>
            <div class="step-title">Your Details</div>
          </div>
          <div class="progress-line" :class="{ active: currentStep > 1 }"></div>
          <div
            class="progress-step"
            :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
          >
            <div class="step-number">2</div>
            <div class="step-title">Pickup Location</div>
          </div>
          <div class="progress-line" :class="{ active: currentStep > 2 }"></div>
          <div
            class="progress-step"
            :class="{ active: currentStep >= 3, completed: currentStep > 3 }"
          >
            <div class="step-number">3</div>
            <div class="step-title">Package Details</div>
          </div>
          <div class="progress-line" :class="{ active: currentStep > 3 }"></div>
          <div class="progress-step" :class="{ active: currentStep >= 4 }">
            <div class="step-number">4</div>
            <div class="step-title">Confirmation</div>
          </div>
        </div>

        <div class="form-content">
          <!-- Step 1: Your Details (Simplified) -->
          <div v-if="currentStep === 1" class="form-step">
            <h2 class="step-heading">Your Details</h2>
            <p class="step-description">
              Where would you like your lost item to be delivered?
            </p>

            <div class="form-group">
              <label for="receiverName">Your Full Name *</label>
              <input
                type="text"
                id="receiverName"
                v-model="formData.receiverName"
                class="form-control"
                :class="{ error: errors.receiverName }"
                placeholder="e.g. John Doe"
              />
              <div v-if="errors.receiverName" class="error-message">
                {{ errors.receiverName }}
              </div>
            </div>

            <div class="form-group">
              <label for="receiverContact">Your Contact Number *</label>
              <input
                type="tel"
                id="receiverContact"
                v-model="formData.receiverContact"
                class="form-control"
                :class="{ error: errors.receiverContact }"
                placeholder="e.g. 91234567"
              />
              <div v-if="errors.receiverContact" class="error-message">
                {{ errors.receiverContact }}
              </div>
            </div>

            <div class="form-group">
              <label for="receiverUnit">Your Full Address *</label>
              <input
                type="text"
                id="receiverUnit"
                v-model="formData.receiverUnit"
                class="form-control"
                :class="{ error: errors.receiverUnit }"
                placeholder="e.g. Block 123, #01-45, Main Street"
              />
              <div v-if="errors.receiverUnit" class="error-message">
                {{ errors.receiverUnit }}
              </div>
            </div>

            <div class="form-group">
              <label for="receiverPostalCode">Postal Code *</label>
              <input
                type="text"
                id="receiverPostalCode"
                v-model="formData.receiverPostalCode"
                class="form-control"
                :class="{ error: errors.receiverPostalCode }"
                placeholder="e.g. 123456"
              />
              <div v-if="errors.receiverPostalCode" class="error-message">
                {{ errors.receiverPostalCode }}
              </div>
            </div>

            <div class="form-group">
              <label for="deliveryInstructions">Delivery Instructions (Optional)</label>
              <textarea
                id="deliveryInstructions"
                v-model="formData.deliveryInstructions"
                class="form-control"
                placeholder="Any special instructions for the delivery person..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- Step 2: Pickup Location (Finder's Details) - remains unchanged -->
          <div v-if="currentStep === 2" class="form-step">
            <h2 class="step-heading">Pickup Location</h2>
            <p class="step-description">
              Where should the courier collect your lost item from?
            </p>

            <div class="form-group">
              <label for="senderName">Finder's Name *</label>
              <input
                type="text"
                id="senderName"
                v-model="formData.senderName"
                class="form-control"
                :class="{ error: errors.senderName }"
                placeholder="e.g. Jane Smith"
              />
              <div v-if="errors.senderName" class="error-message">
                {{ errors.senderName }}
              </div>
            </div>

            <div class="form-group">
              <label for="senderContact">Finder's Contact Number *</label>
              <input
                type="tel"
                id="senderContact"
                v-model="formData.senderContact"
                class="form-control"
                :class="{ error: errors.senderContact }"
                placeholder="e.g. 91234567"
              />
              <div v-if="errors.senderContact" class="error-message">
                {{ errors.senderContact }}
              </div>
            </div>

            <div class="form-group">
              <label for="senderUnit">Pickup Address *</label>
              <input
                type="text"
                id="senderUnit"
                v-model="formData.senderUnit"
                class="form-control"
                :class="{ error: errors.senderUnit }"
                placeholder="e.g. Block 456, #02-34, Second Street"
              />
              <div v-if="errors.senderUnit" class="error-message">
                {{ errors.senderUnit }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="senderPostalCode">Pickup Postal Code *</label>
              <input
                type="text"
                id="senderPostalCode"
                v-model="formData.senderPostalCode"
                class="form-control"
                :class="{ error: errors.senderPostalCode }"
                placeholder="e.g. 654321"
              />
              <div v-if="errors.senderPostalCode" class="error-message">
                {{ errors.senderPostalCode }}
              </div>
              <div class="field-hint">
                This is needed to calculate shipping costs accurately
              </div>
            </div>

            <div class="form-group">
              <label for="pickupInstructions">Pickup Instructions (Optional)</label>
              <textarea
                id="pickupInstructions"
                v-model="formData.pickupInstructions"
                class="form-control"
                placeholder="Any special instructions for the courier collecting the item..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- Step 3: Package Details (Simplified with Weight Slider) -->
          <div v-if="currentStep === 3" class="form-step">
            <h2 class="step-heading">Package Details</h2>
            <p class="step-description">
              Tell us about your lost item and choose shipping options
            </p>
            
            <div class="form-group">
              <label for="itemName">Lost Item Name *</label>
              <input
                type="text"
                id="itemName"
                v-model="formData.itemName"
                class="form-control"
                :class="{ error: errors.itemName }"
                placeholder="e.g. Black Leather Wallet"
              />
              <div v-if="errors.itemName" class="error-message">
                {{ errors.itemName }}
              </div>
            </div>

            <div class="form-group">
              <label>Package Weight: {{ formData.weight }}kg *</label>
              <div class="weight-slider-container">
                <input
                  type="range"
                  v-model="formData.weight"
                  min="0.1"
                  max="10"
                  step="0.1"
                  class="weight-slider"
                />
                <div class="weight-slider-labels">
                  <span>0.1kg</span>
                  <span>5kg</span>
                  <span>10kg</span>
                </div>
                <div class="weight-examples">
                  <div class="weight-example">
                    <span class="example-icon">📄</span>
                    <span class="example-label">Documents<br>(~0.5kg)</span>
                  </div>
                  <div class="weight-example">
                    <span class="example-icon">📱</span>
                    <span class="example-label">Phone/Wallet<br>(~1kg)</span>
                  </div>
                  <div class="weight-example">
                    <span class="example-icon">💼</span>
                    <span class="example-label">Laptop<br>(~3kg)</span>
                  </div>
                  <div class="weight-example">
                    <span class="example-icon">🧳</span>
                    <span class="example-label">Larger Items<br>(5kg+)</span>
                  </div>
                </div>
              </div>
              <div v-if="errors.weight" class="error-message">
                {{ errors.weight }}
              </div>
            </div>

            <div class="form-group">
              <label>Delivery Options *</label>
              <div v-if="loading.rateCheck" class="loading-indicator">
                <div class="spinner"></div>
                <p>Fetching available delivery options...</p>
              </div>
              
              <div v-else-if="availableServices.length === 0" class="no-services">
                <p>No delivery services available for the provided locations.</p>
                <p>Please go back and check your postal codes or try again later.</p>
              </div>
              
              <div v-else class="delivery-options">
                <div 
                  v-for="service in availableServices" 
                  :key="service.service_id"
                  :class="['delivery-option', { selected: formData.selectedService === service.service_id }]"
                  @click="formData.selectedService = service.service_id"
                >
                  <div class="delivery-option-header">
                    <div class="delivery-provider">{{ formatServiceProvider(service) }}</div>
                    <div class="delivery-price">{{ formatPrice(service.price) }}</div>
                  </div>
                  
                  <div class="delivery-details">
                    <div class="delivery-estimate">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {{ getDeliveryEstimate(service) }}
                    </div>
                    
                    <div class="delivery-service-name">{{ service.service_name }}</div>
                  </div>
                  
                  <div class="delivery-option-radio">
                    <div class="radio-button" :class="{ active: formData.selectedService === service.service_id }"></div>
                  </div>
                </div>
              </div>
              
              <div v-if="errors.selectedService" class="error-message">
                {{ errors.selectedService }}
              </div>
            </div>
          </div>

          <!-- Step 4: Confirmation (Updated to reflect the simplified fields) -->
          <div v-if="currentStep === 4" class="form-step">
            <h2 class="step-heading">Confirm Your Delivery Details</h2>
            <p class="step-description">
              Please review all information before submitting your delivery request.
            </p>

            <div class="confirmation-summary">
              <div class="summary-section">
                <h3>Your Delivery Address</h3>
                <div class="summary-item">
                  <span class="summary-label">Name:</span>
                  <span class="summary-value">{{ formData.receiverName }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Contact:</span>
                  <span class="summary-value">{{ formData.receiverContact }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Address:</span>
                  <span class="summary-value">
                    {{ formData.receiverUnit }}<br>
                    Singapore {{ formData.receiverPostalCode }}
                  </span>
                </div>
                <div class="summary-item" v-if="formData.deliveryInstructions">
                  <span class="summary-label">Instructions:</span>
                  <span class="summary-value">{{ formData.deliveryInstructions }}</span>
                </div>
              </div>

              <div class="summary-section">
                <h3>Pickup Location</h3>
                <div class="summary-item">
                  <span class="summary-label">Name:</span>
                  <span class="summary-value">{{ formData.senderName }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Contact:</span>
                  <span class="summary-value">{{ formData.senderContact }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Address:</span>
                  <span class="summary-value">
                    {{ formData.senderUnit }}<br>
                    Singapore {{ formData.senderPostalCode }}
                  </span>
                </div>
                <div class="summary-item" v-if="formData.pickupInstructions">
                  <span class="summary-label">Instructions:</span>
                  <span class="summary-value">{{ formData.pickupInstructions }}</span>
                </div>
              </div>

              <div class="summary-section">
                <h3>Package Details</h3>
                <div class="summary-item">
                  <span class="summary-label">Item Name:</span>
                  <span class="summary-value">{{ formData.itemName }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Weight:</span>
                  <span class="summary-value">{{ formData.weight }} kg</span>
                </div>
              </div>

              <div class="summary-section">
                <h3>Shipping Details</h3>
                <div class="summary-item" v-if="selectedServiceDetails">
                  <span class="summary-label">Service:</span>
                  <span class="summary-value">{{ selectedServiceDetails.service_name }}</span>
                </div>
                <div class="summary-item" v-if="selectedServiceDetails">
                  <span class="summary-label">Cost:</span>
                  <span class="summary-value">${{ selectedServiceDetails.price }}</span>
                </div>
                <div class="summary-item" v-if="selectedServiceDetails">
                  <span class="summary-label">Estimated Delivery:</span>
                  <span class="summary-value">{{ getDeliveryEstimate(selectedServiceDetails) }}</span>
                </div>
              </div>
            </div>

            <div class="payment-info">
              <h3>Payment Information</h3>
              <p>You'll need to make payment for the shipping costs before your item is shipped. After submitting this form, you'll proceed to payment.</p>
            </div>

            <div class="confirmation-agreement">
              <label class="checkbox-container">
                <input type="checkbox" v-model="formData.agreement" />
                <span class="checkbox-label">
                  I confirm that all the information provided is accurate and I agree to pay the shipping costs.
                </span>
              </label>
              <div v-if="errors.agreement" class="error-message">
                {{ errors.agreement }}
              </div>
            </div>

            <div v-if="errors.api" class="api-error">
              <div class="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div class="error-message">{{ errors.api }}</div>
            </div>
          </div>

          <!-- Form Buttons (unchanged) -->
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
              @click="submitDeliveryOrder"
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="spinner"></span>
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
  export default {
    data() {
      return {
        currentStep: 1,
        isSubmitting: false,
        formData: {
          // Delivery address - Your details (Step 1)
          receiverName: '',
          receiverContact: '',
          receiverUnit: '',
          receiverPostalCode: '',
          deliveryInstructions: '',
          
          // Pickup location - Finder's details (Step 2)
          senderName: '',
          senderContact: '',
          senderUnit: '',
          senderPostalCode: '',
          pickupInstructions: '',
          
          // Package details (Step 3)
          itemName: '',
          weight: '1',
          selectedService: null,
          
          // Agreement (Step 4)
          agreement: false
        },
        errors: {},
        availableServices: [],
        loading: {
          rateCheck: false
        }
      }
    },

    created() {
      // Load saved form data for testing
      const savedData = localStorage.getItem('logisticsFormData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          this.currentStep = data.currentStep || 1;
          this.formData = { ...this.formData, ...data.formData };
          if (data.availableServices && data.availableServices.length) {
            this.availableServices = data.availableServices;
          }
          console.log('Development: Form data loaded for testing');
        } catch (error) {
          console.error('Error loading saved form data:', error);
        }
      }
    },

    // Updated to beforeUnmount (Vue 3) from beforeDestroy
    beforeUnmount() {
      localStorage.setItem('logisticsFormData', JSON.stringify({
        currentStep: this.currentStep,
        formData: this.formData,
        availableServices: this.availableServices
      }));
    },

    computed: {
      // Direct store getters without using mapGetters
      storeIsLoading() {
        return this.$store.getters['logistics/isLoading'];
      },
      storeIsSubmitting() {
        return this.$store.getters['logistics/isSubmitting'];
      },
      storeAvailableServices() {
        return this.$store.getters['logistics/getAvailableServices'];
      },
      storeSelectedService() {
        return this.$store.getters['logistics/getSelectedService'];
      },
      storeError() {
        return this.$store.getters['logistics/getError'];
      },
      
      // Keep your existing computed property
      selectedServiceDetails() {
        // First try to get from Vuex store
        if (this.storeSelectedService) {
          return this.storeSelectedService;
        }
        
        // Fall back to component state
        if (!this.formData.selectedService || this.availableServices.length === 0) return null;
        return this.availableServices.find(
          service => service.service_id === this.formData.selectedService
        );
      },
      
      // Development mode check
      isDevelopment() {
        return process.env.NODE_ENV === 'development';
      }
    },

    watch: {
      // Watch for store errors and update local errors
      storeError(newError) {
        if (newError) {
          this.errors.api = newError;
        }
      },
      
      // Watch for available services from store
      storeAvailableServices: {
        handler(newServices) {
          if (newServices && newServices.length > 0) {
            this.availableServices = newServices;
            // Set first service as default if available
            if (this.availableServices.length > 0) {
              this.formData.selectedService = this.availableServices[0].service_id;
            }
          }
        },
        immediate: true
      },
    },

    methods: {
      // Direct store actions without using mapActions
      storeFetchRates(payload) {
        return this.$store.dispatch('logistics/fetchShippingRates', payload);
      },
      
      storeSubmitOrder(payload) {
        return this.$store.dispatch('logistics/submitOrder', payload);
      },

      // Navigation functions
      nextStep() {
        // Validate current step before proceeding
        if (this.validateCurrentStep()) {
          // If on step 2, fetch shipping rates before proceeding to step 3
          if (this.currentStep === 2) {
            this.fetchShippingRates();
          } else {
            this.currentStep++;
            this.scrollToTop();
          }
        }
      },
      
      scrollToTop() {
        this.$nextTick(() => {
          const formContent = document.querySelector('.form-content');
          if (formContent) {
            formContent.scrollTop = 0;
          }
        });
      },
      
      prevStep() {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.scrollToTop();
        }
      },  
      
      // Validation function
      validateCurrentStep() {
        this.errors = {};
        let isValid = true;
        
        // Step 1: Delivery Address validation
        if (this.currentStep === 1) {
          if (!this.formData.receiverName?.trim()) {
            this.errors.receiverName = 'Your full name is required';
            isValid = false;
          }
          
          if (!this.formData.receiverContact?.trim()) {
            this.errors.receiverContact = 'Contact number is required';
            isValid = false;
          } else if (!/^\d{8}$/.test(this.formData.receiverContact)) {
            this.errors.receiverContact = 'Please enter a valid 8-digit phone number';
            isValid = false;
          }
          
          if (!this.formData.receiverUnit?.trim()) {
            this.errors.receiverUnit = 'Address is required';
            isValid = false;
          }
          
          if (!this.formData.receiverPostalCode?.trim()) {
            this.errors.receiverPostalCode = 'Postal code is required';
            isValid = false;
          } else if (!/^\d{6}$/.test(this.formData.receiverPostalCode)) {
            this.errors.receiverPostalCode = 'Please enter a valid 6-digit postal code';
            isValid = false;
          }
        }
        
        // Step 2: Pickup Location validation
        else if (this.currentStep === 2) {
          if (!this.formData.senderName?.trim()) {
            this.errors.senderName = 'Finder\'s name is required';
            isValid = false;
          }
          
          if (!this.formData.senderContact?.trim()) {
            this.errors.senderContact = 'Finder\'s contact number is required';
            isValid = false;
          } else if (!/^\d{8}$/.test(this.formData.senderContact)) {
            this.errors.senderContact = 'Please enter a valid 8-digit phone number';
            isValid = false;
          }
          
          if (!this.formData.senderUnit?.trim()) {
            this.errors.senderUnit = 'Pickup address is required';
            isValid = false;
          }
          
          if (!this.formData.senderPostalCode?.trim()) {
            this.errors.senderPostalCode = 'Pickup postal code is required';
            isValid = false;
          } else if (!/^\d{6}$/.test(this.formData.senderPostalCode)) {
            this.errors.senderPostalCode = 'Please enter a valid 6-digit postal code';
            isValid = false;
          }
        }
        
        // Step 3: Package Details validation
        else if (this.currentStep === 3) {
          if (!this.formData.itemName?.trim()) {
            this.errors.itemName = 'Item name is required';
            isValid = false;
          }
          
          if (!this.formData.weight || parseFloat(this.formData.weight) <= 0) {
            this.errors.weight = 'Please specify a valid weight';
            isValid = false;
          }
          
          if (!this.formData.selectedService && this.availableServices.length > 0) {
            this.errors.selectedService = 'Please select a delivery service';
            isValid = false;
          }
        }
        
        // Step 4: Confirmation validation
        else if (this.currentStep === 4) {
          if (!this.formData.agreement) {
            this.errors.agreement = 'You must agree to the terms before submitting';
            isValid = false;
          }
        }
        
        // If not valid, scroll to first error
        if (!isValid) {
          this.$nextTick(() => {
            const firstError = document.querySelector('.error-message');
            if (firstError) {
              firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        }
        
        return isValid;
      },
      
      // API call to fetch shipping rates
      async fetchShippingRates() {
        this.loading.rateCheck = true;
        this.errors.api = null;
        
        try {
          // Make sure we have both postal codes
          if (!this.formData.senderPostalCode || !this.formData.receiverPostalCode) {
            this.errors.api = 'Both pickup and delivery postal codes are required to calculate shipping rates';
            this.loading.rateCheck = false;
            return;
          }
          
          // Save form data for easier testing
          if (this.isDevelopment) {
            localStorage.setItem('logisticsFormData', JSON.stringify({
              currentStep: this.currentStep,
              formData: this.formData
            }));
          }
          
          // Dispatch the Vuex action
          const result = await this.storeFetchRates({
            pick_code: this.formData.senderPostalCode,
            pick_country: 'SG',
            send_code: this.formData.receiverPostalCode,
            send_country: 'SG',
            weight: this.formData.weight
          });
          
          // The action will update the Vuex store, and the watcher will update the local component
          // If we have services and no errors, proceed to the next step
          if (result && this.availableServices.length > 0) {
            this.currentStep++;
            this.scrollToTop();
          }
        } catch (error) {
          console.error('Error fetching shipping rates:', error);
          this.errors.api = error.message || 'Failed to fetch shipping rates. Please try again later.';
        } finally {
          this.loading.rateCheck = false;
        }
      },
      
      // Submit delivery order
      async submitDeliveryOrder() {
        if (!this.validateCurrentStep()) {
          return;
        }
        
        this.isSubmitting = true;
        this.errors.api = null;
        
        try {
          // Prepare order data for the store action
          const orderData = {
            orderId: 'ORDER-' + Math.floor(Math.random() * 10000000),
            serviceName: this.selectedServiceDetails?.service_name || 'Standard Delivery',
            pickupLocation: `${this.formData.senderPostalCode}, Singapore`,
            deliveryLocation: `${this.formData.receiverPostalCode}, Singapore`,
            itemName: this.formData.itemName,
            price: this.selectedServiceDetails?.price || '0',
            
            // Add all form fields for future API integration
            senderName: this.formData.senderName,
            senderContact: this.formData.senderContact,
            senderUnit: this.formData.senderUnit,
            senderPostalCode: this.formData.senderPostalCode,
            pickupInstructions: this.formData.pickupInstructions,
            
            receiverName: this.formData.receiverName,
            receiverContact: this.formData.receiverContact,
            receiverUnit: this.formData.receiverUnit,
            receiverPostalCode: this.formData.receiverPostalCode,
            deliveryInstructions: this.formData.deliveryInstructions,
            
            weight: this.formData.weight,
            selectedService: this.formData.selectedService
          };
          
          // Dispatch to store - this will save to localStorage
          await this.storeSubmitOrder(orderData);
          
          // Redirect to payment page
          this.$router.push('/payment-form');
        } catch (error) {
          console.error('Error preparing order data:', error);
          this.errors.api = error.message || 'An error occurred while preparing your order. Please try again.';
        } finally {
          this.isSubmitting = false;
        }
      },
      
      // Development testing helpers
      saveFormData() {
        localStorage.setItem('logisticsFormData', JSON.stringify({
          currentStep: this.currentStep,
          formData: this.formData,
          availableServices: this.availableServices
        }));
        console.log('Form data saved for testing');
      },
      
      loadSavedFormData() {
        const savedData = localStorage.getItem('logisticsFormData');
        if (savedData) {
          try {
            const data = JSON.parse(savedData);
            this.currentStep = data.currentStep || 1;
            this.formData = { ...this.formData, ...data.formData };
            if (data.availableServices && data.availableServices.length) {
              this.availableServices = data.availableServices;
            }
            console.log('Form data loaded for testing');
          } catch (error) {
            console.error('Error loading saved form data:', error);
          }
        }
      },
      
      clearSavedFormData() {
        localStorage.removeItem('logisticsFormData');
        console.log('Saved form data cleared');
        // Reload the page to reset the form
        window.location.reload();
      },
      
      // Helper methods for display
      formatPrice(price) {
        return `$${parseFloat(price).toFixed(2)}`;
      },
      
      formatServiceProvider(service) {
        // Extract the courier name from the service name if available
        if (service.service_name && service.service_name.includes(' - ')) {
          return service.service_name.split(' - ')[0];
        }
        return service.service_name || 'Courier Service';
      },
      
      getDeliveryEstimate(service) {
        if (!service) return 'Standard Delivery';
        
        if (service.delivery) {
          return service.delivery;
        }
        
        // If no specific delivery estimate, provide a generic one based on service name
        const serviceName = service.service_name?.toLowerCase() || '';
        if (serviceName.includes('express') || serviceName.includes('same day')) {
          return '1-2 days';
        } else if (serviceName.includes('standard')) {
          return '3-5 days';
        } else {
          return '2-4 days';
        }
      }
    }
  }
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
  
    /* Weight options styling */
    .weight-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 0.5rem;
    }


    .weight-option:hover {
    border-color: #9ca3af;
    background-color: #f9fafb;
    }

    .weight-option.selected {
    border-color: #111827;
    background-color: #f3f4f6;
    }

    .weight-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    }

    .weight-label {
    font-weight: 600;
    margin-bottom: 0.25rem;
    }

    .weight-value {
    font-size: 0.875rem;
    color: #6b7280;
    }

    .payment-info {
    background-color: #f9fafb;
    border-radius: 0.375rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    }

    .payment-info h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    }

    .payment-info p {
    font-size: 0.875rem;
    color: #4b5563;
    margin: 0;
    }

    /* New styles for weight slider */
  .weight-slider-container {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  
  .weight-slider {
    width: 100%;
    height: 8px;
    -webkit-appearance: none;
    appearance: none;
    background: #d1d5db;
    border-radius: 4px;
    outline: none;
    margin: 1rem 0;
  }
  
  .weight-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #111827;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .weight-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #111827;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .weight-slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }
  
  .weight-examples {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    background-color: #f9fafb;
    border-radius: 0.375rem;
    padding: 0.75rem;
  }
  
  .weight-example {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .example-icon {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }
  
  .example-label {
    font-size: 0.75rem;
    color: #6b7280;
    line-height: 1.2;
  }

  @media (max-width: 640px) {
    .weight-examples {
      flex-wrap: wrap;
    }
    
    .weight-example {
      width: 50%;
      margin-bottom: 0.5rem;
    }
  }
</style>