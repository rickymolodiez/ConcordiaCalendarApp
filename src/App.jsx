import React from 'react'
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useState, useEffect } from 'react';

const App = () => {
 
// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const [events, setEvents] = useState([]); 
useEffect(() => {
  async function fetchData() {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventsList = [];
      querySnapshot.forEach((doc) => {
        eventsList.push(doc.data());
      });
      setEvents(eventsList); 
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }
  fetchData();
}, []);
  
  return (
   
    <div>
    <h1 className='text-3xl font-bold underline'>Hello GDSC!</h1>
    <ul className='mt-4'>
      {events.length > 0 ? (
        events.map((events, index) => (
          <li key={index} className='border p-2 my-2 bg-gray-100'>
            {JSON.stringify(events)}
          </li>
        ))
      ) : (
        <p>No Events found.</p>
      )}
    </ul>
  </div>
  )
}


export default App
