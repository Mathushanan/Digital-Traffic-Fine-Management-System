import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Pagination from "./components/common/Pagination";
import { useState } from "react";
import SideBar from "./components/common/SideBar";
import LogoHeader from "./components/common/LogoHeader";
import ImageSlider from "./components/common/ImageSlider";
import HomePage from "./components/common/HomePage";
import AboutPage from "./components/common/AboutPage";
import FaqPage from "./components/common/FaqPage";
import LegalPage from "./components/common/LegalPage";

function App() {
  return (
    <>
      <div className="d-flex border">
        <Router>
          <SideBar />
          <div className="flex-grow-1 border">
            <LogoHeader />
            <div className="border me-3">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/legal" element={<LegalPage />} />
              </Routes>
            </div>
          </div>
        </Router>
      </div>
    </>
  );
}

export default App;
