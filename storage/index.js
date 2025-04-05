let producer;
let producerConnected = false;

// Dynamically import and set up Kafka
import("kafkajs")
  .then((kafkaModule) => {
    const { Kafka } = kafkaModule;

    const kafka = new Kafka({
      clientId: "storage-service",
      brokers: [process.env.KAFKA_BROKERS],
    });

    producer = kafka.producer();
    producer
      .connect()
      .then(() => {
        producerConnected = true;

      })
      .catch((err) => {
        console.error("Failed to connect to Kafka:", err);
      });
  })
  .catch((err) => {
    console.error("Failed to import Kafka:", err);
  });

// Function to publish image matching job
async function publishMatchingJob(itemId, imageUrl, latitude, longitude) {
  if (!producerConnected || !producer) {
    console.error("Kafka producer not connected");
    return false;
  }

  try {
    await producer.send({
      topic: process.env.KAFKA_TOPIC,
      messages: [
        {
          key: itemId,
          value: JSON.stringify({
            itemId: itemId,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString(),
            coordinates: [latitude, longitude],
          }),
        },
      ],
    });


    return true;
  } catch (error) {
    console.error("Error publishing to Kafka:", error);
    return false;
  }
}

import express from "express";
import cors from "cors";
import multer from "multer";
import { Kafka } from "kafkajs";
import {
  storeItemData,
  getItemById,
  updateItem,
  getItemsByStatus,
  uploadImage,
  deleteItem
} from "./services/itemService.js";

