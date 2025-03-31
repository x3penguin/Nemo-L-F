<template>
  <div class="container">
    <div class="chat-container">
      <div class="chat-sidebar">
        <h2 class="sidebar-title">Conversations</h2>
        <div v-if="isLoading" class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading conversations...</p>
        </div>
        <div v-else-if="error" class="error-message">
          {{ error }}
          <button @click="loadChats" class="btn btn-sm">Retry</button>
        </div>
        <div v-else-if="conversations.length === 0" class="empty-state">
          <p>No active conversations.</p>
          <p>Start a chat from the Potential Matches page.</p>
        </div>
        <div v-else class="conversation-list">
          <div
            v-for="chat in conversations"
            :key="chat.id"
            class="conversation-item"
            :class="{ active: selectedChat && selectedChat.id === chat.id }"
            @click="selectChat(chat)"
          >
            <div class="conversation-avatar">
              {{ getInitials(getOtherParticipantName(chat)) }}
            </div>
            <div class="conversation-details">
              <div class="conversation-name">
                {{ getOtherParticipantName(chat) }}
              </div>
              <div class="conversation-preview">
                {{ chat.lastMessage || "No messages yet" }}
              </div>
            </div>
            <div class="conversation-meta">
              <div v-if="chat.lastMessageTime" class="conversation-time">
                {{ formatTime(chat.lastMessageTime) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-content">
        <div v-if="!selectedChat" class="chat-placeholder">
          <div class="placeholder-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              ></path>
            </svg>
          </div>
          <h3>Select a conversation</h3>
          <p>Or start a new one from the Potential Matches page</p>
        </div>

        <div v-else class="chat-conversation">
          <div class="conversation-header">
            <div class="participant-info">
              <div class="participant-avatar">
                {{ getInitials(getOtherParticipantName(selectedChat)) }}
              </div>
              <div class="participant-details">
                <div class="participant-name">
                  {{ getOtherParticipantName(selectedChat) }}
                </div>
                <div class="item-name">
                  {{ selectedChat.itemName || "Item discussion" }}
                </div>
              </div>
            </div>
          </div>

          <div class="messages-container" ref="messagesContainer">
            <div v-if="loadingMessages" class="loading-spinner center">
              <div class="spinner"></div>
              <p>Loading messages...</p>
            </div>
            <div v-else-if="messages.length === 0" class="empty-messages">
              <p>No messages yet.</p>
              <p>Start the conversation by sending a message below.</p>
            </div>
            <div v-else class="messages">
              <div
                v-for="message in messages"
                :key="message.id"
                class="message"
                :class="{
                  'message-received': message.sender !== currentUserId,
                  'message-sent': message.sender === currentUserId,
                }"
              >
                <div class="message-content">
                  {{ message.content }}
                </div>
                <div class="message-time">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </div>
          </div>

          <div class="message-composer">
            <textarea
              v-model="newMessage"
              class="message-input"
              placeholder="Type your message..."
              @keydown.enter.prevent="sendMessage"
            ></textarea>
            <button
              @click="sendMessage"
              class="send-button"
              :disabled="!newMessage.trim()"
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
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick, onUnmounted } from "vue";
import { useStore } from "vuex";
import chatService from "@/services/chat.service";

