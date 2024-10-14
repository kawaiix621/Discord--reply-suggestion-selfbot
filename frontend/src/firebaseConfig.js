import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database"; // Add 'remove' here

const firebaseConfig = {
  apiKey: "AIzaSyBHcjFGvR8HhuuMlEt9LDpxNFQyYg9V9fo",
  authDomain: "kawaii621-b1ec3.firebaseapp.com",
  databaseURL: "https://kawaii262-eec2e-default-rtdb.firebaseio.com/",
  projectId: "kawaii621-b1ec3",
  storageBucket: "kawaii621-b1ec3.appspot.com",
  messagingSenderId: "529326883726",
  appId: "1:529326883726:web:eaf6cfab2d8f8d94f11adf"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, set, remove }; // Export 'remove'