import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const swaggerFile = JSON.parse(readFileSync("./swagger-output.json", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {

});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Create a Kafka producer
const kafka = new Kafka({
  clientId: "storage-service",
  brokers: [process.env.KAFKA_BROKERS],
});

// Get items by status (handles getLostItems, getFoundItems, getMatchedItems)
app.get("/", async (req, res) => {
  const status = req.query.status;
  if (!status) {
    return res
      .status(400)
      .json({ success: false, error: "Status parameter is required" });
  }

  const result = await getItemsByStatus(status);
  if (result.success) {
    res.status(200).json(result.items);
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Get item by ID
app.get("/:id", async (req, res) => {
  const result = await getItemById(req.params.id);
  if (result.success) {
    // Return data in the format expected by frontend
    res.status(200).json(result.data);
  } else {
    res.status(404).json({ error: result.error });
  }
});

// Report lost item - handle FormData
app.post("/lost", upload.single("image"), async (req, res) => {
  try {
    // First upload the image if present
    let imageUrl = null;
    if (req.file) {
      const imageResult = await uploadImage(req.file);
      if (!imageResult.success) {
        return res.status(400).json({ error: imageResult.error });
      }
      imageUrl = imageResult.imageUrl;
    }

    // Prepare item data
    const itemData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      imageUrl: imageUrl,
      status: "LOST",
      location: `${req.body.venue} | ${req.body.specific_location || ""}`,
      dateTime: req.body.date_time,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      currentLocation: "NA",
      ownerId: req.body.userId,
      finderId: null,
      reportOwner: req.body.userId,
    };

    const result = await storeItemData(itemData);
    if (result.success) {
      res.status(201).json({
        success: true,
        itemId: result.itemId,
        message: "Lost item reported successfully",
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error processing lost item:", error);
    res.status(500).json({ error: error.message });
  }
});

// Report found item - handle FormData
app.post("/found", upload.single("image"), async (req, res) => {
  try {
    // First upload the image if present
    let imageUrl = null;
    if (req.file) {
      const imageResult = await uploadImage(req.file);
      if (!imageResult.success) {
        return res.status(400).json({ error: imageResult.error });
      }
      imageUrl = imageResult.imageUrl;
    }

    // Prepare item data
    let currentLocation =
      req.body.current_location === "other"
        ? req.body.other_location_details
        : req.body.current_location;

    const itemData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      imageUrl: imageUrl,
      status: "FOUND",
      location: `${req.body.venue} | ${req.body.specific_location || ""}`,
      dateTime: req.body.date_time,
      currentLocation: currentLocation,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      ownerId: null,
      finderId: req.body.userId,
      reportOwner: req.body.userId,
    };

    const result = await storeItemData(itemData);
    if (result.success) {
      // NEW: Send item for image matching
      if (imageUrl) {
        try {
          await publishMatchingJob(
            result.itemId,
            imageUrl,
            itemData.latitude,
            itemData.longitude
          );
        } catch (err) {

        }
      }

      res.status(201).json({
        success: true,
        itemId: result.itemId,
        message: "Found item reported successfully",
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error processing found item:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    if (!itemId) {
      return res.status(400).json({ success: false, error: "Item ID is required" });
    }
    

    const updateData = req.body;

    // Check if item exists and isn't already matched
    const itemResult = await getItemById(itemId);
    if (!itemResult.success) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    // Check if item is already matched
    if (
      itemResult.data.status === "MATCHED" ||
      itemResult.data.status === "COLLECTING" ||
      itemResult.data.status === "RETRIEVED"
    ) {
      return res.status(400).json({
        success: false,
        error: "Cannot update item that is already matched, in collection, or retrieved"
      });
    }

    // Check if the user is the owner of this item (security)
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required for permission verification"
      });
    }
    
    if (itemResult.data.reportOwner !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this item"
      });
    }

    // Only allow updating specific fields
    const allowedFields = [
      "name",
      "description",
      "category",
      "venue",
      "specific_location"
    ];
    
    const filteredData = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Handle venue and specific_location as a combined field for storage
    if (updateData.venue !== undefined) {
      const specificLocation = updateData.specific_location || "";
      filteredData.location = `${updateData.venue} | ${specificLocation}`;
    }

    // Update item in Firebase
    const result = await updateItem(itemId, filteredData);

    if (result.success) {
      res.status(200).json({ success: true, message: "Item updated successfully" });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete item (DELETE request)
app.delete("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    if (!itemId) {
      return res.status(400).json({ success: false, error: "Item ID is required" });
    }
    


    // Check if item exists and isn't already matched
    const itemResult = await getItemById(itemId);
    if (!itemResult.success) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    // Check if item is already matched
    if (
      itemResult.data.status === "MATCHED" ||
      itemResult.data.status === "COLLECTING" ||
      itemResult.data.status === "RETRIEVED"
    ) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete item that is already matched, in collection, or retrieved"
      });
    }

    // Check if the user is the owner of this item (security)
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required for permission verification"
      });
    }
    
    if (itemResult.data.reportOwner !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to delete this item"
      });
    }

    // Delete item from Firebase
    const result = await deleteItem(itemId);

    if (result.success) {
      res.status(200).json({ success: true, message: "Item deleted successfully" });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update item status
app.put("/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const result = await updateItem(req.params.id, { status });
  if (result.success) {
    res.status(200).json({
      success: true,
      message: "Item status updated successfully",
    });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Initiate collection
app.post("/:itemId/collection", async (req, res) => {
  const result = await updateItem(req.params.itemId, {
    status: "COLLECTING",
    collectionDetails: req.body,
  });

  if (result.success) {
    res.status(201).json({
      success: true,
      message: "Collection initiated successfully",
    });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Get collection details
app.get("/:itemId/collection", async (req, res) => {
  const result = await getItemById(req.params.itemId);
  if (result.success && result.data.collectionDetails) {
    res.status(200).json(result.data.collectionDetails);
  } else {
    res.status(404).json({ error: "No collection details found" });
  }
});

import { db } from "./firebase.js";
import { collection, query, where, getDocs } from "firebase/firestore";
app.get("/:id/potential-matches", async (req, res) => {
  const itemId = req.params.id;

  try {
    // Get the source item
    const sourceItemResult = await getItemById(itemId);

    if (!sourceItemResult.success) {
      return res.status(404).json({ error: "Item not found" });
    }

    const sourceItem = sourceItemResult.data;

    // Determine what kind of matches to look for
    const status = sourceItem.status;
    let matchingStatus;

    if (status === "LOST") {
      matchingStatus = "FOUND";
    } else if (status === "FOUND") {
      matchingStatus = "LOST";
    } else {
      // If the item is already matched, just return an empty array
      return res.status(200).json([]);
    }

    try {
      // Query the potential_matches collection for matches related to this item
      const potentialMatchesRef = collection(db, "potential_matches");
      let queryRef;

      if (status === "LOST") {
        // If item is LOST, look for matches where this is the lostItemId
        queryRef = query(
          potentialMatchesRef,
          where("lostItemId", "==", itemId)
        );
      } else {
        // If item is FOUND, look for matches where this is the foundItemId
        queryRef = query(
          potentialMatchesRef,
          where("foundItemId", "==", itemId)
        );
      }

      const matchesSnapshot = await getDocs(queryRef);

      if (!matchesSnapshot.empty) {
        console.log(
          `Found ${matchesSnapshot.size} potential matches from potential_matches collection`
        );

        // Get the matching item details for each potential match
        const matchPromises = matchesSnapshot.docs.map(async (doc) => {
          const matchData = doc.data();
          let matchItemId;

          // Determine which ID to use based on source item status
          if (status === "LOST") {
            matchItemId = matchData.foundItemId;
          } else {
            matchItemId = matchData.lostItemId;
          }

          // Get the matching item details
          const matchItemResult = await getItemById(matchItemId);
          if (!matchItemResult.success) {
            return null; // Skip this match if we can't get the item details
          }

          // Combine the match data and item data
          return {
            ...matchItemResult.data,
            id: matchItemId,
            sourceItemId: itemId,
            confidence: matchData.confidence || matchData.weightedConfidence,
            distance: matchData.distance || null,
          };
        });

        // Wait for all item details to be fetched
        const resolvedMatches = (await Promise.all(matchPromises))
          .filter((match) => match !== null) // Remove null entries
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5); // Limit to top 5 matches

        return res.status(200).json(resolvedMatches);
      }
    } catch (firestoreError) {
      console.warn(
        "Error querying potential_matches collection:",
        firestoreError
      );
      // Continue to fallback approach if potential_matches query fails
    }
  } catch (error) {
    console.error("Error getting potential matches:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
