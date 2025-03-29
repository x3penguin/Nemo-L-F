import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./firebase.js"; // Import Firestore reference
import {
  collection,
  addDoc,
  doc,
  query,
  where,
  getDoc,
  getDocs,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("User Microservice is running!");
});

// Route to create a new user (POST)
app.post("/users", async (req, res) => {
  const {
    email,
    password,
    phone,
    name,
    city,
    postalCode,
    streetAddress,
    unitNumber,
  } = req.body;

  if (
    !email ||
    !password ||
    !phone ||
    !name ||
    !city ||
    !postalCode ||
    !streetAddress ||
    !unitNumber
  ) {
    return res.status(400).send({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save user data in Firestore
    const docRef = await addDoc(collection(db, "users"), {
      name,
      email,
      password: hashedPassword,
      phone,
      address: {
        city,
        postalCode,
        streetAddress,
        unitNumber,
      },
      createdAt: new Date(),
    });
    const userId = docRef.id;
    // Generate JWT token
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .send({ message: "User created successfully", userId, token });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .send({ message: "Failed to create user", error: error.message });
  }
});

// Route to get user details (GET)
app.get("/users/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    const user = userDoc.data();

    const addressQuery = query(
      collection(db, "userAddress"),
      where("userId", "==", userId)
    );
    const addressDocs = await getDocs(addressQuery);
    const addressDoc = addressDocs.docs[0];

    if (!addressDoc) {
      throw new Error("Address document does not exist");
    }
    const address = addressDoc.data();

    const userDetails = {
      name: user.name,
      city: address.city,
      postalCode: address.postalCode,
      streetAddress: address.streetAddress,
      unitNumber: address.unitNumber,
      userId: userId,
    };
    res.json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(404).send({ message: error.message });
  }
});

//Route to login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }

  try {
    // Query Firestore for the user
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    let user = null;

    querySnapshot.forEach((doc) => {
      if (doc.data().email === email) {
        user = { id: doc.id, ...doc.data() };
      }
    });

    if (!user) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    // Verify the password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).send({ message: "Invalid email or password" });
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res
      .status(200)
      .send({ message: "Login successful", userId: user.id, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send({ message: "Failed to log in", error: error.message });
  }
});

// user/index.js - Update the matches API endpoint to better handle marking notifications as seen

app.get("/api/users/:id/matches/new", async (req, res) => {
  const userId = req.params.id;

  try {
    // Query Firestore for matched items where this user is involved
    const itemsRef = collection(db, "items");

    // Query for items where user is the owner (lost items that were found)
    const ownerQuery = query(
      itemsRef,
      where("status", "==", "MATCHED"),
      where("ownerId", "==", userId),
      where("notificationSeen", "==", false)
    );

    // Query for items where user is the finder (found items that were matched)
    const finderQuery = query(
      itemsRef,
      where("status", "==", "MATCHED"),
      where("finderId", "==", userId),
      where("notificationSeen", "==", false)
    );

    // Run both queries
    const [ownerQuerySnapshot, finderQuerySnapshot] = await Promise.all([
      getDocs(ownerQuery),
      getDocs(finderQuery),
    ]);

    // Combine the results
    const matches = [];

    // Add owner matches (lost items that were found)
    ownerQuerySnapshot.forEach((doc) => {
      const data = doc.data();
      matches.push({
        id: doc.id,
        itemId: doc.id,
        matchedItemId: data.matchedItemId,
        itemName: data.name,
        confidence: data.matchingConfidence || 0,
        matchedDate: data.matchedDate,
        type: "lost", // This was a lost item that was found
        seen: false,
      });
    });

    // Add finder matches (found items that were matched to owners)
    finderQuerySnapshot.forEach((doc) => {
      const data = doc.data();
      matches.push({
        id: doc.id,
        itemId: doc.id,
        matchedItemId: data.matchedItemId,
        itemName: data.name,
        confidence: data.matchingConfidence || 0,
        matchedDate: data.matchedDate,
        type: "found", // This was an item the user found that was matched
        seen: false,
      });
    });

    // Mark all notifications as seen immediately to prevent duplicate notifications
    if (matches.length > 0) {
      const batch = writeBatch(db);

      // Mark all as seen in Firestore
      [...ownerQuerySnapshot.docs, ...finderQuerySnapshot.docs].forEach(
        (doc) => {
          batch.update(doc.ref, { notificationSeen: true });
        }
      );

      // Commit the batch
      await batch.commit();

      console.log(
        `Marked ${matches.length} notifications as seen for user ${userId}`
      );
    }

    res.json({ matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch matches",
    });
  }
});

