import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all pages
import CalendarPage from "./pages/CalendarPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import BecomeOrganizerPage from "./pages/BecomeOrganizerPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyOtpPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/become-organizer" element={<BecomeOrganizerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
