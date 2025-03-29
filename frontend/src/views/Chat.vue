<template>
    <div class="chat-container">
      <div class="chat-header">
        <h1 class="chat-title">Messages</h1>
        <p class="chat-subtitle">Connect with item finders and owners</p>
      </div>
      
      <div class="chat-list">
        <div
          v-for="chat in chats"
          :key="chat.id"
          class="chat-preview"
          @click="selectChat(chat)"
        >
          <div class="chat-participant">
            {{ chat.participants.find(p => p !== userId) || "Unknown user" }}
          </div>
          <div class="chat-snippet">
            <div class="last-message">{{ chat.lastMessage }}</div>
            <div class="timestamp">{{ formatTime(chat.lastMessageTime) }}</div>
          </div>
        </div>
      </div>
      
      <div class="chat-content">
        <div v-if="activeChat" class="chat-conversation">
          <div class="chat-conversation-header">
            <div class="chat-avatar">{{ getInitials(activeChat.name) }}</div>
            <div class="chat-info">
              <h3 class="chat-name">{{ activeChat.name }}</h3>
              <p class="chat-status">{{ activeChat.itemName }}</p>
            </div>
          </div>
          
          <!-- <div class="chat-messages">
            <div v-for="(message, index) in activeChat.messages" 
                 :key="index" 
                 class="chat-message"
                 :class="{ 'chat-message-mine': message.isMine }">
              <div class="chat-message-content">{{ message.text }}</div>
              <div class="chat-message-time">{{ message.time }}</div>
            </div>
          </div> -->

          <div class="chat-window" v-if="selectedChat">
            <div class="chat-header">
              Chat with: {{ selectedChat.participants.find(p => p !== userId) }}
            </div>
            <div class="messages">
              <div
                v-for="message in messages"
                :key="message.id"
                :class="['message', message.sender === userId ? 'sent' : 'received']"
              >
                <div class="content">{{ message.content }}</div>
                <div class="timestamp">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
          </div>
          
          <div class="chat-input-container">
            <textarea 
              class="chat-input" 
              placeholder="Type your message..." 
              v-model="newMessage"
              @keyup.enter.prevent="sendMessage"
            ></textarea>
            <button class="chat-send-btn" @click="sendMessage">Send</button>
          </div>
        </div>
        
        <div v-else class="chat-placeholder">
          <div class="chat-placeholder-content">
            <h2>Select a conversation</h2>
            <p>Choose a conversation from the list to start chatting</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
import axios from 'axios';
import { auth } from "@/services/firebase";
// import { onAuthStateChanged } from "firebase/auth";

if (auth.currentUser) {
  auth.currentUser.getIdToken().then((token) => {
    console.log("Firebase ID Token:", token); // Use this in Postman
  });
} else {
  console.error("No user is currently signed in.");
}

