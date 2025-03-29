import React from 'react';
import '../styles/calendar.css';

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="event-modal">
      <div className="event-modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>{event.label}</h2>
        <h4>{event.club}</h4>
        <p><strong>Event Category:</strong> {event.category}</p>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Attendee Eligibility:</strong> {event.eligibility}</p>
        <p><strong>Event Description:</strong> {event.description}</p>
        <a href={event.registrationLink} target="_blank" rel="noreferrer">
          Click here to register
        </a>
      </div>
    </div>
  );
};

export default EventModal;
