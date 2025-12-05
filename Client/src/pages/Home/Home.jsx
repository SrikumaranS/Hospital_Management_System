import React from "react";
import "./Home.css";
import AppointmentSection from "../../components/AppointmentSection/AppointmentSection";
import PrescriptionSection from "../../components/PrescriptionSection/PrescriptionSection";
import AboutSection from "../../components/AboutSection/AboutSection";
import heroImg from "../../assets/images.jpeg"; // change path/name if needed

export default function Home() {
  return (
    <div className="home-root">
      {/* Hero / top section */}
      <section id="home-section" className="home-hero">
        <div className="home-hero-text">
          <h1>HospitalCare Patient Portal</h1>
          <p>
            Seamlessly connect with our hospital. Book appointments, track your visit
            history, and access prescriptions from anywhere.
          </p>
          <div className="home-hero-grid">
            <img src={heroImg} alt="Modern hospital lobby" className="home-hero-img" />
            <ul className="home-hero-list">
              <li>24x7 emergency and OPD booking support.</li>
              <li>Experienced specialists across key departments.</li>
              <li>Digital access to your prescriptions and visit history.</li>
              <li>Secure login for patients and staff.</li>
            </ul>
          </div>
        </div>
      </section>

      <AppointmentSection />
      <PrescriptionSection />
      <AboutSection />
    </div>
  );
}
