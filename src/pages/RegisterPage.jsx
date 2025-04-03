import React, { useState } from "react";
import "../styles/Register.css";
import backgroundImg from "../assets/1668707729293.jpg"; // 🏫 Your left image
import emailjs from "emailjs-com";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async () => {
    if (!formData.email || !formData.username || !formData.password) {
      alert("Please fill in all fields before requesting an OTP.");
      return;
    }

    const otp = generateOTP();

    localStorage.setItem("otp", otp); // Save OTP for verification
    localStorage.setItem("registrationData", JSON.stringify(formData));

    const templateParams = {
      to_name: formData.username,
      to_email: formData.email,
      passcode: otp, // 👈 must match the EmailJS template variable
    };

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAIL_SERVICE_ID,
        import.meta.env.VITE_EMAIL_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAIL_PUBLIC_KEY,
      );

      alert("OTP sent to your email!");
      navigate("/verify"); // 👉 Go to OTP verification page
    } catch (error) {
      console.error("Email send failed:", error);
      alert("Failed to send OTP. Try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <img src={backgroundImg} alt="University" />
      </div>

      <div className="register-right">
        <img
          className="logo1"
          src="../src/assets/ConUEventsLogo.png"
          alt="hi"
        />

        <div className="register-box">
          <h2>REGISTER</h2>
          <label>User Name</label>
          <input
            name="username"
            value={formData.username}
            // placeholder='username'
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <label>Email Address</label>
          <input
            name="email"
            type="email"
            // placeholder='email'
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <label>Password</label>
          <input
            name="password"
            type="password"
            // placeholder='password'
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
        <button className="register-btn" onClick={handleSendOTP}>
          GET OTP
        </button>

        <div className="footer-links">
          <a href="/">Skip login</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
