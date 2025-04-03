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
                {{ Math.round(getConfidence(item)) }}% Match
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

              <div class="button-group">
                <button @click="viewDetails(item)" class="btn btn-primary">
                  View Details
                </button>
                <button @click="chatWithFinder(item)" class="btn btn-secondary">
                  Chat with Finder
                </button>
                <button
                  @click="confirmMatch(item)"
                  class="btn btn-success mt-2"
                >
                  Confirm This Is My Item
                </button>
              </div>
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
import { useStore } from "vuex";
import axios from "axios";

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
    const store = useStore();

    const formatDate = (dateTime) => {
      if (!dateTime) return "N/A";

      // Handle Firebase timestamp
      if (dateTime.seconds) {
        const date = new Date(dateTime.seconds * 1000);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      // Handle regular date string
      const date = new Date(dateTime);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Function to initiate chat with finder
    const chatWithFinder = (item) => {
      if (!item || !item.id) {
        console.error("Cannot chat: Invalid item data");
        return;
      }

      // Store information about which item we're chatting about
      localStorage.setItem(
        "chatItem",
        JSON.stringify({
          itemId: item.id,
          itemName: item.name,
          finderId: item.finderId || item.reportOwner,
        })
      );

      // Navigate to chat page
      router.push("/chat");
    };

    const getConfidence = (item) => {
      // Check for confidence value in order of priority

      // 1. First prioritize confidence directly from potential_matches
      if (item.confidence !== undefined && item.confidence !== null) {
        return parseFloat(item.confidence);
      }

      // If no confidence value found, return a reasonable default
      console.warn("No confidence value found for item:", item.id);
      return 75; // Lower default value to make it clear it's not from database
    };

    const confirmMatch = async (item) => {
      if (!item) return;

      if (!confirm("Are you sure this is your lost item?")) {
        return;
      }

      try {
        // We need the IDs of both items
        const lostItemId = item.sourceItemId; // The source item is the lost item
        const foundItemId = item.id; // The current item is the found item

        // First, check if both IDs are valid
        if (!lostItemId || !foundItemId) {
          alert("Unable to confirm match: missing item information");
          return;
        }

        const currentUser = store.getters["auth/user"];
        if (!currentUser) {
          alert("You must be logged in to confirm a match");
          return;
        }

        // Get user email for notification purposes
        let userEmail = currentUser.email;
        if (!userEmail) {
          console.warn("User email not found in store, using fallback");
          userEmail = "user@example.com"; // Fallback email
        }

        // Call the API to confirm the match
        const response = await axios.post(
          "http://localhost:8000/user/api/test/create-match",
          {
            lostItemId,
            foundItemId,
            confidence: item.confidence || 90,
          }
        );

        if (response.data.success) {
          // Show simple notification
          store.dispatch("notifications/add", {
            type: "success",
            message: `${item.name} has been matched! Go to the Collections page to arrange collection.`,
            isPersistent: true,
          });

          try {
            await axios.post("http://localhost:8000/email/api/found-items/notify", {
              itemId: foundItemId,
              itemName: item.name || "Found Item",
              itemDescription: item.description || "No description",
              ownerEmail: userEmail,
            });
          } catch (emailErr) {
            console.error("Error sending email notification:", emailErr);
          }

          // Redirect to collections page
          router.push("/collections");
        } else {
          throw new Error(response.data.error || "Failed to confirm match");
        }
      } catch (error) {
        console.error("Error confirming match:", error);
        alert("Failed to confirm match: " + (error.message || "Unknown error"));
      }
    };

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

      // Make sure we're using the ID of the potential match item, not the source item
      console.log("Viewing details for item:", item.id);

      // Navigate to item details with the correct ID
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

    return {
      currentIndex,
      nextSlide,
      prevSlide,
      goToSlide,
      viewDetails,
      handleImageError,
      truncateDescription,
      formatDate,
      confirmMatch,
      getConfidence,
      chatWithFinder,
    };
  },
};
</script>

<style scoped>
.btn-success {
  background-color: #10b981;
  color: white;
  border: none;
}

.btn-success:hover {
  background-color: #059669;
}

.mt-2 {
  margin-top: 0.5rem;
}

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

.item-actions {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover {
  background-color: #1f2937;
}

.btn-secondary {
  background-color: #4b5563;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #374151;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 0.75rem;
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
