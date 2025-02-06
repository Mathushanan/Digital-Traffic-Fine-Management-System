import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SideBar from "./components/common/SideBar";
import LogoHeader from "./components/common/LogoHeader";
import HomePage from "./components/common/HomePage";
import AboutPage from "./components/common/AboutPage";
import FaqPage from "./components/common/FaqPage";
import LegalPage from "./components/common/LegalPage";
import LoginPage from "./components/common/LoginPage";

function App() {
  return (
    <>
      <div className="d-flex">
        <Router>
          <SideBar />
          <div className="flex-grow-1">
            <LogoHeader />
            <div className="me-3 routes-div">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            </div>
          </div>
        </Router>
      </div>
    </>
  );
}

export default App;
