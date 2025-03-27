<template>
  <div class="match-carousel">
    <div class="carousel-container">
      <!-- Left arrow navigation -->
      <button
        v-if="items && items.length > 1"
        class="carousel-arrow carousel-arrow-left"
        @click="prevSlide"
        :disabled="currentIndex === 0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Carousel slides -->
      <div class="carousel-slides">
        <div
          v-for="(item, index) in items || []"
          :key="item.id"
          class="carousel-slide"
          :class="{ active: index === currentIndex }"
        >
          <div class="carousel-item">
            <div class="item-image">
              <img
                :src="item.imageUrl || '/img/placeholder-image.jpg'"
                :alt="item.name"
                @error="handleImageError"
              />
              <div class="match-confidence">
                {{ Math.round(item.confidence) }}% Match
              </div>
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-category">{{ item.category }}</p>
              <p class="item-description">
                {{ truncateDescription(item.description) }}
              </p>
              <p class="item-location">Location: {{ item.location }}</p>
              <p class="item-date">{{ formatDate(item.dateTime) }}</p>

              <button @click="viewDetails(item)" class="btn btn-primary mt-3">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right arrow navigation -->
      <button
        v-if="items && items.length > 1"
        class="carousel-arrow carousel-arrow-right"
        @click="nextSlide"
        :disabled="currentIndex === (items ? items.length - 1 : 0)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Slide indicators -->
    <div v-if="items && items.length > 1" class="carousel-indicators">
      <button
        v-for="(item, index) in items"
        :key="`indicator-${index}`"
        class="carousel-indicator"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
      ></button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "MatchCarousel",
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const router = useRouter();
    const currentIndex = ref(0);

    onMounted(() => {
      // Reset the index when items change
      currentIndex.value = 0;
    });

    const nextSlide = () => {
      if (props.items && currentIndex.value < props.items.length - 1) {
        currentIndex.value++;
      }
    };

    const prevSlide = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
      }
    };

    const goToSlide = (index) => {
      currentIndex.value = index;
    };

    const viewDetails = (item) => {
      if (!item) return;
      // Navigate to item details, passing the source item ID
      router.push({
        path: `/items/${item.id}`,
        query: {
          sourceId: item.sourceItemId || "",
        },
      });
    };

    const handleImageError = (event) => {
      event.target.src = "/img/placeholder-image.jpg";
    };

    const truncateDescription = (description, maxLength = 100) => {
      if (!description) return "";
      if (description.length <= maxLength) return description;
      return description.substring(0, maxLength) + "...";
    };

    const formatDate = (dateTime) => {
      if (!dateTime) return "N/A";

      // Handle Firebase timestamp
      if (dateTime.seconds) {
        const date = new Date(dateTime.seconds * 1000);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      // Handle regular date string
      const date = new Date(dateTime);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    return {
      currentIndex,
      nextSlide,
      prevSlide,
      goToSlide,
      viewDetails,
      handleImageError,
      truncateDescription,
      formatDate,
    };
  },
};
</script>

<style scoped>
.match-carousel {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.carousel-slides {
  width: 100%;
  display: flex;
  overflow: hidden;
}

.carousel-slide {
  width: 100%;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
  display: none;
}

.carousel-slide.active {
  opacity: 1;
  display: block;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.carousel-arrow:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.carousel-arrow:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.carousel-arrow-left {
  left: -20px;
}

.carousel-arrow-right {
  right: -20px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.carousel-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e5e7eb;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.carousel-indicator.active {
  background-color: #111827;
}

.carousel-item {
  display: flex;
  padding: 1.5rem;
}

.item-image {
  width: 300px;
  height: 300px;
  position: relative;
  flex-shrink: 0;
  margin-right: 1.5rem;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.match-confidence {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #111827;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.item-category {
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.item-description {
  color: #4b5563;
  margin-bottom: 1rem;
}

.item-location,
.item-date {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;
}

.btn-primary {
  background-color: #111827;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #1f2937;
}

.mt-3 {
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .carousel-item {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .carousel-arrow {
    width: 32px;
    height: 32px;
  }

  .carousel-arrow-left {
    left: 10px;
  }

  .carousel-arrow-right {
    right: 10px;
  }
}
</style>
