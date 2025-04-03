import React, { useState } from "react";
import "../styles/Verify.css"; // ✅ Make this style match the UI
import backgroundImg from "../assets/hall3.png"; // 🏫 Your image
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const updated = [...otpInput];
    updated[index] = value;
    setOtpInput(updated);

    // Auto move to next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otpInput.join("");
    const savedOtp = localStorage.getItem("otp");
    const userData = JSON.parse(localStorage.getItem("registrationData"));

    if (enteredOtp === savedOtp) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password,
        );

        const firebaseUser = userCredential.user;

        const userRecord = {
          uid: firebaseUser.uid,
          username: userData.username,
          email: userData.email,
          role: "student",
          associatedClub: "none",
          club1: "none",
          club2: "none",
          club3: "none",
          club4: "none",
          club5: "none",
        };

        await setDoc(doc(db, "users", firebaseUser.uid), userRecord);

        localStorage.setItem("user", JSON.stringify(userRecord));
        localStorage.removeItem("otp");
        localStorage.removeItem("registrationData");

        alert("Registration successful!");
        navigate("/calendar");
      } catch (error) {
        console.error("Firebase Auth error:", error);
        alert("Registration failed. Try again.");
      }
    } else {
      alert("Incorrect OTP. Please try again.");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-left">
        <img src={backgroundImg} alt="Verify" />
      </div>

      <div className="verify-right">
        <img className="logo" src="../src/assets/ConUEventsLogo.png" alt="hi" />

        <div className="verify-box">
          <h2>VERIFY OTP</h2>

          <div className="otp-inputs">
            {otpInput.map((val, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(i, e.target.value)}
              />
            ))}
          </div>
        </div>
        <button className="verify-btn" onClick={handleVerify}>
          VERIFY
        </button>

        <div className="footer-links">
          <a href="/">Skip login</a>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
