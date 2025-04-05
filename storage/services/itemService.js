// itemService.js
import { db, storage } from "../firebase.js";
import {
  Timestamp,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Store item data in Firestore
 * @param {Object} itemData - Item data from UI
 * @returns {Promise<Object>} - Result with item ID
 */
export const storeItemData = async (itemData) => {
  try {
    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "category",
      "status",
      "location",
    ];
    for (const field of requiredFields) {
      if (!itemData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Format data for storage - include reportOwner
    const formattedData = {
      name: itemData.name,
      description: itemData.description,
      category: itemData.category,
      imageUrl: itemData.imageUrl || null,
      status: itemData.status,
      location: itemData.location,
      dateTime: Timestamp.fromDate(new Date(itemData.dateTime)),
      currentLocation: itemData.currentLocation,
      latitude: itemData.latitude,
      longitude: itemData.longitude,
      ownerId: itemData.ownerId || null,
      finderId: itemData.finderId || null,
      matchingConfidence: itemData.matchingConfidence || null,
      reportedDateTime: Timestamp.now(),
      // Record who reported this item - critical for collection view filtering
      reportOwner: itemData.reportOwner || null,
    };

    // Store in Firestore
    const docRef = await addDoc(collection(db, "items"), formattedData);

    return {
      success: true,
      itemId: docRef.id,
      message: "Item stored successfully",
    };
  } catch (error) {
     return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteItem = async (itemId) => {
  try {
    // First delete the item itself
    const itemRef = doc(db, "items", itemId);
    await deleteDoc(itemRef);

    // Delete potential matches where this item appears as either found or lost item
    const potentialMatchesRef = collection(db, "potential_matches");

    // Query for matches where this is the foundItemId
    const foundItemQuery = query(
      potentialMatchesRef,
      where("foundItemId", "==", itemId)
    );

    // Query for matches where this is the lostItemId
    const lostItemQuery = query(
      potentialMatchesRef,
      where("lostItemId", "==", itemId)
    );

    // Get all matching documents
    const foundMatches = await getDocs(foundItemQuery);
    const lostMatches = await getDocs(lostItemQuery);

    // Delete all matching documents
    const deletePromises = [];

    foundMatches.forEach((docSnapshot) => {
      deletePromises.push(
        deleteDoc(doc(db, "potential_matches", docSnapshot.id))
      );
    });

    lostMatches.forEach((docSnapshot) => {
      deletePromises.push(
        deleteDoc(doc(db, "potential_matches", docSnapshot.id))
      );
    });

    // Wait for all deletion operations to complete
    await Promise.all(deletePromises);

    return {
      success: true,
      message: "Item and related potential matches deleted successfully",
    };
  } catch (error) {
     return {
      success: false,
      error: error.message,
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
    const docRef = doc(db, "items", itemId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        itemId: docSnap.id,
        data: docSnap.data(),
      };
    } else {
      return {
        success: false,
        error: "Item not found",
      };
    }
  } catch (error) {
     return {
      success: false,
      error: error.message,
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
    const docRef = doc(db, "items", itemId);
    await updateDoc(docRef, updateData);

    return {
      success: true,
      message: "Item updated successfully",
    };
  } catch (error) {
     return {
      success: false,
      error: error.message,
    };
  }
};

export const getItemsByStatus = async (status) => {
  try {
     const q = query(collection(db, "items"), where("status", "==", status));
    const querySnapshot = await getDocs(q);

    const items = [];
    // Check if querySnapshot has a forEach method
    if (querySnapshot.forEach) {
      querySnapshot.forEach((docSnapshot) => {
        // Make sure to use the correct method to access data
        if (typeof docSnapshot.data === "function") {
          const itemData = docSnapshot.data();
          items.push({
            id: docSnapshot.id,
            ...itemData,
          });
        } else {
          // Alternative for different Firebase API
           items.push({
            id: docSnapshot.id,
            ...docSnapshot,
          });
        }
      });
    } else {
      // Handle case where querySnapshot is structured differently
       // Try to access documents array if it exists
      const docs = querySnapshot.docs || [];
      docs.forEach((doc) => {
        if (doc && typeof doc.data === "function") {
          items.push({
            id: doc.id,
            ...doc.data(),
          });
        }
      });
    }

    return {
      success: true,
      items,
    };
  } catch (error) {
     return {
      success: false,
      error: error.message,
    };
  }
};

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
      message: "Image uploaded successfully",
    };
  } catch (error) {
     return {
      success: false,
      error: error.message,
    };
  }
};

export const getCollectionItems = async (userId = 1) => {
  try {
    // Get items in collection process
    const matchedResult = await getItemsByStatus("MATCHED");
    const collectingResult = await getItemsByStatus("COLLECTING");
    const retrievedResult = await getItemsByStatus("RETRIEVED");

    if (
      !matchedResult.success ||
      !collectingResult.success ||
      !retrievedResult.success
    ) {
      throw new Error("Failed to fetch collection items");
    }

    // Combine all items
    const allItems = [
      ...matchedResult.items,
      ...collectingResult.items,
      ...retrievedResult.items,
    ];

    // Filter by userId if provided (using hardcoded 1 for testing)
    const userItems = allItems.filter(
      (item) => item.ownerId === userId || item.finderId === userId
    );

    // Generate signed URLs for images
    const itemsWithImages = await Promise.all(
      userItems.map(async (item) => {
        if (item.imageUrl) {
          try {
            // Get storage reference
            const storageRef = ref(storage, item.imageUrl);

            // Generate signed URL
            const imageUrl = await getDownloadURL(storageRef);

            return {
              ...item,
              imageUrl: imageUrl,
            };
          } catch (error) {
            console.error(
              `Error getting signed URL for item ${item.id}:`,
              error
            );
            return item;
          }
        }
        return item;
      })
    );

    return {
      success: true,
      items: itemsWithImages,
    };
  } catch (error) {
     return {
      success: false,
      error: error.message,
    };
  }
};
