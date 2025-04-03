import React, { useState, useEffect } from "react";
import "../styles/addEventModal.css";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import emailjs from "emailjs-com";

const AddEventModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    label: "",
    category: "",
    startHour: "",
    startMinute: "",
    endHour: "",
    endMinute: "",
    date: "",
    organizer: "",
    location: "",
    eligibility: "",
    description: "",
    registrationLink: "",
  });

  // 🧠 Fetch associated club from Firestore based on logged-in user
  useEffect(() => {
    const fetchOrganizer = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const club = userDoc.data().associatedClub || "";
          setFormData((prev) => ({
            ...prev,
            organizer: club,
          }));
        }
      }
    };
    fetchOrganizer();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formatTime = (hour, minute) => {
    const h = parseInt(hour);
    const m = minute.padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

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

      // 1️⃣ Add to Firestore
      await addDoc(collection(db, "eventsFromApp"), event);

      // 2️⃣ Notify subscribers
      const usersSnapshot = await getDocs(collection(db, "users"));
      const recipients = [];

      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        for (let i = 1; i <= 5; i++) {
          const club = user[`club${i}`];
          if (club === formData.organizer) {
            recipients.push({ email: user.email, username: user.username });
            break;
          }
        }
      });

      // 3️⃣ Email via EmailJS
      for (const user of recipients) {
        const templateParams = {
          to_email: user.email,
          username: user.username,
          organizer: formData.organizer,
          label: formData.label,
          date: formData.date,
          time,
          location: formData.location,
          eligibility: formData.eligibility,
          category: formData.category,
          description: formData.description,
          registrationLink: formData.registrationLink,
        };

        await emailjs.send(
          import.meta.env.VITE_EMAIL_SERVICE_ID,
          import.meta.env.VITE_EMAIL_TEMPLATE_ID_1,
          templateParams,
          import.meta.env.VITE_EMAIL_PUBLIC_KEY,
        );
      }

      alert("Event created and notifications sent!");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding event or sending emails:", error);
      alert("Something went wrong while creating event.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>{step === 1 ? "Create Event" : "Continue…"}</h2>
          <span className="close-btn" onClick={onClose}>
            ×
          </span>
        </div>

        {step === 1 ? (
          <>
            <label>Event Name</label>
            <input
              name="label"
              placeholder="Example Event"
              onChange={handleChange}
            />

            <label>Organizer</label>
            <input
              name="organizer"
              value={formData.organizer}
              readOnly
              style={{ backgroundColor: "#eee", cursor: "not-allowed" }}
            />

            <label>Category</label>
            <input
              name="category"
              placeholder="Example Category"
              onChange={handleChange}
            />

            <label>Event Time</label>
            <div className="time-inputs">
              <input
                name="startHour"
                placeholder="01"
                onChange={handleChange}
              />
              <input
                name="startMinute"
                placeholder="00"
                onChange={handleChange}
              />
              <span>To</span>
              <input name="endHour" placeholder="24" onChange={handleChange} />
              <input
                name="endMinute"
                placeholder="00"
                onChange={handleChange}
              />
            </div>

            <label>Date</label>
            <input name="date" type="date" onChange={handleChange} />

            <button className="next-btn" onClick={() => setStep(2)}>
              NEXT
            </button>
          </>
        ) : (
          <>
            <label>Venue</label>
            <input
              name="location"
              placeholder="Example Venue"
              onChange={handleChange}
              value={formData.location}
            />

            <label>Attendee Eligibility</label>
            <input
              name="eligibility"
              placeholder="Example Attendee"
              onChange={handleChange}
              value={formData.eligibility}
            />

            <label>Event Description</label>
            <textarea
              name="description"
              placeholder="Example Description"
              onChange={handleChange}
              value={formData.description}
            />

            <label>Registration Link</label>
            <input
              name="registrationLink"
              placeholder="https://..."
              onChange={handleChange}
              value={formData.registrationLink}
            />

            <button className="create-btn" onClick={handleSubmit}>
              CREATE
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AddEventModal;
