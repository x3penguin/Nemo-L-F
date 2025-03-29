<template>
    <div class="payment-container" >
      <!-- Success state -->
      <div class ="payment-success-page" v-if="paymentStatus === 'success'">
       <!-- Header Section -->
    <h1 class="success-header">🎉 Payment Successful!🎉 </h1>
    <p class="success-subtext">Thank you for your purchase. Your payment has been processed successfully.</p>

    <!-- Transaction Details -->
    <div class="transaction-details">
      <p><strong>Payment ID:</strong> {{ paymentId }}</p>
      <p><strong>Amount Paid:</strong> ${{ amount }}</p>

    </div>
       <div class="action-buttons">
            <button @click.prevent="$router.push('/collections')" 
                        type='button' 
                        class='btn btn-primary'>
                        Back to collections
                 </button>
       </div>
      </div>
  
      <!-- Failure state -->
      <div v-else class ="payment-success-page">
        <h1 >Payment Failed</h1>
        <h3 class="error-message">Error: {{ errorMessage }}</h3>
        <div class="action-buttons">
            <button @click.prevent="$router.push('/collections')" 
                        type='button' 
                        class='btn btn-primary'>
                        Back to collections
                 </button>
       </div>
      </div>
  
     
    </div>
  </template>
  
  <script>
 export default {
  computed: {
    // Retrieve query parameters from the route
    paymentStatus() {
      return this.$route.query.status || 'default'; // Default state if no status is provided
    },
    paymentId() {
      return this.$route.query.paymentId || null; // Default to null if not provided
    },
    amount() {
      return this.$route.query.amount || null; // Default to null if not provided
    },
    errorMessage() {
      return this.$route.query.errorMessage || 'An unexpected error occurred.'; // Default error message
    },
  },
  methods: {
    retryPayment() {
      // Logic for retrying the payment (e.g., redirecting back to the checkout page)
      this.$router.push('/checkout'); // Redirect to checkout page
    },
  },
};
  </script>
  <style>
  
  .payment-container {
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  height: 100vh; /* Full viewport height */
  background-color: #f9f9f9; /* Light background color */
}
  
.payment-success-page {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
 
}
.error-message {
  color: red; /* Make the text red */
  
}
.success-header {
  font-size: 2rem;
  color: #2c3e50;
}

.success-subtext {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.transaction-details {
  margin-top: 1.5rem;
  font-size: 1rem;
}

.transaction-details p {
  margin: 0.5rem 0;
}

.action-buttons {
  margin-top: 2rem;
}

.btn-primary {
    background-color: #111827;
    color: white;
}
.btn-primary:hover {
    background-color: #1f2937;
  }
  

  </style>