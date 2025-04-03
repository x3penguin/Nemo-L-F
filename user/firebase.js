import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfigPath = path.join(__dirname, 'firebase-config', 'firebase.json');
const firebaseConfig = JSON.parse(readFileSync(firebaseConfigPath, 'utf8'));


// Override configuration with environment variables
firebaseConfig.apiKey = process.env.FIREBASE_API_KEY;
firebaseConfig.authDomain = process.env.FIREBASE_AUTH_DOMAIN;
firebaseConfig.projectId = process.env.FIREBASE_PROJECT_ID;
firebaseConfig.storageBucket = "gs://esd-nemo.firebasestorage.app";
firebaseConfig.messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
firebaseConfig.appId = process.env.FIREBASE_APP_ID;
firebaseConfig.measurementId = process.env.FIREBASE_MEASUREMENT_ID;


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };