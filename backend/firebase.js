const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get, remove } = require("firebase/database");

const firebaseConfig = {
    apiKey: "AIzaSyBHcjFGvR8HhuuMlEt9LDpxNFQyYg9V9fo",
    authDomain: "kawaii621-b1ec3.firebaseapp.com",
    databaseURL: "https://kawaii262-eec2e-default-rtdb.firebaseio.com/",
    projectId: "kawaii621-b1ec3",
    storageBucket: "kawaii621-b1ec3.appspot.com",
    messagingSenderId: "529326883726",
    appId: "1:529326883726:web:eaf6cfab2d8f8d94f11adf"
  };
  

// Initialize Firebase app and Realtime Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to read data from Firebase
async function readFromFirebase(directory) {
  try {
    const dbRef = ref(database, directory);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available at", directory);
      return null;
    }
  } catch (error) {
    console.error("Error reading data:", error);
    return null;
  }
}

// Function to write data to Firebase
async function writeToFirebase(directory, jsonData) {
  try {
    const dbRef = ref(database, directory);
    await set(dbRef, jsonData);
    console.log("Data written to", directory);
  } catch (error) {
    console.error("Error writing data:", error);
  }
}

// Function to delete data from Firebase
async function deleteFromFirebase(directory) {
  try {
    const dbRef = ref(database, directory);
    await remove(dbRef);
    console.log("Data deleted from", directory);
  } catch (error) {
    console.error("Error deleting data:", error);
  }
}

module.exports = { readFromFirebase, writeToFirebase, deleteFromFirebase };


// Example usage
//writeToFirebase('users/123', { name: 'John Doe', age: 30 });
//readFromFirebase('users/123').then((data) => console.log(data));
//deleteFromFirebase('users/123');