// index.js - Express API for the microservice
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { storeItemData, getItemById, updateItem, getItemsByStatus, uploadImage } from './services/itemService.js';

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get items by status (handles getLostItems, getFoundItems, getMatchedItems)
app.get('/items', async (req, res) => {
  const status = req.query.status;
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status parameter is required' });
  }
  
  const result = await getItemsByStatus(status);
  if (result.success) {
    res.status(200).json(result.items);
  } else {
    res.status(400).json(result);
  }
});

// Get item by ID
app.get('/items/:id', async (req, res) => {
  const result = await getItemById(req.params.id);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(404).json(result);
  }
});

// Report lost item
app.post('/items/lost', async (req, res) => {
  const itemData = {
    ...req.body,
    status: 'LOST',
    ownerId: req.body.userId,
    finderId: null
  };
  
  const result = await storeItemData(itemData);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Report found item
app.post('/items/found', async (req, res) => {
  const itemData = {
    ...req.body,
    status: 'FOUND',
    ownerId: null,
    finderId: req.body.userId
  };
  
  const result = await storeItemData(itemData);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Update item status
app.put('/items/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }
  
  const result = await updateItem(req.params.id, { status });
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Upload item image
app.post('/items/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  const result = await uploadImage(req.file);
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Initiate collection
app.post('/items/:itemId/collection', async (req, res) => {
  const result = await updateItem(req.params.itemId, { 
    status: 'COLLECTING',
    collectionDetails: req.body
  });
  
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Get collection details
app.get('/items/:itemId/collection', async (req, res) => {
  const result = await getItemById(req.params.itemId);
  if (result.success) {
    if (result.data.collectionDetails) {
      res.status(200).json(result.data.collectionDetails);
    } else {
      res.status(404).json({ success: false, error: 'No collection details found' });
    }
  } else {
    res.status(404).json(result);
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
