import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './firebase.js'; // Import Firestore reference
import { collection, addDoc, doc, query, where, getDoc, getDocs, writeBatch, updateDoc } from "firebase/firestore";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('User Microservice is running!');
});

// Route to create a new user (POST)
app.post('/users', async (req, res) => {
  const { email, password, phone, name } = req.body;

  if (!email || !password || !phone || !name) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save user data in Firestore
    const docRef = await addDoc(collection(db, 'users'), {
      name,
      email,
      password: hashedPassword,
      phone,
      createdAt: new Date(),
    });
    const userId = docRef.id;
    // Generate JWT token
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).send({ message: 'User created successfully', userId, token });


  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send({ message: 'Failed to create user', error: error.message });
  }
});

// Route to get user details (GET)
app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User document does not exist');
    }
    const user = userDoc.data();

    const addressQuery = query(collection(db, 'userAddress'), where('userId', '==', userId));
    const addressDocs = await getDocs(addressQuery);
    const addressDoc = addressDocs.docs[0];

    if (!addressDoc) {
      throw new Error('Address document does not exist');
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
    console.error('Error fetching user details:', error);
    res.status(404).send({ message: error.message });
  }
});


//Route to login 
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  try {
    // Query Firestore for the user
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    let user = null;

    querySnapshot.forEach((doc) => {
      if (doc.data().email === email) {
        user = { id: doc.id, ...doc.data() };
      }
    });

    if (!user) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Verify the password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).send({ message: 'Login successful', userId: user.id, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({ message: 'Failed to log in', error: error.message });
  }
});

app.get('/api/users/:id/matches/new', async (req, res) => {
  const userId = req.params.id;

  try {
    // Query Firestore for matched items where this user is involved
    const itemsRef = collection(db, 'items');
    
    // Query for items where user is the owner (lost items that were found)
    const ownerQuery = query(
      itemsRef, 
      where('status', '==', 'MATCHED'),
      where('ownerId', '==', userId),
      where('notificationSeen', '==', false)
    );
    
    // Query for items where user is the finder (found items that were matched)
    const finderQuery = query(
      itemsRef, 
      where('status', '==', 'MATCHED'),
      where('finderId', '==', userId),
      where('notificationSeen', '==', false)
    );
    
    // Run both queries
    const [ownerQuerySnapshot, finderQuerySnapshot] = await Promise.all([
      getDocs(ownerQuery),
      getDocs(finderQuery)
    ]);
    
    // Combine the results
    const matches = [];
    
    ownerQuerySnapshot.forEach((doc) => {
      const data = doc.data();
      matches.push({
        id: doc.id,
        itemId: doc.id,
        matchedItemId: data.matchedItemId,
        itemName: data.name,
        confidence: data.matchingConfidence || 0,
        matchedDate: data.matchedDate,
        type: 'lost',  // This was a lost item that was found
        seen: false
      });
    });
    
    finderQuerySnapshot.forEach((doc) => {
      const data = doc.data();
      matches.push({
        id: doc.id,
        itemId: doc.id,
        matchedItemId: data.matchedItemId,
        itemName: data.name,
        confidence: data.matchingConfidence || 0,
        matchedDate: data.matchedDate,
        type: 'found',  // This was an item the user found that was matched
        seen: false
      });
    });
    
    // If there are matches, mark them as seen
    if (matches.length > 0) {
      const batch = writeBatch(db);
      
      // Mark all as seen in Firestore
      [...ownerQuerySnapshot.docs, ...finderQuerySnapshot.docs].forEach((doc) => {
        batch.update(doc.ref, { notificationSeen: true });
      });
      
      // Commit the batch
      await batch.commit();
    }
    
    res.json({ matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch matches'
    });
  }
});

// Route to mark a notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  const notificationId = req.params.id;
  
  try {
    const notificationRef = doc(db, 'items', notificationId);
    await updateDoc(notificationRef, { notificationRead: true });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update notification'
    });
  }
});

app.post('/api/test/create-match', async (req, res) => {
  const { lostItemId, foundItemId, confidence = 90 } = req.body;
  
  if (!lostItemId || !foundItemId) {
    return res.status(400).json({
      success: false,
      error: 'Both lostItemId and foundItemId are required'
    });
  }
  
  try {
    // Get the lost item
    const lostItemRef = doc(db, 'items', lostItemId);
    const lostItemDoc = await getDoc(lostItemRef);
    
    if (!lostItemDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: `Lost item with ID ${lostItemId} not found`
      });
    }
    
    // Get the found item
    const foundItemRef = doc(db, 'items', foundItemId);
    const foundItemDoc = await getDoc(foundItemRef);
    
    if (!foundItemDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: `Found item with ID ${foundItemId} not found`
      });
    }
    
    const lostItem = lostItemDoc.data();
    const foundItem = foundItemDoc.data();
    
    // Update both items as matched
    const batch = writeBatch(db);
    
    // Update lost item
    batch.update(lostItemRef, {
      status: 'MATCHED',
      matchedItemId: foundItemId,
      matchingConfidence: confidence,
      matchedDate: new Date(),
      finderId: foundItem.finderId,
      notificationSeen: false,
      notificationRead: false
    });
    
    // Update found item
    batch.update(foundItemRef, {
      status: 'MATCHED',
      matchedItemId: lostItemId,
      matchingConfidence: confidence,
      matchedDate: new Date(),
      ownerId: lostItem.ownerId,
      notificationSeen: false,
      notificationRead: false
    });
    
    // Commit the batch
    await batch.commit();
    
    res.json({
      success: true,
      message: 'Match created successfully',
      match: {
        lostItemId,
        foundItemId,
        confidence
      }
    });
    
  } catch (error) {
    console.error('Error creating test match:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create test match'
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
