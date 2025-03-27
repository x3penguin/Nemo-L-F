<template>
    <div class="container">
      <div class="payment-container">
        <h1 class="payment-title">Payment Details</h1>
  
        <div class="payment-card">
          <!-- Order Summary -->
          <div class="order-summary">
            <h2 class="summary-heading">Order Summary</h2>
            <div class="summary-items">
              <div class="summary-item">
                <span class="item-label">Delivery Service:</span>
                <span class="item-value">{{ orderDetails.serviceName }}</span>
              </div>
              <div class="summary-item">
                <span class="item-label">Shipping From:</span>
                <span class="item-value">{{ orderDetails.pickupLocation }}</span>
              </div>
              <div class="summary-item">
                <span class="item-label">Shipping To:</span>
                <span class="item-value">{{ orderDetails.deliveryLocation }}</span>
              </div>
              <div class="summary-item">
                <span class="item-label">Item:</span>
                <span class="item-value">{{ orderDetails.itemName }}</span>
              </div>
            </div>
            <div class="price-summary">
              <div class="price-item">
                <span class="price-label">Shipping Cost:</span>
                <span class="price-value">${{ orderDetails.shippingCost }}</span>
              </div>
              <div class="price-item total">
                <span class="price-label">Total:</span>
                <span class="price-value">${{ orderDetails.totalAmount }}</span>
              </div>
            </div>
          </div>
  
          <!-- Payment Form -->
          <div class="payment-form">
            <h2 class="form-heading">Payment Information</h2>
            
            <div class="form-group">
              <label for="cardholderName">Cardholder Name *</label>
              <input
                type="text"
                id="cardholderName"
                v-model="paymentData.cardholderName"
                class="form-control"
                :class="{ error: errors.cardholderName }"
                placeholder="e.g. John Doe"
              />
              <div v-if="errors.cardholderName" class="error-message">
                {{ errors.cardholderName }}
              </div>
            </div>
  
            <div class="form-group">
              <label for="cardNumber">Card Number *</label>
              <div class="card-input-wrapper">
                <input
                  type="text"
                  id="cardNumber"
                  v-model="paymentData.cardNumber"
                  class="form-control"
                  :class="{ error: errors.cardNumber }"
                  placeholder="4111 1111 1111 1111"
                  @input="formatCardNumber"
                  maxlength="19"
                />
              </div>
              <div v-if="errors.cardNumber" class="error-message">
                {{ errors.cardNumber }}
              </div>
            </div>
  
            <div class="form-row">
              <div class="form-group half">
                <label for="expiryDate">Expiry Date *</label>
                <input
                  type="text"
                  id="expiryDate"
                  v-model="paymentData.expiryDate"
                  class="form-control"
                  :class="{ error: errors.expiryDate }"
                  placeholder="MM/YY"
                  @input="formatExpiryDate"
                  maxlength="5"
                />
                <div v-if="errors.expiryDate" class="error-message">
                  {{ errors.expiryDate }}
                </div>
              </div>
  
              <div class="form-group half">
                <label for="cvv">CVV *</label>
                <input
                  type="text"
                  id="cvv"
                  v-model="paymentData.cvv"
                  class="form-control"
                  :class="{ error: errors.cvv }"
                  placeholder="123"
                  maxlength="4"
                />
                <div v-if="errors.cvv" class="error-message">
                  {{ errors.cvv }}
                </div>
              </div>
            </div>
  
            <div class="form-group">
              <label for="billingAddress">Billing Address *</label>
              <input
                type="text"
                id="billingAddress"
                v-model="paymentData.billingAddress"
                class="form-control"
                :class="{ error: errors.billingAddress }"
                placeholder="Street Address"
              />
              <div v-if="errors.billingAddress" class="error-message">
                {{ errors.billingAddress }}
              </div>
            </div>
  
            <div class="form-row">
              <div class="form-group half">
                <label for="city">City *</label>
                <input
                  type="text"
                  id="city"
                  v-model="paymentData.city"
                  class="form-control"
                  :class="{ error: errors.city }"
                  placeholder="e.g. Singapore"
                />
                <div v-if="errors.city" class="error-message">
                  {{ errors.city }}
                </div>
              </div>
  
              <div class="form-group half">
                <label for="postalCode">Postal Code *</label>
                <input
                  type="text"
                  id="postalCode"
                  v-model="paymentData.postalCode"
                  class="form-control"
                  :class="{ error: errors.postalCode }"
                  placeholder="e.g. 123456"
                />
                <div v-if="errors.postalCode" class="error-message">
                  {{ errors.postalCode }}
                </div>
              </div>
            </div>
  
            <div class="payment-security">
              <div class="security-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div class="security-text">
                Your payment info is secure and encrypted
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
  
            <!-- Payment Buttons -->
            <div class="payment-actions">
              <button
                @click="goBack"
                class="btn btn-secondary"
              >
                Back
              </button>
  
              <button
                @click="processPayment"
                class="btn btn-primary"
                :disabled="isProcessing"
              >
                <span v-if="isProcessing" class="spinner"></span>
                Pay ${{ orderDetails.totalAmount }}
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
        isProcessing: false,
        paymentData: {
          cardholderName: '',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          billingAddress: '',
          city: '',
          postalCode: ''
        },
        orderDetails: {
          orderId: '',
          serviceName: '',
          pickupLocation: '',
          deliveryLocation: '',
          itemName: '',
          shippingCost: 0,
          totalAmount: 0
        },
        errors: {}
      }
    },
    created() {
      // Get order details from route params or local storage
      const orderData = this.$route.params.orderData || JSON.parse(localStorage.getItem('orderData'));
      
      if (orderData) {
        this.orderDetails = {
          orderId: orderData.orderId || 'N/A',
          serviceName: orderData.serviceName || 'Standard Delivery',
          pickupLocation: orderData.pickupLocation || 'N/A',
          deliveryLocation: orderData.deliveryLocation || 'N/A',
          itemName: orderData.itemName || 'Lost Item',
          shippingCost: parseFloat(orderData.price || 0).toFixed(2),
          totalAmount: parseFloat(orderData.price || 0).toFixed(2)
        };
      } else {
        // No order data, redirect back to logistics form
        this.$router.push('/logistics');
      }
    },
    methods: {
      formatCardNumber(e) {
        // Format card number with spaces after every 4 digits
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
          if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
          }
          formattedValue += value[i];
        }
        
        this.paymentData.cardNumber = formattedValue;
      },
      
      formatExpiryDate(e) {
        // Format expiry date as MM/YY
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        
        if (value.length > 2) {
          value = value.substring(0, 2) + '/' + value.substring(2);
        }
        
        this.paymentData.expiryDate = value;
      },
      
      goBack() {
        this.$router.push('/logistics');
      },
      
      validateForm() {
        this.errors = {};
        let isValid = true;
        
        if (!this.paymentData.cardholderName?.trim()) {
          this.errors.cardholderName = 'Cardholder name is required';
          isValid = false;
        }
        
        if (!this.paymentData.cardNumber?.trim()) {
          this.errors.cardNumber = 'Card number is required';
          isValid = false;
        } else if (this.paymentData.cardNumber.replace(/\s+/g, '').length < 15) {
          this.errors.cardNumber = 'Please enter a valid card number';
          isValid = false;
        }
        
        if (!this.paymentData.expiryDate?.trim()) {
          this.errors.expiryDate = 'Expiry date is required';
          isValid = false;
        } else if (!/^\d{2}\/\d{2}$/.test(this.paymentData.expiryDate)) {
          this.errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
          isValid = false;
        }
        
        if (!this.paymentData.cvv?.trim()) {
          this.errors.cvv = 'CVV is required';
          isValid = false;
        } else if (!/^\d{3,4}$/.test(this.paymentData.cvv)) {
          this.errors.cvv = 'Please enter a valid CVV';
          isValid = false;
        }
        
        if (!this.paymentData.billingAddress?.trim()) {
          this.errors.billingAddress = 'Billing address is required';
          isValid = false;
        }
        
        if (!this.paymentData.city?.trim()) {
          this.errors.city = 'City is required';
          isValid = false;
        }
        
        if (!this.paymentData.postalCode?.trim()) {
          this.errors.postalCode = 'Postal code is required';
          isValid = false;
        } else if (!/^\d{6}$/.test(this.paymentData.postalCode)) {
          this.errors.postalCode = 'Please enter a valid 6-digit postal code';
          isValid = false;
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
      
      async processPayment() {
        if (!this.validateForm()) {
          return;
        }
        
        this.isProcessing = true;
        this.errors.api = null;
        
        try {
          // In a real implementation, you would make an API call to your payment processing endpoint
          // For demo purposes, we'll simulate a successful payment after a delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Simulate a successful payment
          const paymentResult = {
            success: true,
            transactionId: 'TX' + Math.floor(Math.random() * 1000000000),
            message: 'Payment processed successfully'
          };
          
          if (paymentResult.success) {
            // Save payment confirmation to local storage
            localStorage.setItem('paymentConfirmation', JSON.stringify({
              orderId: this.orderDetails.orderId,
              transactionId: paymentResult.transactionId,
              amount: this.orderDetails.totalAmount,
              date: new Date().toISOString()
            }));
            
            // Redirect to confirmation page
            this.$router.push('/payment-success');
          } else {
            this.errors.api = paymentResult.message || 'Payment processing failed. Please try again.';
          }
        } catch (error) {
          console.error('Error processing payment:', error);
          this.errors.api = 'Network error when processing payment. Please try again later.';
        } finally {
          this.isProcessing = false;
        }
      }
    }
  }
  </script>
    
  <style scoped>
  .payment-container {
    max-width: 1000px;
    margin: 2rem auto;
  }
  
  .payment-title {
    font-size: 2rem;
    margin-bottom: .5rem;
    color: #111827;
  }
  
  .payment-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
  }
  
  .order-summary {
    flex: 1;
    min-width: 300px;
    padding: 2rem;
    background-color: #f9fafb;
    border-right: 1px solid #e5e7eb;
  }
  
  .summary-heading {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
    color: #111827;
  }
  
  .summary-items {
    margin-bottom: 2rem;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  
  .item-label {
    color: #6b7280;
    font-weight: 500;
  }
  
  .price-summary {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }
  
  .price-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .price-item.total {
    font-weight: 600;
    font-size: 1.1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #e5e7eb;
  }
  
  .payment-form {
    flex: 2;
    min-width: 400px;
    padding: 2rem;
  }
  
  .form-heading {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
    color: #111827;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .form-group.half {
    flex: 1;
    min-width: 0;
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
  
  .card-input-wrapper {
    position: relative;
  }
  
  .card-icons {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 0.5rem;
  }
  
  .card-icon {
    height: 24px;
    width: auto;
    opacity: 0.5;
  }
  
  .payment-security {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 0.375rem;
    color: #4b5563;
  }
  
  .security-icon {
    margin-right: 0.75rem;
    color: #10b981;
  }
  
  .security-text {
    font-size: 0.875rem;
  }
  
  .api-error {
    display: flex;
    align-items: flex-start;
    padding: 0.75rem;
    background-color: #fee2e2;
    border-radius: 0.375rem;
    margin-bottom: 1.5rem;
  }
  
  .error-icon {
    margin-right: 0.75rem;
    color: #ef4444;
    flex-shrink: 0;
  }
  
  .payment-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
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
  
  @media (max-width: 768px) {
    .payment-card {
      flex-direction: column;
    }
    
    .order-summary {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .form-row {
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-group.half {
      width: 100%;
    }
  }
  </style>