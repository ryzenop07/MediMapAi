import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import "./index.css"
import Auth from "./pages/Auth"
import PatientDashboard from "./pages/PatientDashboard"
import PharmacistDashboard from "./pages/PharmacistDashboard"

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/pharmacist" element={<PharmacistDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
