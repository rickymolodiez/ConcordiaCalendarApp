import React from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import "../App.css";
import WeeklyCalendar from "../components/WeeklyCalendar";
import SidebarWidgets from "../components/SideWidgets";
import SearchDropdown from "../components/SearchDropdown";
import { db } from "../firebase"; // ✅ Fixes the 'db is not defined' error
import AddEventModal from "../components/AddEventModal"; // ✅ Make sure the path is correct
import { doc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";

const CalenderPage = () => {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const [subscriptions, setSubscriptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  // const [visibleClubs, setVisibleClubs] = useState(subscriptions);

  const [visibleClubs, setVisibleClubs] = useState([]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));

          const subClubs = [];
          for (let i = 1; i <= 5; i++) {
            const club = userData[`club${i}`];
            if (club && club !== "none") subClubs.push(club);
          }
          setSubscriptions(subClubs);
        }
      }
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  useEffect(() => {
    // Whenever subscriptions change, make all visible by default
    setVisibleClubs(subscriptions);
  }, [subscriptions]);

  const handleVisibilityChange = (map) => {
    const visible = Object.keys(map).filter((club) => map[club]);
    setVisibleClubs(visible);
  };

  const handleSubscribe = async (clubName) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !user) return;

    const updatedSubs = [...subscriptions];
    if (!updatedSubs.includes(clubName)) {
      updatedSubs.push(clubName);
      setSubscriptions(updatedSubs);

      const docRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(docRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const updateObj = {};

        for (let i = 1; i <= 5; i++) {
          const key = `club${i}`;
          if (data[key] === "none") {
            updateObj[key] = clubName;
            break;
          }
        }

        await updateDoc(docRef, updateObj);

        // 🔄 Fetch updated user and sync
        const freshSnap = await getDoc(docRef);
        if (freshSnap.exists()) {
          const freshUser = freshSnap.data();
          localStorage.setItem("user", JSON.stringify(freshUser));
          setUser(freshUser);

          const subs = [];
          for (let i = 1; i <= 5; i++) {
            const club = freshUser[`club${i}`];
            if (club && club !== "none") subs.push(club);
          }
          setSubscriptions(subs);
        }
      }
    }
  };

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
    <div id="container">
      <div id="navbarDiv">
        <div id="logoDiv">
          <img id="logo" src="../src/assets/ConUEventsLogo.png" alt="" />
        </div>
        <div id="searchAddEventDiv">
          <div className="">
            <SearchDropdown onSubscribe={handleSubscribe} />

            {showAddModal && (
              <AddEventModal onClose={() => setShowAddModal(false)} />
            )}
          </div>

          {user?.role === "organizer" && (
            <button
              className="add-event-btn click-effect"
              onClick={() => setShowAddModal(true)}
            >
              <span>add event</span>
              <img
                src="../src/assets/add.png"
                alt="Add"
                className="plus-icon"
              />
            </button>
          )}

          <div className="profile-icon-container">
            <img
              className="profile-icon click-effect"
              src="../src/assets/login2.png"
              alt="Profile"
            />
            {auth.currentUser && (
              <p className="profile-email">{auth.currentUser.email}</p>
            )}
          </div>
        </div>
      </div>
      <div id="mainDiv">
        <SidebarWidgets
          subscriptions={subscriptions}
          onVisibilityChange={handleVisibilityChange}
        ></SidebarWidgets>

        <div id="mySubscriptionsDiv"></div>
        <div id="calendarDiv">
          <WeeklyCalendar subscriptions={visibleClubs}></WeeklyCalendar>
        </div>
      </div>
    </div>
  );
};

export default CalenderPage;
