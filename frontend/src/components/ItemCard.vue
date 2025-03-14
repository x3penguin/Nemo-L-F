<template>
    <div class="item-card" @click="cardClick">
      <div class="item-image">
        <img :src="imageUrl" :alt="item.name">
        <div class="item-status" :class="getStatusClass">
          {{ formatStatus }}
        </div>
      </div>
      <div class="item-details">
        <h3 class="item-name">{{ item.name }}</h3>
        <p class="item-location">{{ item.venue }}</p>
        <p class="item-date">{{ formattedDate }}</p>
      </div>
      <div class="item-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ItemCard',
    props: {
      item: {
        type: Object,
        required: true
      }
    },
    computed: {
      imageUrl() {
        return this.item.image_url || '/img/placeholder-image.jpg';
      },
      formatStatus() {
        const statusMap = {
          'LOST': 'Lost',
          'FOUND': 'Found',
          'MATCHED': 'Matched',
          'COLLECTING': 'Collecting',
          'RETRIEVED': 'Retrieved'
        };
        return statusMap[this.item.status] || this.item.status;
      },
      getStatusClass() {
        return `status-${this.item.status.toLowerCase()}`;
      },
      formattedDate() {
        const date = this.item.report_date ? new Date(this.item.report_date) : new Date();
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    },
    methods: {
      cardClick() {
        this.$emit('click', this.item);
      }
    }
  }
  </script>
  
  <style scoped>
  .item-card {
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  
  .item-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .item-image {
    position: relative;
    height: 200px;
    overflow: hidden;
  }
  
  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .item-status {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
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
  
  .item-details {
    padding: 1rem;
    flex-grow: 1;
  }
  
  .item-name {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
  
  .item-location, .item-date {
    margin: 0.25rem 0;
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .item-actions {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }
  </style>