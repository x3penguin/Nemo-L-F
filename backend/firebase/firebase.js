import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOmdeLiI0aZKbWJ-hGrNYsrcceRd1g__0",
  authDomain: "esd-nemo.firebaseapp.com",
  projectId: "esd-nemo",
  storageBucket: "esd-nemo.firebasestorage.app",
  messagingSenderId: "175627625250",
  appId: "1:175627625250:web:c3d69ab7cd1c8bf3067b7b",
  measurementId: "G-1NQY2JCM0X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