export default {
  data() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user)
  return {
    userId: user?.id || null,
    token: user?.token || null,
    chats: [],
    messages: [],
    selectedChat: null,
    newMessage: ""
  };
},
mounted() {
  // onAuthStateChanged(auth, async (user) => {
  //   console.log(auth)
  //   console.log("Current user:", auth.currentUser);
  //   if (user) {
  //     const idToken = await user.getIdToken();
  //     const userId = user.uid;

  //     console.log("User logged in:", userId);
  //     console.log("Firebase ID token:", idToken);

  //     // Store in localStorage
  //     localStorage.setItem("idToken", idToken);
  //     localStorage.setItem("userId", userId);

  //     // Assign to Vue state
  //     this.token = idToken;
  //     this.userId = userId;

  //     // Now fetch chats AFTER token is ready
  //     this.fetchChats();
  //   } else {
  //     console.error("No user is currently logged in.");
  //   }
  // });

  },
  methods: {
    async fetchChats() {
      try {
        const response = await axios.get("http://localhost:8000/chat", {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.chats = response.data;
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    },
    async selectChat(chat) {
      this.selectedChat = chat;
      try {
        const response = await axios.get(`http://localhost:8000/chat/${chat.id}`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.messages = response.data.messages;
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    },
    async sendMessage() {
      if (!this.newMessage || !this.selectedChat) return;

      try {
        const payload = {
          chat_id: this.selectedChat.id,
          receiver_id: this.selectedChat.participants.find(p => p !== this.userId),
          content: this.newMessage
        };

        // Use the correct WebSocket URL matching your network setup
        const socket = new WebSocket(`ws://10.124.135.6:8000/chat/ws/${this.token}`);

        socket.onopen = () => {
          console.log('WebSocket connection established');
          socket.send(JSON.stringify(payload));
          this.newMessage = "";
        };

        socket.onmessage = (event) => {
          console.log('Received WebSocket message:', event.data);
          try {
            const data = JSON.parse(event.data);
            if (data.message) {
              this.messages.push(data.message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket connection error:', error);
        };

        socket.onclose = (event) => {
          console.log('WebSocket connection closed:', event);
        };

      } catch (error) {
        console.error("Error in WebSocket connection:", error);
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return "";
      return new Date(timestamp).toLocaleString();
    },
    getInitials(name) {
      return name?.split(" ").map(word => word[0]).join("").toUpperCase();
    }
  }
};
</script> 
  
  <style scoped>
  .chat-container {
    display: flex;
    height: calc(100vh - 64px);
    background-color: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .chat-header {
    padding: 2rem;
    background-color: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .chat-title {
    font-size: 2rem;
    color: #111827;
    margin-bottom: 0.5rem;
  }
  
  .chat-subtitle {
    color: #4b5563;
    font-size: 1rem;
  }
  
  .chat-list {
    width: 30%;
    border-right: 1px solid #e5e7eb;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .chat-item {
    display: flex;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .chat-item:hover {
    background-color: #f8fafc;
  }
  
  .chat-item-active {
    background-color: #f3f4f6;
  }
  
  .chat-avatar {
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
    flex-shrink: 0;
  }
  
  .chat-info {
    flex: 1;
    min-width: 0;
  }
  
  .chat-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .chat-preview {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .chat-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    margin-left: 0.5rem;
  }
  
  .chat-time {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .chat-badge {
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
    overflow: hidden;
  }
  
  .chat-conversation {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .chat-conversation-header {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background-color: white;
  }
  
  .chat-status {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .chat-messages {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #f8fafc;
  }
  
  .chat-message {
    max-width: 70%;
    display: flex;
    flex-direction: column;
    align-self: flex-start;
  }
  
  .chat-message-mine {
    align-self: flex-end;
  }
  
  .chat-message-content {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.75rem;
    color: #111827;
  }
  
  .chat-message-mine .chat-message-content {
    background-color: #111827;
    color: white;
    border-color: #111827;
  }
  
  .chat-message-time {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
    align-self: flex-end;
  }
  
  .chat-input-container {
    display: flex;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background-color: white;
  }
  
  .chat-input {
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    padding: 0.75rem;
    resize: none;
    min-height: 2.5rem;
    max-height: 8rem;
    outline: none;
    margin-right: 0.75rem;
    color: #111827;
  }
  
  .chat-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
  }
  
  .chat-send-btn {
    background-color: #111827;
    color: white;
    border-radius: 0.375rem;
    padding: 0 1rem;
    height: 2.5rem;
    font-weight: 500;
    transition: background-color 0.2s;
    cursor: pointer;
  }
  
  .chat-send-btn:hover {
    background-color: #1f2937;
  }
  
  .chat-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background-color: #f8fafc;
  }
  
  .chat-placeholder-content {
    max-width: 300px;
  }
  
  .chat-placeholder h2 {
    color: #111827;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .chat-placeholder p {
    color: #6b7280;
  }
  
  @media (max-width: 768px) {
    .chat-container {
      flex-direction: column;
      height: calc(100vh - 64px);
    }
    
    .chat-list {
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