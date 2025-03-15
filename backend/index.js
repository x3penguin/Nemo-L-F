// index.js - Express API for the microservice
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { storeItemData, getItemById, updateItem, getItemsByStatus, uploadImage } from './services/itemService.js';
import { Timestamp } from 'firebase/firestore';

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Add prefix to all routes to match frontend expectations
app.use('/api', express.Router());

// Get items by status (handles getLostItems, getFoundItems, getMatchedItems)
app.get('/api/items', async (req, res) => {
  const status = req.query.status;
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status parameter is required' });
  }
  
  const result = await getItemsByStatus(status);
  if (result.success) {
    // Return data in the format expected by frontend
    res.status(200).json(result.items);
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Get item by ID
app.get('/api/items/:id', async (req, res) => {
  const result = await getItemById(req.params.id);
  if (result.success) {
    // Return data in the format expected by frontend
    res.status(200).json(result.data);
  } else {
    res.status(404).json({ error: result.error });
  }
});

// Report lost item - handle FormData
app.post('/api/items/lost', upload.single('image'), async (req, res) => {
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
      status: 'LOST',
      location: req.body.venue ? `${req.body.venue} | ${req.body.specific_location || ''}` : req.body.location,
      reportDate: req.body.lost_date ? Timestamp.fromDate(new Date(req.body.lost_date)) : Timestamp.now(),      
      ownerId: req.body.userId ?? null, //remember to delete 1 once user service set
      finderId: null
    };
    
    const result = await storeItemData(itemData);
    if (result.success) {
      res.status(201).json({ 
        success: true,
        itemId: result.itemId,
        message: 'Lost item reported successfully'
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
app.post('/api/items/found', upload.single('image'), async (req, res) => {
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
      status: 'FOUND',
      location: req.body.venue ? `${req.body.venue} | ${req.body.specific_location || ''}` : req.body.location,
      reportDate: req.body.lost_date ? Timestamp.fromDate(new Date(req.body.lost_date)) : Timestamp.now(),      ownerId: req.body.userId,
      ownerId: null,
      finderId: req.body.userId ?? null //rmb delete 
    };
    
    const result = await storeItemData(itemData);
    if (result.success) {
      res.status(201).json({ 
        success: true,
        itemId: result.itemId,
        message: 'Found item reported successfully'
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
app.put('/api/items/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  const result = await updateItem(req.params.id, { status });
  if (result.success) {
    res.status(200).json({ 
      success: true,
      message: 'Item status updated successfully'
    });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Upload item image
// app.post('/api/items/upload', upload.single('file'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }
  
//   const result = await uploadImage(req.file);
//   if (result.success) {
//     res.status(201).json({ 
//       imageUrl: result.imageUrl,
//       message: 'Image uploaded successfully'
//     });
//   } else {
//     res.status(400).json({ error: result.error });
//   }
// });

// Initiate collection
app.post('/api/items/:itemId/collection', async (req, res) => {
  const result = await updateItem(req.params.itemId, { 
    status: 'COLLECTING',
    collectionDetails: req.body
  });
  
  if (result.success) {
    res.status(201).json({ 
      success: true,
      message: 'Collection initiated successfully'
    });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Get collection details
app.get('/api/items/:itemId/collection', async (req, res) => {
  const result = await getItemById(req.params.itemId);
  if (result.success && result.data.collectionDetails) {
    res.status(200).json(result.data.collectionDetails);
  } else {
    res.status(404).json({ error: 'No collection details found' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Lost and Found Item Service running on port ${PORT}`);
});
