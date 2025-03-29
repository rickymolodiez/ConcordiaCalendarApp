
// import React, { useEffect, useState } from 'react';
// import '../styles/sideWidgets.css';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase';

// const SidebarWidgets = ({ subscriptions = [] }) => {
//   const [nextEvent, setNextEvent] = useState(null);

//   useEffect(() => {
//     const fetchUpcoming = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "eventsFromApp"));
//         const allEvents = snapshot.docs.map(doc => doc.data());

//         // Only events by subscribed organizers
//         const filtered = allEvents.filter(event =>
//           subscriptions.includes(event.organizer)
//         );

//         const now = new Date();

//         // Convert event date + time to Date objects and filter future events
//         const upcoming = filtered
//           .map(event => {
//             const eventDateTime = new Date(`${event.date}T${String(event.startHour).padStart(2, '0')}:${String(event.startMinute).padStart(2, '0')}`);
//             return { ...event, eventDateTime };
//           })
//           .filter(event => event.eventDateTime > now)
//           .sort((a, b) => a.eventDateTime - b.eventDateTime);

//         if (upcoming.length) {
//           setNextEvent(upcoming[0]);
//         }
//       } catch (err) {
//         console.error("Failed to fetch next event:", err);
//       }
//     };

//     fetchUpcoming();
//   }, [subscriptions]);

//   return (
//     <div className="sidebar-widgets">
//       <div className="widget-box">
//         <h2 className="widget-title">Next Event</h2>
//         {nextEvent ? (
//           <div className="next-event-details">
//             <h3>{nextEvent.label}</h3>
//             <p><strong>Organizer:</strong> {nextEvent.organizer}</p>
//             <p><strong>Date:</strong> {nextEvent.date}</p>
//             <p><strong>Time:</strong> {nextEvent.time}</p>
//             <p><strong>Venue:</strong> {nextEvent.location}</p>
//             <p><strong>Eligibility:</strong> {nextEvent.eligibility}</p>
//             <p><strong>Category:</strong> {nextEvent.category}</p>
//           </div>
//         ) : (
//           <p style={{ fontStyle: 'italic' }}>No upcoming events.</p>
//         )}
//       </div>

//       <div className="widget-box">
//         <h2 className="widget-title">My subscriptions</h2>
//         <ul className="subscription-list">
//           {subscriptions.map((club, index) => (
//             <li key={index}>
//               <span className="check-icon">✔</span> {club}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default SidebarWidgets;



import React, { useEffect, useState } from 'react';
import '../styles/sideWidgets.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const SidebarWidgets = ({ subscriptions = [], onVisibilityChange }) => {
  const [nextEvent, setNextEvent] = useState(null);
  const [visibilityMap, setVisibilityMap] = useState({});

  useEffect(() => {
    // Initialize visibilityMap when subscriptions change
    const initialMap = {};
    subscriptions.forEach(club => {
      initialMap[club] = true;
    });
    setVisibilityMap(initialMap);
  }, [subscriptions]);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const snapshot = await getDocs(collection(db, "eventsFromApp"));
        const allEvents = snapshot.docs.map(doc => doc.data());

        const filtered = allEvents.filter(event =>
          subscriptions.includes(event.organizer)
        );

        const now = new Date();
        const upcoming = filtered
          .map(event => {
            const eventDateTime = new Date(`${event.date}T${String(event.startHour).padStart(2, '0')}:${String(event.startMinute).padStart(2, '0')}`);
            return { ...event, eventDateTime };
          })
          .filter(event => event.eventDateTime > now)
          .sort((a, b) => a.eventDateTime - b.eventDateTime);

        if (upcoming.length) {
          setNextEvent(upcoming[0]);
        }
      } catch (err) {
        console.error("Failed to fetch next event:", err);
      }
    };

    fetchUpcoming();
  }, [subscriptions]);

  const handleToggle = (club) => {
    const updated = {
      ...visibilityMap,
      [club]: !visibilityMap[club]
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
            <p><strong>Organizer:</strong> {nextEvent.organizer}</p>
            <p><strong>Date:</strong> {nextEvent.date}</p>
            <p><strong>Time:</strong> {nextEvent.time}</p>
            <p><strong>Venue:</strong> {nextEvent.location}</p>
            <p><strong>Eligibility:</strong> {nextEvent.eligibility}</p>
            <p><strong>Category:</strong> {nextEvent.category}</p>
          </div>
        ) : (
          <p style={{ fontStyle: 'italic' }}>No upcoming events.</p>
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
