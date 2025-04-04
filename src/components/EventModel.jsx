// import React from "react";
// import "../styles/calendar.css";

// const EventModal = ({ event, onClose }) => {
//   if (!event) return null;

//   return (
//     <div className="event-modal">
//       <div className="event-modal-content">
//         <span className="close-button" onClick={onClose}>
//           &times;
//         </span>
//         <h2 id="eventHeading" >{event.label}</h2>
//         <h4 id="eventOrganizer">{event.organizer}</h4>
//         <p>
//           <strong>Event Category:</strong> {event.category}
//         </p>
//         <p>
//           <strong>Date:</strong> {event.date}
//         </p>
//         <p>
//           <strong>Time:</strong> {event.time}
//         </p>
//         <p>
//           <strong>Location:</strong> {event.location}
//         </p>
//         <p>
//           <strong>Attendee Eligibility:</strong> {event.eligibility}
//         </p>
//         <p>
//           <strong>Event Description:</strong> {event.description}
//         </p>
//         <a id="eventLink" href={event.registrationLink} target="_blank" rel="noreferrer">
//           Click here to register
//         </a>
//       </div>
//     </div>
//   );
// };

// export default EventModal;

import React from "react";
import "../styles/calendar.css";

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  const formatDateTimeForGoogle = (dateStr, hour, minute) => {
    const date = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    return date.toISOString().replace(/[-:]|\.\d{3}/g, '');
  };

  const getGoogleCalendarUrl = () => {
    const start = formatDateTimeForGoogle(event.date, event.startHour, event.startMinute);
    const end = formatDateTimeForGoogle(event.date, event.endHour, event.endMinute);

    const details = {
      text: event.label,
      dates: `${start}/${end}`,
      details: event.description || '',
      location: event.location || '',
    };

    const query = new URLSearchParams(details).toString();
    return `https://www.google.com/calendar/render?action=TEMPLATE&${query}`;
  };

  return (
    <div className="event-modal">
      <div className="event-modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span> <div id="addCalendarDiv" > <img id="gcLogo" src="../src/assets/Google_Calendar_icon_(2020).svg.png" alt="" /> <a
          className="addToCalendar"
          href={getGoogleCalendarUrl()}
          target="_blank"
          rel="noreferrer"
        >
          Add to Google Calendar
        </a></div>
        
        <h2 id="eventHeading">{event.label}</h2>
        <h4 id="eventOrganizer">{event.organizer}</h4>
        <p><strong>Event Category:</strong> {event.category}</p>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Attendee Eligibility:</strong> {event.eligibility}</p>
        <p><strong>Event Description:</strong> {event.description}</p>

        {event.registrationLink && (
          <a
            id="eventLink"
            href={event.registrationLink}
            target="_blank"
            rel="noreferrer"
          >
            Click here to register
          </a>
        )}
        
       
      </div>
    </div>
  );
};

export default EventModal;