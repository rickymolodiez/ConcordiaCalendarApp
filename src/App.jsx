import React from 'react'
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useState, useEffect } from 'react';
import "./App.css";
import WeeklyCalendar from './components/WeeklyCalendar';
import SidebarWidgets from './components/SideWidgets';
import SearchDropdown from './components/SearchDropdown';
import { db } from '../src/firebase'; // ✅ Fixes the 'db is not defined' error
import AddEventModal from './components/AddEventModal'; // ✅ Make sure the path is correct


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

  
const [subscriptions, setSubscriptions] = useState([]);
const [showAddModal, setShowAddModal] = useState(false);
// const [visibleClubs, setVisibleClubs] = useState(subscriptions);

const [visibleClubs, setVisibleClubs] = useState([]);

useEffect(() => {
  // Whenever subscriptions change, make all visible by default
  setVisibleClubs(subscriptions);
}, [subscriptions]);

const handleVisibilityChange = (map) => {
  const visible = Object.keys(map).filter(club => map[club]);
  setVisibleClubs(visible);
};

  
const handleSubscribe = (clubName) => {
  setSubscriptions((prev) => 
    prev.includes(clubName) ? prev : [...prev, clubName]
  );
};


// const app = initializeApp(firebaseConfig);

// const db = getFirestore(app);


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
   
   <div id='container'>
    <div id='navbarDiv' >
   <div id='logoDiv' >
   <img id="logo" src="../src/assets/ConUEventsLogo.png" alt="" />
   </div>
   <div id='searchAddEventDiv' >
   {/* <div className="search-bar">
   <img src="../src/assets/searchIcon.png" alt="Search" className="search-icon" />
  <input type="text" placeholder="Search events, clubs and more..." />
  <SearchDropdown onSubscribe={handleSubscribe} />

</div> */}

<div className="">
   
  <SearchDropdown onSubscribe={handleSubscribe} />

  {showAddModal && (
  <AddEventModal onClose={() => setShowAddModal(false)} />
)}


</div>
   
{/* <button className="add-event-btn click-effect">
  <span>add event</span>
  <img src="../src/assets/add.png" alt="Add" className="plus-icon" />
</button> */}

<button className="add-event-btn click-effect" onClick={() => setShowAddModal(true)}>
  <span>add event</span>
  <img src="../src/assets/add.png" alt="Add" className="plus-icon" />
</button>

   
<div className="profile-icon click-effect">
  <img src="../src/assets/userIcon.png" alt="Profile" />
</div>
   
   

   </div>
   </div>
    <div id='mainDiv' > 
      <SidebarWidgets  subscriptions={subscriptions}
  onVisibilityChange={handleVisibilityChange} ></SidebarWidgets>
     
   <div id='mySubscriptionsDiv' >

   </div>
   <div id='calendarDiv' >
   <WeeklyCalendar subscriptions={visibleClubs} ></WeeklyCalendar>
   </div>
  
   
   </div>
  </div>

  )
}

export default App