export default {
  name: "ChatView",
  setup() {
    // const isLoadingParticipant = ref({});
    const store = useStore();
    const conversations = ref([]);
    const selectedChat = ref(null);
    const messages = ref([]);
    const newMessage = ref("");
    const isLoading = ref(true);
    const loadingMessages = ref(false);
    const error = ref(null);
    const messagesContainer = ref(null);
    let messageSubscription = null;

    const currentUserId = computed(() => {
      const user = store.getters["auth/user"];
      return user?.id || "";
    });

    const participants = ref({});

    const loadChats = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        // Load chats from Firebase
        const chats = await chatService.getChats();
        conversations.value = chats;

        // Check if we have a chat item in localStorage (from potential matches)
        const chatItem = JSON.parse(localStorage.getItem("chatItem") || "null");

        if (chatItem && chatItem.itemId && chatItem.finderId) {
          try {
            // Create or get existing chat
            const chat = await chatService.createChat(
              chatItem.itemId,
              chatItem.finderId
            );

            // Check if this chat is already in our list
            const existingChat = conversations.value.find(
              (c) => c.id === chat.id
            );
            if (!existingChat) {
              conversations.value = [chat, ...conversations.value];
            }

            // Select this chat
            selectChat(existingChat || chat);

            // Clear from localStorage
            localStorage.removeItem("chatItem");
          } catch (chatError) {
            console.error("Error creating chat from item:", chatError);
          }
        }

        // Load participant details for each chat
        await loadParticipants();
      } catch (err) {
        console.error("Error loading chats:", err);
        error.value = "Failed to load conversations. Please try again.";
      } finally {
        isLoading.value = false;
      }
    };

    const loadParticipants = async () => {
      // Get participant details for each chat
      for (const chat of conversations.value) {
        if (!chat.participants) continue; // Skip if participants array is missing

        for (const participantId of chat.participants) {
          if (
            participantId &&
            participantId !== currentUserId.value &&
            !participants.value[participantId]
          ) {
            try {
              const user = await chatService.getUserInfo(participantId);
              participants.value[participantId] = user;
            } catch (err) {
              console.error(`Error loading participant ${participantId}:`, err);
              // Use a fallback name
              participants.value[participantId] = {
                id: participantId,
                name: `User ${participantId.substring(0, 4) || "Unknown"}`,
              };
            }
          }
        }
      }
    };

    const startChat = async (itemId) => {
      try {
        const chat = await chatService.createChat(itemId);
        // Select this chat once created
        selectChat(chat);
      } catch (error) {
        console.error("Error starting chat:", error);
      }
    };

    const selectChat = async (chat) => {
      // Unsubscribe from previous chat if any
      if (messageSubscription) {
        messageSubscription();
        messageSubscription = null;
      }

      selectedChat.value = chat;
      loadingMessages.value = true;
      messages.value = [];

      try {
        // Subscribe to messages for this chat
        messageSubscription = chatService.subscribeToMessages(
          chat.id,
          (newMessages) => {
            messages.value = newMessages;
            loadingMessages.value = false;

            // Scroll to bottom of messages
            nextTick(() => {
              scrollToBottom();
            });
          }
        );
      } catch (err) {
        console.error("Error loading messages:", err);
        loadingMessages.value = false;
      }
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !selectedChat.value) return;

      try {
        // Send message to Firebase
        await chatService.sendMessage(
          selectedChat.value.id,
          newMessage.value.trim()
        );

        // Clear input
        newMessage.value = "";

        // Scroll to bottom (will happen automatically from the subscription)
      } catch (err) {
        console.error("Error sending message:", err);
        // Show error to user
        store.dispatch("notifications/add", {
          type: "error",
          message: "Failed to send message. Please try again.",
        });
      }
    };

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    };

    const getInitials = (name) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

    const getOtherParticipantName = (chat) => {
      if (!chat || !chat.participants || !Array.isArray(chat.participants)) {
        console.log("Missing chat data:", chat);
        return "Unknown";
      }

      // Get current user ID from the store
      const userId = currentUserId.value;
      console.log("Current user ID from store:", userId);
      console.log("Chat participants:", chat.participants);

      // Sometimes IDs might be stored differently in different places
      // For debugging, log comparison results:
      console.log(
        "Participants check:",
        chat.participants.map((id) => ({
          id,
          matches: id === userId,
          stringComparison: id.toString() === userId.toString(),
        }))
      );

      // Try string comparison to avoid type issues
      const otherId = chat.participants.find(
        (id) => id.toString() !== userId.toString()
      );

      console.log("Other participant ID determined as:", otherId);

      if (!otherId) return "Unknown";

      const participant = participants.value[otherId];

      if (!participant) {
        // If we don't have the user info, fetch it now
        chatService
          .getUserInfo(otherId)
          .then((user) => {
            participants.value[otherId] = user;
          })
          .catch((err) => console.error("Error loading participant:", err));

        return "Loading...";
      }

      return participant.name || `User ${otherId.substring(0, 4)}`;
    };

    const formatTime = (timestamp) => {
      if (!timestamp) return "";

      const date = new Date(timestamp);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        // Today - show time
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (diffInDays === 1) {
        // Yesterday
        return "Yesterday";
      } else if (diffInDays < 7) {
        // This week - show day name
        return date.toLocaleDateString([], { weekday: "short" });
      } else {
        // Older - show date
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    };

    onMounted(() => {
      loadChats();
    });

    onUnmounted(() => {
      // Cleanup subscription when component is destroyed
      if (messageSubscription) {
        messageSubscription();
      }
    });

    return {
      conversations,
      selectedChat,
      messages,
      newMessage,
      isLoading,
      loadingMessages,
      error,
      messagesContainer,
      currentUserId,
      loadChats,
      selectChat,
      sendMessage,
      getInitials,
      getOtherParticipantName,
      formatTime,
      scrollToBottom,
      startChat,
    };
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 100px);
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 2rem 0;
}

.chat-sidebar {
  width: 300px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  padding: 1.25rem;
  font-size: 1.25rem;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
  margin: 0;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.conversation-item:hover {
  background-color: #f9fafb;
}

.conversation-item.active {
  background-color: #f3f4f6;
}

.conversation-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background-color: #111827;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 0.75rem;
}

.conversation-details {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-preview {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 0.5rem;
}

.conversation-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.unread-badge {
  background-color: #111827;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  min-width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.25rem;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chat-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.placeholder-icon {
  color: #d1d5db;
  margin-bottom: 1.5rem;
}

.conversation-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.participant-info {
  display: flex;
  align-items: center;
}

.participant-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #111827;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 0.75rem;
}

.participant-details {
  flex: 1;
}

.participant-name {
  font-weight: 500;
  color: #111827;
}

.item-name {
  font-size: 0.875rem;
  color: #6b7280;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f9fafb;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  max-width: 75%;
  display: flex;
  flex-direction: column;
}

.message-received {
  align-self: flex-start;
}

.message-sent {
  align-self: flex-end;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  word-break: break-word;
}

.message-received .message-content {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 0;
  color: #111827;
}

.message-sent .message-content {
  background-color: #111827;
  color: white;
  border-bottom-right-radius: 0;
}

.message-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  align-self: flex-end;
}

.message-composer {
  padding: 1rem;
  display: flex;
  align-items: center;
  background-color: white;
  border-top: 1px solid #e5e7eb;
}

.message-input {
  flex: 1;
  resize: none;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 1.5rem;
  min-height: 2.5rem;
  max-height: 9rem;
  overflow-y: auto;
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #111827;
}

.send-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #111827;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #1f2937;
}

.send-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.loading-spinner.center {
  justify-content: center;
  height: 100%;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(17, 24, 39, 0.1);
  border-radius: 50%;
  border-top-color: #111827;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  color: #ef4444;
  padding: 1rem;
}

.empty-state,
.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.btn {
  background-color: #111827;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.btn-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    height: calc(100vh - 64px);
  }

  .chat-sidebar {
    width: 100%;
    height: 30%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .chat-content {
    height: 70%;
  }
}
</style>
