<template>
    <div class="chat-container">
      <div class="chat-header">
        <h1 class="chat-title">Messages</h1>
        <p class="chat-subtitle">Connect with item finders and owners</p>
      </div>
      
      <div class="chat-list">
        <div v-for="(chat, index) in chats" 
             :key="index" 
             class="chat-item"
             :class="{ 'chat-item-active': activeChatIndex === index }"
             @click="setActiveChat(index)">
          <div class="chat-avatar">{{ getInitials(chat.name) }}</div>
          <div class="chat-info">
            <h3 class="chat-name">{{ chat.name }}</h3>
            <p class="chat-preview">{{ chat.lastMessage }}</p>
          </div>
          <div class="chat-meta">
            <span class="chat-time">{{ chat.time }}</span>
            <span v-if="chat.unread" class="chat-badge">{{ chat.unread }}</span>
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
          
          <div class="chat-messages">
            <div v-for="(message, index) in activeChat.messages" 
                 :key="index" 
                 class="chat-message"
                 :class="{ 'chat-message-mine': message.isMine }">
              <div class="chat-message-content">{{ message.text }}</div>
              <div class="chat-message-time">{{ message.time }}</div>
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
  export default {
    name: 'ChatView',
    data() {
      return {
        activeChatIndex: null,
        newMessage: '',
        chats: [
          {
            name: 'John Smith',
            lastMessage: 'I found your wallet at Central Park',
            time: '10:30 AM',
            unread: 3,
            itemName: 'Black Leather Wallet',
            messages: [
              { text: 'Hi, I believe I found your wallet at Central Park.', time: '10:15 AM', isMine: false },
              { text: 'It has your ID inside.', time: '10:16 AM', isMine: false },
              { text: 'Oh thank you so much!', time: '10:20 AM', isMine: true },
              { text: 'When would be a good time to meet?', time: '10:22 AM', isMine: true },
              { text: 'I can meet you tomorrow at the park entrance around noon.', time: '10:30 AM', isMine: false }
            ]
          },
          {
            name: 'Sarah Johnson',
            lastMessage: 'Is this your blue umbrella?',
            time: 'Yesterday',
            unread: 0,
            itemName: 'Blue Umbrella',
            messages: [
              { text: 'Hello, I think I might have your blue umbrella.', time: 'Yesterday, 2:15 PM', isMine: false },
              { text: 'Does it have a wooden handle?', time: 'Yesterday, 2:20 PM', isMine: true },
              { text: 'Yes, it does. And it has a small logo on it.', time: 'Yesterday, 2:25 PM', isMine: false }
            ]
          },
          {
            name: 'Michael Brown',
            lastMessage: 'Thank you for returning my keys!',
            time: 'Mar 22',
            unread: 0,
            itemName: 'Car Keys',
            messages: [
              { text: 'I found your car keys at the gym.', time: 'Mar 22, 9:15 AM', isMine: false },
              { text: 'Thank you!', time: 'Mar 22, 9:30 AM', isMine: true },
              { text: 'No problem! Glad to help.', time: 'Mar 22, 9:35 AM', isMine: false },
              { text: 'Thank you for returning my keys!', time: 'Mar 22, 4:45 PM', isMine: true }
            ]
          }
        ]
      }
    },
    computed: {
      activeChat() {
        return this.activeChatIndex !== null ? this.chats[this.activeChatIndex] : null;
      }
    },
    methods: {
      getInitials(name) {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
      },
      setActiveChat(index) {
        this.activeChatIndex = index;
        if (this.chats[index].unread) {
          this.chats[index].unread = 0;
        }
      },
      sendMessage() {
        if (!this.newMessage.trim() || this.activeChatIndex === null) return;
        
        this.chats[this.activeChatIndex].messages.push({
          text: this.newMessage,
          time: this.getCurrentTime(),
          isMine: true
        });
        
        this.chats[this.activeChatIndex].lastMessage = this.newMessage;
        this.chats[this.activeChatIndex].time = 'Just now';
        
        this.newMessage = '';
        
        // Simulate response (for demo purposes)
        setTimeout(() => {
          if (this.activeChatIndex !== null) {
            const responses = [
              "Sounds good! Looking forward to it.",
              "Perfect, that works for me.",
              "Great! I'll see you then.",
              "Thanks for the quick response!"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            this.chats[this.activeChatIndex].messages.push({
              text: randomResponse,
              time: this.getCurrentTime(),
              isMine: false
            });
            
            this.chats[this.activeChatIndex].lastMessage = randomResponse;
            this.chats[this.activeChatIndex].time = 'Just now';
          }
        }, 2000);
      },
      getCurrentTime() {
        const now = new Date();
        return now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
      }
    }
  }
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