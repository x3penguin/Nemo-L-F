import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './firebase/firebase.js'; // Import Firestore reference
import { collection, addDoc, doc, query, where, getDoc, getDocs } from "firebase/firestore";
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

// Start the server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
