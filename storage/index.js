let producer;
let producerConnected = false;

// Dynamically import and set up Kafka
import("kafkajs")
  .then((kafkaModule) => {
    const { Kafka } = kafkaModule;

    const kafka = new Kafka({
      clientId: "storage-service",
      brokers: ["localhost:9092"],
    });

    producer = kafka.producer();
    producer
      .connect()
      .then(() => {
        producerConnected = true;
        console.log("Kafka producer connected");
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
      topic: "image-matching-jobs",
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

    console.log(`Published matching job for item ${itemId}`);
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
} from "./services/itemService.js";

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Lost and Found Item Service running on port ${PORT}`);
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Create a Kafka producer
const kafka = new Kafka({
  clientId: "storage-service",
  brokers: ["localhost:9092"],
});

// Add prefix to all routes to match frontend expectations
app.use("/api", express.Router());

// Get items by status (handles getLostItems, getFoundItems, getMatchedItems)
app.get("/api/items", async (req, res) => {
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
app.get("/api/items/:id", async (req, res) => {
  const result = await getItemById(req.params.id);
  if (result.success) {
    // Return data in the format expected by frontend
    res.status(200).json(result.data);
  } else {
    res.status(404).json({ error: result.error });
  }
});

// Report lost item - handle FormData
app.post("/api/items/lost", upload.single("image"), async (req, res) => {
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
      reportOwner: req.body.userId
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
app.post("/api/items/found", upload.single("image"), async (req, res) => {
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
      reportOwner: req.body.userId
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
          console.log("Failed to send matching job, continuing anyway:", err);
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

// Update item status
app.put("/api/items/:id/status", async (req, res) => {
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
app.post("/api/items/:itemId/collection", async (req, res) => {
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
app.get("/api/items/:itemId/collection", async (req, res) => {
  const result = await getItemById(req.params.itemId);
  if (result.success && result.data.collectionDetails) {
    res.status(200).json(result.data.collectionDetails);
  } else {
    res.status(404).json({ error: "No collection details found" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.get("/api/items/:id/potential-matches", async (req, res) => {
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

    // Get all items of the matching status
    const matchingItemsResult = await getItemsByStatus(matchingStatus);

    if (!matchingItemsResult.success) {
      return res
        .status(500)
        .json({ error: "Failed to retrieve potential matches" });
    }

    // Process up to 5 potential matches
    const potentialMatches = matchingItemsResult.items
      .map((item) => {
        return {
          ...item,
          confidence: item.matchingConfidence || Math.floor(Math.random() * 40) + 60,
          sourceItemId: itemId,
          distance: item.distance || null
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Limit to top 5 matches

    // Return the matches
    res.status(200).json(potentialMatches);
  } catch (error) {
    console.error("Error getting potential matches:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});