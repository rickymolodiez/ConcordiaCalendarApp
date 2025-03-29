
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import '../styles/addEventModal.css';

const AddEventModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    label: '',
    category: '',
    startHour: '',
    organizer: '',
    startMinute: '',
    endHour: '',
    endMinute: '',
    date: '',
    location: '',
    eligibility: '',
    description: '',
    registrationLink: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const formatTime = (hour, minute) => {
    const h = parseInt(hour);
    const m = minute.padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

//   const handleSubmit = async () => {
//     try {
//       const startH = parseInt(formData.startHour);
//       const endH = parseInt(formData.endHour);
//       const duration = endH - startH;
      
//       const time = `${formatTime(formData.startHour, formData.startMinute)} – ${formatTime(formData.endHour, formData.endMinute)}`;
      
//       const event = {
//         ...formData,
//         startHour: startH,
//         startMinute: parseInt(formData.startMinute),
//         endHour: endH,
//         endMinute: parseInt(formData.endMinute),
//         duration,
//         time,
//       };
      
//       await addDoc(collection(db, 'eventsFromApp'), event);
//       onClose();
//     } catch (error) {
//       console.error("Error adding event:", error);
//     }
//   };
  
const handleSubmit = async () => {
    try {
      const startH = parseInt(formData.startHour);
      const endH = parseInt(formData.endHour);
      const duration = endH - startH;
  
      const time = `${formatTime(formData.startHour, formData.startMinute)} – ${formatTime(formData.endHour, formData.endMinute)}`;
  
      const event = {
        ...formData,
        startHour: startH,
        startMinute: parseInt(formData.startMinute),
        endHour: endH,
        endMinute: parseInt(formData.endMinute),
        duration,
        time,
      };
  
      await addDoc(collection(db, 'eventsFromApp'), event);
      onClose();
      window.location.reload(); // ✅ force reload to fetch new events
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };
  
  
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>{step === 1 ? 'Create Event' : 'Continue…'}</h2>
          <span className="close-btn" onClick={onClose}>×</span>
        </div>

        {step === 1 ? (
          <>
            <label>Event Name</label>
            <input name="label" placeholder="Example Event" onChange={handleChange} />

            <label>Organizer</label>
<input
  name="organizer"
  placeholder="Example Organizer"
  onChange={handleChange}
  value={formData.organizer}
/>
            

            <label>Category</label>
            <input name="category" placeholder="Example Category" onChange={handleChange} />

            <label>Event Time</label>
            <div className="time-inputs">
              <input name="startHour" placeholder="01" onChange={handleChange} />
              <input name="startMinute" placeholder="00" onChange={handleChange} />
              <span>To</span>
              <input name="endHour" placeholder="24" onChange={handleChange} />
              <input name="endMinute" placeholder="00" onChange={handleChange} />
            </div>

            <label>Date</label>
            <input name="date" type="date" onChange={handleChange} />

            <button className="next-btn" onClick={() => setStep(2)}>NEXT</button>
          </>
        ) : (
          <>
           <label>Venue</label>
<input name="location" placeholder="Example Venue" onChange={handleChange} value={formData.location} />

<label>Attendee Eligibility</label>
<input name="eligibility" placeholder="Example Attendee" onChange={handleChange} value={formData.eligibility} />

<label>Event Description</label>
<textarea name="description" placeholder="Example Description" onChange={handleChange} value={formData.description} />

<label>Registration Link</label>
<input name="registrationLink" placeholder="https://..." onChange={handleChange} value={formData.registrationLink} />
            

            <button className="create-btn" onClick={handleSubmit}>CREATE</button>
          </>
        )}
      </div>
    </div>
  );
};

export default AddEventModal;
