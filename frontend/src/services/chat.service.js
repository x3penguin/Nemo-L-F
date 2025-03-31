// import api from "./api";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

class ChatService {
  // Create a new chat between users
  async createChat(itemId) {
    try {
      // Get current user ID
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not authenticated");
      const currentUserId = user.userId || user.id;
      console.log("Current user ID:", currentUserId);

      // Get the correct item data first
      const itemRef = doc(db, "items", itemId);
      const itemDoc = await getDoc(itemRef);
      if (!itemDoc.exists()) throw new Error("Item not found");

      const itemData = itemDoc.data();
      console.log("Item data:", itemData);

      let otherUserId = null;

      if (itemData.status === "FOUND" || itemData.status === "LOST") {
        // Query the potential_matches collection with the correct item ID
        const matchesRef = collection(db, "potential_matches");
        let matchQuery;

        if (itemData.status === "LOST") {
          matchQuery = query(matchesRef, where("lostItemId", "==", itemId));
        } else {
          matchQuery = query(matchesRef, where("foundItemId", "==", itemId));
        }

        const matchSnapshot = await getDocs(matchQuery);

        if (!matchSnapshot.empty) {
          // We found a potential match
          const matchData = matchSnapshot.docs[0].data();
          console.log("Found potential match:", matchData);

          // Get the other item ID
          const otherItemId =
            itemData.status === "LOST"
              ? matchData.foundItemId
              : matchData.lostItemId;

          if (!otherItemId) {
            throw new Error("Missing other item ID in potential match");
          }
          console.log("current item ID (found):", itemId);
          console.log(
            "Other item ID from potential match (lost item):",
            otherItemId
          );
          // Get that other item's details to find the reportOwner
          const otherItemRef = doc(db, "items", itemId);
          const otherItemDoc = await getDoc(otherItemRef);
          if (otherItemDoc.exists()) {
            const otherItemData = otherItemDoc.data();
            otherUserId = otherItemData.reportOwner;
            console.log("Other user ID from potential match:", otherUserId);
            console.log("currentUserId:", currentUserId);

            // Make sure we're not creating a chat with ourselves
            if (otherUserId.toString() === currentUserId.toString()) {
              console.error(
                "Same user detected, cannot create chat with yourself"
              );
              throw new Error("Cannot create chat with yourself");
            }

            console.log(
              "Found other user ID from potential match:",
              otherUserId
            );
          }
        }
      }
      // For matched items, get the other participant directly
      else if (itemData.status === "MATCHED") {
        // If current user is owner, other is finder
        if (itemData.ownerId === currentUserId) {
          otherUserId = itemData.finderId;
        }
        // If current user is finder, other is owner
        else if (itemData.finderId === currentUserId) {
          otherUserId = itemData.ownerId;
        }
      }

      if (!otherUserId || otherUserId === currentUserId) {
        throw new Error("Could not determine valid chat participant");
      }

      // VERIFY the participants array has TWO DIFFERENT IDs
      console.log("Creating chat between:", currentUserId, "and", otherUserId);

      // Check for existing chat between these users for this item
      const chatsRef = collection(db, "chats");
      const chatQuery = query(chatsRef, where("itemId", "==", itemId));

      const querySnapshot = await getDocs(chatQuery);
      for (const doc of querySnapshot.docs) {
        const chatData = doc.data();
        // Check if both users are already in this chat
        if (
          chatData.participants.includes(currentUserId) &&
          chatData.participants.includes(otherUserId)
        ) {
          console.log("Found existing chat:", doc.id);
          return { id: doc.id, ...chatData };
        }
      }

      // Create new chat
      const newChat = {
        participants: [currentUserId, otherUserId], // Ensure these are different IDs
        itemId: itemId,
        itemName: itemData.name || "Unnamed Item",
        createdAt: serverTimestamp(),
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
      };

      const chatRef = await addDoc(chatsRef, newChat);
      console.log("Created new chat:", chatRef.id);

      return {
        id: chatRef.id,
        ...newChat,
        createdAt: new Date(),
        lastMessageTime: new Date(),
      };
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  }

  // Get all chats for current user
  async getChats() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      const chatsRef = collection(db, "chats");
      const chatQuery = query(
        chatsRef,
        where("participants", "array-contains", user.id),
        orderBy("lastMessageTime", "desc")
      );

      const querySnapshot = await getDocs(chatQuery);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error("Error getting chats:", error);
      throw error;
    }
  }

  // Get messages for a specific chat
  async getMessages(chatId) {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const messageQuery = query(messagesRef, orderBy("timestamp", "asc"));

      const querySnapshot = await getDocs(messageQuery);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(chatId, content) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      // Get chat to get the other participant
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        throw new Error("Chat not found");
      }

      const chatData = chatDoc.data();
      // Make sure we have participants data
      if (
        !chatData.participants ||
        !Array.isArray(chatData.participants) ||
        chatData.participants.length < 2
      ) {
        throw new Error("Invalid chat data: missing participants");
      }

      // Ensure we get a valid receiver ID
      const receiverId = chatData.participants.find((id) => id !== user.id);
      if (!receiverId) {
        throw new Error("Could not determine message recipient");
      }

      // Create message
      const message = {
        sender: user.id,
        receiver: receiverId,
        content: content,
        timestamp: serverTimestamp(),
        read: false,
      };

      // Add message to chat
      const messagesRef = collection(db, "chats", chatId, "messages");
      const messageRef = await addDoc(messagesRef, message);

      // Update chat with last message
      await updateDoc(chatRef, {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
      });

      return {
        id: messageRef.id,
        ...message,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Listen for new messages in a chat
  subscribeToMessages(chatId, callback) {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const messageQuery = query(messagesRef, orderBy("timestamp", "asc"));

      return onSnapshot(messageQuery, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));

        callback(messages);
      });
    } catch (error) {
      console.error("Error subscribing to messages:", error);
      throw error;
    }
  }

  // Get user info by ID
  async getUserInfo(userId) {
    try {
      console.log("Fetching user info for ID:", userId);

      // Directly query Firebase for the user
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Found user data:", userData);

        // Check different possible name fields based on your Firebase structure
        const name =
          userData.name ||
          userData.full_name ||
          userData.username ||
          `User ${userId.substring(0, 4)}`;

        return {
          id: userId,
          name: name,
          email: userData.email || "",
        };
      } else {
        console.log("No user document found with ID:", userId);
        return { id: userId, name: `User ${userId.substring(0, 4)}` };
      }
    } catch (error) {
      console.error("Error getting user info:", error);
      return { id: userId, name: `User ${userId.substring(0, 4)}` };
    }
  }
}

export default new ChatService();
