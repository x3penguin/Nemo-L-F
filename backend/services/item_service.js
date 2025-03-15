// itemService.js
import { db } from '../firebase/firebase.js';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

/**
 * Store item data in Firestore
 * @param {Object} itemData - Item data from UI
 * @returns {Promise<Object>} - Result with item ID
 */
export const storeItemData = async (itemData) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'imageUrl', 'status', 'location'];
    for (const field of requiredFields) {
      if (!itemData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Format data for storage
    const formattedData = {
      name: itemData.name,
      description: itemData.description,
      category: itemData.category,
      imageUrl: itemData.imageUrl,
      status: itemData.status,
      location: itemData.location,
      reportDate: itemData.reportDate || new Date(),
      ownerId: itemData.ownerId || null,
      finderId: itemData.finderId || null,
      matchingConfidence: itemData.matchingConfidence || null,
      createdAt: new Date()
    };

    // Store in Firestore
    const docRef = await addDoc(collection(db, 'items'), formattedData);
    
    return {
      success: true,
      itemId: docRef.id,
      message: 'Item stored successfully'
    };
  } catch (error) {
    console.error("Error storing item data:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get item by ID
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} - Item data
 */
export const getItemById = async (itemId) => {
  try {
    const docRef = doc(db, 'items', itemId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        itemId: docSnap.id,
        data: docSnap.data()
      };
    } else {
      return {
        success: false,
        error: 'Item not found'
      };
    }
  } catch (error) {
    console.error("Error getting item:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update item data (for when matching service finds a match)
 * @param {string} itemId - Item ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Result
 */
export const updateItem = async (itemId, updateData) => {
  try {
    const docRef = doc(db, 'items', itemId);
    await updateDoc(docRef, updateData);
    
    return {
      success: true,
      message: 'Item updated successfully'
    };
  } catch (error) {
    console.error("Error updating item:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get items by status
 * @param {string} status - Item status
 * @returns {Promise<Array>} - Array of items
 */
export const getItemsByStatus = async (status) => {
  try {
    const q = query(collection(db, 'items'), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      items
    };
  } catch (error) {
    console.error("Error getting items by status:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add this to your itemService.js

import { storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Upload image to Firebase Storage
 * @param {Object} file - File object from multer
 * @returns {Promise<Object>} - Result with image URL
 */
export const uploadImage = async (file) => {
  try {
    const dateTime = Date.now();
    const fileName = `items/${dateTime}-${file.originalname}`;
    const storageRef = ref(storage, fileName);
    
    // Convert buffer to Blob for Firebase Storage
    const blob = new Blob([file.buffer], { type: file.mimetype });
    
    // Upload to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
