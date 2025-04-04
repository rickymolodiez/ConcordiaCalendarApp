import React, { useState } from "react";
import "../styles/login.css";
import backgroundImg from "../assets/jmsb1.png";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // make sure your firebase.js exports auth
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/calendar");
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/calendar");
      } else {
        alert("Logged in but user profile not found in Firestore.");
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      alert("Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={backgroundImg} alt="Concordia" />
      </div>

      <div className="login-right">
        <img
          className="logo1"
          src="../src/assets/ConUEventsLogo.png"
          alt="hi"
        />

        <div className="login-box">
          <h2>
            LOGIN TO YOUR <br /> ACCOUNT
          </h2>

          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div class="login-btn-div">
          <button className="login-btn" onClick={handleLogin}>
            LOGIN
          </button>

          <div className="signup-text">
            <p>Don't have an account?</p>
            <span onClick={() => navigate("/register")}>Sign Up now</span>
          </div>
        </div>

        <div className="footer-links">
          <a href="#" onClick={() => navigate("/calendar")}>
            Skip login
          </a>
          <span>|</span>

          <a href="#">Become an Organizer</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
