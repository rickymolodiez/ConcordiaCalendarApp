import React, { useEffect, useState } from "react";
import "../styles/sideWidgets.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const SidebarWidgets = ({ subscriptions = [], onVisibilityChange }) => {
  const [nextEvent, setNextEvent] = useState(null);
  const [visibilityMap, setVisibilityMap] = useState({});

  useEffect(() => {
    // Initialize visibilityMap when subscriptions change
    const initialMap = {};
    subscriptions.forEach((club) => {
      initialMap[club] = true;
    });
    setVisibilityMap(initialMap);
  }, [subscriptions]);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const snapshot1 = await getDocs(collection(db, "eventsFromApp"));
        const snapshot2 = await getDocs(collection(db, "events"));

        const events1 = snapshot1.docs.map((doc) => doc.data());

        const events2 = snapshot2.docs
          .map((doc) => {
            const data = doc.data();
            if (!data.date || isNaN(new Date(data.date))) return null;

            const start = new Date(data.date);
            const end = new Date(
              start.getTime() + data.duration * 60 * 60 * 1000,
            );

            return {
              label: data.name || "Untitled Event",
              organizer: data.organizer || "Unknown",
              date: start.toISOString().split("T")[0],
              time: `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              location: data.location || "N/A",
              eligibility: "Open to all",
              category: "General",
            };
          })
          .filter((e) => e); // ✅ remove invalid entries

        const allEvents = [...events1, ...events2];
      } catch (err) {
        console.error("Failed to fetch next event:", err);
      }
    };

    fetchUpcoming();
  }, [subscriptions]);

  const handleToggle = (club) => {
    const updated = {
      ...visibilityMap,
      [club]: !visibilityMap[club],
    };
    setVisibilityMap(updated);
    onVisibilityChange(updated); // Notify parent (like App.jsx)
  };

  return (
    <div className="sidebar-widgets">
      <div className="widget-box">
        <h2 className="widget-title">Next Event</h2>
        {nextEvent ? (
          <div className="next-event-details">
            <h3>{nextEvent.label}</h3>
            <p>
              <strong>Organizer:</strong> {nextEvent.organizer}
            </p>
            <p>
              <strong>Date:</strong> {nextEvent.date}
            </p>
            <p>
              <strong>Time:</strong> {nextEvent.time}
            </p>
            <p>
              <strong>Venue:</strong> {nextEvent.location}
            </p>
            <p>
              <strong>Eligibility:</strong> {nextEvent.eligibility}
            </p>
            <p>
              <strong>Category:</strong> {nextEvent.category}
            </p>
          </div>
        ) : (
          <p style={{ fontStyle: "italic" }}>No upcoming events.</p>
        )}
      </div>

      <div className="widget-box">
        <h2 className="widget-title">My subscriptions</h2>
        <ul className="subscription-list">
          {subscriptions.map((club, index) => (
            <li key={index}>
              <label className="toggle-line">
                <input
                  type="checkbox"
                  checked={visibilityMap[club]}
                  onChange={() => handleToggle(club)}
                />
                <span className="slider" />
                <span className="club-name">{club}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SidebarWidgets;
