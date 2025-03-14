<template>
    <div class="home-container">
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Lost Something? Found Something?</h1>
            <p class="hero-subtitle">
              Our platform connects people who lost items with people who found them.
            </p>
            <div class="hero-actions">
              <router-link to="/report-lost" class="btn btn-primary">Report Lost Item</router-link>
              <router-link to="/report-found" class="btn btn-secondary">Report Found Item</router-link>
            </div>
          </div>
        </div>
      </section>
      
      <section class="how-it-works">
        <div class="container">
          <h2 class="section-title">How It Works</h2>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <h3 class="step-title">Report</h3>
              <p class="step-description">
                Report your lost or found item with details and photos.
              </p>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <h3 class="step-title">Match</h3>
              <p class="step-description">
                Our system matches lost and found items automatically.
              </p>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <h3 class="step-title">Retrieve</h3>
              <p class="step-description">
                Arrange pickup or delivery to get your item back.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="statistics">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-card">
              <h3 class="stat-number">2,500+</h3>
              <p class="stat-label">Items Recovered</p>
            </div>
            <div class="stat-card">
              <h3 class="stat-number">95%</h3>
              <p class="stat-label">Match Rate</p>
            </div>
            <div class="stat-card">
              <h3 class="stat-number">10,000+</h3>
              <p class="stat-label">Happy Users</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomeView'
  }
  </script>
  
  <style scoped>
  .home-container {
    padding-bottom: 4rem;
  }
  
  .hero {
    background-color: #f8fafc;
    padding: 6rem 0;
    text-align: center;
  }
  
  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .hero-title {
    font-size: 3rem;
    color: #111827;
    margin-bottom: 1rem;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
    color: #4b5563;
    margin-bottom: 2.5rem;
  }
  
  .hero-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-weight: 500;
    text-align: center;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background-color: #111827;
    color: white;
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
  
  .how-it-works {
    padding: 5rem 0;
  }
  
  .section-title {
    text-align: center;
    font-size: 2.25rem;
    color: #111827;
    margin-bottom: 3rem;
  }
  
  .steps {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
  }
  
  .step {
    flex: 1;
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background-color: #111827;
    color: white;
    font-weight: bold;
    font-size: 1.25rem;
    margin: 0 auto 1.5rem;
  }
  
  .step-title {
    font-size: 1.5rem;
    color: #111827;
    margin-bottom: 1rem;
  }
  
  .step-description {
    color: #4b5563;
  }
  
  .statistics {
    background-color: #f8fafc;
    padding: 5rem 0;
  }
  
  .stats-grid {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
  }
  
  .stat-card {
    flex: 1;
    text-align: center;
    padding: 3rem 2rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #111827;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    color: #4b5563;
    font-size: 1.125rem;
  }
  
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.25rem;
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
    }
    
    .steps, .stats-grid {
      flex-direction: column;
    }
    
    .step, .stat-card {
      width: 100%;
    }
  }
  </style>