
import React, { useEffect, useState } from "react";
import "../styles/sideWidgets.css";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import CLUB_COLORS from "../constants/clubColors";

const SidebarWidgets = ({ subscriptions = [], onVisibilityChange, onDeleteSubscription }) => {
  const [nextEvent, setNextEvent] = useState(null);
  const [visibilityMap, setVisibilityMap] = useState({});
  const [showManage, setShowManage] = useState(false);

  // Initialize visibility state
  useEffect(() => {
    const initialMap = {};
    subscriptions.forEach((club) => {
      initialMap[club] = true;
    });
    setVisibilityMap(initialMap);
  }, [subscriptions]);

  // Fetch upcoming event
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const snapshot1 = await getDocs(collection(db, "eventsFromApp"));
        const snapshot2 = await getDocs(collection(db, "events"));

        const events1 = snapshot1.docs.map((doc) => {
          const data = doc.data();
          const startDateTime = new Date(`${data.date}T${String(data.startHour).padStart(2, '0')}:${String(data.startMinute).padStart(2, '0')}`);
          return { ...data, startDateTime };
        });

        const events2 = snapshot2.docs.map((doc) => {
          const data = doc.data();
          if (!data.date || isNaN(new Date(data.date))) return null;
          const start = new Date(data.date);
          return { ...data, startDateTime: start };
        }).filter(Boolean);

        const now = new Date();
        const allEvents = [...events1, ...events2];
        const upcoming = allEvents
          .filter((event) => subscriptions.includes(event.organizer))
          .filter((event) => event.startDateTime > now)
          .sort((a, b) => a.startDateTime - b.startDateTime);

        if (upcoming.length > 0) setNextEvent(upcoming[0]);
        else setNextEvent(null);
      } catch (err) {
        console.error("Failed to fetch next event:", err);
      }
    };

    fetchUpcoming();
  }, [subscriptions]);

  // Toggle event visibility
  const handleToggle = (club) => {
    const updated = { ...visibilityMap, [club]: !visibilityMap[club] };
    setVisibilityMap(updated);
    onVisibilityChange(updated);
  };

  // Handle deleting a subscription
  const handleDeleteSubscription = async (clubToRemove) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const updateObj = {};

    for (let i = 1; i <= 5; i++) {
      if (userData[`club${i}`] === clubToRemove) {
        updateObj[`club${i}`] = "none";
        break;
      }
    }

    try {
      await updateDoc(userRef, updateObj);

      const updatedVisibility = { ...visibilityMap };
      delete updatedVisibility[clubToRemove];
      setVisibilityMap(updatedVisibility);
      onVisibilityChange(updatedVisibility);

      if (onDeleteSubscription) onDeleteSubscription();
    } catch (err) {
      console.error("Error deleting subscription:", err);
    }
  };

  return (
    <div className="sidebar-widgets">
      <div className="widget-box">
        <h2 className="widget-title">Next Event</h2>
        {nextEvent ? (
          <div className="next-event-details">
            <h3>{nextEvent.label}</h3>
            <p><strong>Organizer:</strong> {nextEvent.organizer}</p>
            <p><strong>Date:</strong> {nextEvent.date}</p>
            <p><strong>Time:</strong> {nextEvent.time}</p>
            <p><strong>Venue:</strong> {nextEvent.location}</p>
            <p><strong>Eligibility:</strong> {nextEvent.eligibility}</p>
            <p><strong>Category:</strong> {nextEvent.category}</p>
          </div>
        ) : (
          <p style={{ fontStyle: "italic" }}>No upcoming events.</p>
        )}
      </div>

      <div className="widget-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="widget-title">My subscriptions</h2>
          {/* <button className="manage-btn" onClick={() => setShowManage((prev) => !prev)}>
            {showManage ? "Done" : "Manage"}
          </button> */}
        </div>

        <ul className="subscription-list">
          {subscriptions.map((club, index) => {
            const clubColor = CLUB_COLORS[club] || "#ccc";
            return (
              <li key={index}>
                <label className="toggle-line">
                  <input
                    type="checkbox"
                    checked={visibilityMap[club]}
                    onChange={() => handleToggle(club)}
                    disabled={showManage}
                  />
                  <span
                    className="slider"
                    style={{ backgroundColor: visibilityMap[club] ? clubColor : "#ccc" }}
                  />
                  <span className="club-name">{club}</span>
                  {showManage && (
                    <button
                      className="delete-sub-btn"
                      onClick={() => handleDeleteSubscription(club)}
                      title="Unsubscribe"
                    >
                      ✕
                    </button>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SidebarWidgets;
