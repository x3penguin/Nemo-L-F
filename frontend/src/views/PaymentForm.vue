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

          <!-- Cardholder Name -->
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

          <!-- Stripe Elements -->
          <div class="form-group">
            <label for="card-element">Card Details *</label>
            <!-- Stripe Elements container -->
            <div id="card-element" class="form-control"></div> 
            <!-- Error message for card details -->
            <div v-if="errors.cardDetails" class="error-message">
              {{ errors.cardDetails }}
            </div>
          </div>

          <!-- Billing Address -->
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

          <!-- City and Postal Code -->
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

          <!-- Payment Security -->
          <div class="payment-security">
            Your payment info is secure and encrypted.
          </div>

          <!-- Payment Buttons -->
          <div class="payment-actions">
            <!-- Back Button -->
            <button @click.prevent="$router.push('/logistics-form')" 
                    type='button' 
                    class='btn btn-secondary'>
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
import { loadStripe } from '@stripe/stripe-js';
import {jwtDecode} from 'jwt-decode';

export default {
  data() {
    return {
      isProcessing: false,
      paymentData: {
        cardholderName: '',
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
      errorMessage: '',
      errors: {},
      stripe: null,
      cardElement: null
    };
  },
  async created() {
    if (!this.checkUserToken()) {
      this.$router.push('/login');
      return;
    }

    const orderData = this.$route.params.orderData || JSON.parse(localStorage.getItem('orderData'));
    if (!orderData) {
      this.$router.push('/logistics');
      return;
    }

    this.orderDetails = {
      orderId: orderData.orderId || 'N/A',
      serviceName: orderData.serviceName || 'Standard Delivery',
      pickupLocation: orderData.pickupLocation || 'N/A',
      deliveryLocation: orderData.deliveryLocation || 'N/A',
      itemName: orderData.itemName || 'Lost Item',
      shippingCost: 10.00,
      totalAmount: 50.00
    };

    try {
      this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_KEY);
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
        classes: { base: 'stripe-card-element' }
      });
      this.$nextTick(() => {
        this.cardElement.mount('#card-element');
      });
    } catch (error) {
      console.error('Stripe initialization failed:', error);
      this.errors.api = 'Payment system unavailable';
    }
  },
  methods: {
    checkUserToken() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    console.error('User token not found in localStorage');
    return false;
  }
  try {
    const decodedToken = jwtDecode(user.token);

    const userId = decodedToken.id || decodedToken.userId || decodedToken.sub || decodedToken.uid;
    if (userId) {

      return true;
    } else {
      console.warn('No user ID found in token');
      return false;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
}
,
getUserIdFromToken(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.id || decoded.userId || decoded.sub || decoded.uid || null;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
},
    goBack() {
      this.$router.push('/logistics-form');
    },
    validateForm() {
      this.errors = {};
      let isValid = true;

      const fields = {
        cardholderName: 'Cardholder name is required',
        billingAddress: 'Billing address is required',
        city: 'City is required',
        postalCode: {
          check: () => /^\d{6}$/.test(this.paymentData.postalCode),
          message: 'Valid 6-digit postal code required'
        }
      };

      Object.entries(fields).forEach(([field, rule]) => {
        const value = this.paymentData[field]?.trim();
        if (!value) {
          this.errors[field] = typeof rule === 'string' ? rule : rule.message;
          isValid = false;
        } else if (typeof rule === 'object' && !rule.check()) {
          this.errors[field] = rule.message;
          isValid = false;
        }
      });

      if (!isValid) {
        this.$nextTick(() => {
          const firstError = document.querySelector('.error-message');
          firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      return isValid;
    },
    async processPayment() {
  if (!this.checkUserToken()) {
    this.errors.api = 'User authentication failed';
    return;
  }
  if (!this.validateForm()) return;

  this.isProcessing = true;
  this.errors.api = null;

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) throw new Error('Authentication required');

    const userId = this.getUserIdFromToken(user.token);
    if (!userId) throw new Error('User identification failed');

    // 1. Create Payment Intent in OutSystems
    const createPaymentResponse = await fetch('https://personal-kbjnamsn.outsystemscloud.com/NEMOPaymentService/rest/paymentAPI/create-payment-intent', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({
        userId,
        amount: Math.round(this.orderDetails.totalAmount * 100) // Ensure it's in cents
      })
    });

    // Handle non-JSON responses
    const responseText = await createPaymentResponse.text();
    console.log('Raw response from OutSystems API:', responseText); // Log the raw response
    let paymentData;
    try {
      paymentData = JSON.parse(responseText);
    } catch (e) {
      console.error('Invalid JSON response:', responseText);
      throw new Error('Invalid server response');
    }

    if (!createPaymentResponse.ok) {
      throw new Error(paymentData.message || 'Payment initialization failed');
    }

    // 2. Check for the payment intent ID from OutSystems
    if (!paymentData.paymentIntentId) {

      throw new Error('Missing Stripe payment ID in response');
    }

    // 3. Confirm the payment intent with the Stripe Connector (Replace with Stripe's own method)
    const {error: stripeError,  paymentIntent } = await this.stripe.confirmCardPayment(
      paymentData.clientSecret, // Corrected variable
      {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.paymentData.cardholderName.trim(),
            address: {
              line1: this.paymentData.billingAddress.trim(),
              city: this.paymentData.city.trim(),
              postal_code: this.paymentData.postalCode.trim()
            }
          }
        }
      }
    );
    if (stripeError) {
  throw stripeError; // This will be caught in the catch block
}
   
    if (paymentIntent.status === 'succeeded') {
      // Payment was successful
      this.$router.push({
        path: '/PaymentResult',
        query: {
          status: 'success',
          paymentId: paymentData.paymentIntentId,
          amount: this.orderDetails.totalAmount
        }
      });
    } else {
    // Redirect for non-success statuses
    this.$router.push({
        path: '/PaymentResult',
        query: {
          status: 'fail',
          errorMessage: `Payment status: ${paymentIntent.status}`,
          paymentId: paymentIntent.id,
          amount: this.orderDetails.totalAmount
        }
      });
      return; // Exit after redirect
    }
  } catch (error) {
    console.error('Payment Error:', error);
    const paymentId = error.paymentIntent?.id || '';
    this.$router.push({
      path: '/PaymentResult',
      query: {
        status: 'fail',
        errorMessage: error.message || 'Payment processing failed',
        paymentId: paymentId,
        amount: this.orderDetails.totalAmount
      }
    });
  } finally {
    this.isProcessing = false;
  }
}
  }}
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