// Route to mark a notification as read
app.put("/api/notifications/:id/read", async (req, res) => {
  const notificationId = req.params.id;

  try {
    const notificationRef = doc(db, "items", notificationId);
    const notificationDoc = await getDoc(notificationRef);

    if (!notificationDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    // Mark as both seen and read
    await updateDoc(notificationRef, {
      notificationSeen: true,
      notificationRead: true,
    });

    res.json({
      success: true,
      message: "Notification marked as read successfully",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update notification",
    });
  }
});

// Route to fetch potential matches (up to 5)
app.get("/api/users/:id/potential-matches", async (req, res) => {
  const userId = req.params.id;

  try {
    // Query for user's items that might have potential matches
    const itemsRef = collection(db, "items");
    const userItems = query(
      itemsRef,
      where("ownerId", "==", userId),
      where("status", "in", ["LOST", "FOUND"])
    );

    const itemsSnapshot = await getDocs(userItems);
    const potentialMatches = [];

    // For each item, find potential matches
    for (const itemDoc of itemsSnapshot.docs) {
      const item = itemDoc.data();
      const itemId = itemDoc.id;

      // Query for matching items (if lost, find found items; if found, find lost items)
      const matchStatus = item.status === "LOST" ? "FOUND" : "LOST";
      const matchQuery = query(itemsRef, where("status", "==", matchStatus));

      const matchesSnapshot = await getDocs(matchQuery);

      // Calculate matches (simplified - in a real app, you'd use your actual matching algorithm)
      const matches = matchesSnapshot.docs
        .map((matchDoc) => {
          // Calculate a confidence score (simplified)
          const confidence = Math.floor(Math.random() * 40) + 60; // Random score between 60-99

          return {
            id: matchDoc.id,
            itemId: matchDoc.id,
            sourceItemId: itemId,
            itemName: matchDoc.data().name,
            category: matchDoc.data().category,
            description: matchDoc.data().description,
            location: matchDoc.data().location,
            imageUrl: matchDoc.data().imageUrl,
            confidence: confidence,
            dateTime: matchDoc.data().dateTime,
          };
        })
        .sort((a, b) => b.confidence - a.confidence) // Sort by confidence
        .slice(0, 5); // Take top 5

      potentialMatches.push(...matches);
    }

    // Return the top potential matches across all user items
    res.json({
      success: true,
      matches: potentialMatches
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching potential matches:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch potential matches",
    });
  }
});

app.get("/api/users/:id/lost-items-with-matches", async (req, res) => {
  const userId = req.params.id;

  try {
    // Query for lost items by this user
    const itemsRef = collection(db, "items");
    const lostItemsQuery = query(
      itemsRef,
      where("status", "==", "LOST"),
      where("reportOwner", "==", userId)
    );

    const lostItemsSnapshot = await getDocs(lostItemsQuery);
    const lostItems = [];

    // Get all user's lost items
    for (const doc of lostItemsSnapshot.docs) {
      const item = doc.data();

      // Check if this item has potential matches
      // Query for potential matches in the potential_matches collection
      const potentialMatchesQuery = query(
        collection(db, "potential_matches"),
        where("lostItemId", "==", doc.id)
      );

      const potentialMatchesSnapshot = await getDocs(potentialMatchesQuery);

      // Only include this item if it has at least one potential match
      if (!potentialMatchesSnapshot.empty) {
        lostItems.push({
          id: doc.id,
          name: item.name,
          description: item.description,
          category: item.category,
          location: item.location,
          dateTime: item.dateTime,
          imageUrl: item.imageUrl,
          status: item.status,
          hasPotentialMatches: true, // Mark it as having matches
          matchCount: potentialMatchesSnapshot.size, // Include count of matches
        });
      }
    }

    res.json({
      success: true,
      items: lostItems,
    });
  } catch (error) {
    console.error("Error fetching lost items with matches:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch lost items",
    });
  }
});

app.post("/api/test/create-match", async (req, res) => {
  const { lostItemId, foundItemId, confidence = 90 } = req.body;

  if (!lostItemId || !foundItemId) {
    return res.status(400).json({
      success: false,
      error: "Both lostItemId and foundItemId are required",
    });
  }

  try {
    // Get the lost item
    const lostItemRef = doc(db, "items", lostItemId);
    const lostItemDoc = await getDoc(lostItemRef);

    if (!lostItemDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: `Lost item with ID ${lostItemId} not found`,
      });
    }

    // Get the found item
    const foundItemRef = doc(db, "items", foundItemId);
    const foundItemDoc = await getDoc(foundItemRef);

    if (!foundItemDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: `Found item with ID ${foundItemId} not found`,
      });
    }

    const lostItem = lostItemDoc.data();
    const foundItem = foundItemDoc.data();

    // Update both items as matched
    const batch = writeBatch(db);

    // Update lost item
    batch.update(lostItemRef, {
      status: "MATCHED",
      matchedItemId: foundItemId,
      matchingConfidence: confidence,
      matchedDate: new Date(),
      finderId: foundItem.finderId,
      notificationSeen: false,
      notificationRead: false,
    });

    // Update found item
    batch.update(foundItemRef, {
      status: "MATCHED",
      matchedItemId: lostItemId,
      matchingConfidence: confidence,
      matchedDate: new Date(),
      ownerId: lostItem.ownerId,
      notificationSeen: false,
      notificationRead: false,
    });

    // Commit the batch
    await batch.commit();

    res.json({
      success: true,
      message: "Match created successfully",
      match: {
        lostItemId,
        foundItemId,
        confidence,
      },
    });
  } catch (error) {
    console.error("Error creating test match:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create test match",
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
