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

function App() {
  return (
    <>
      <div className="d-flex border">
        <Router>
          <SideBar />
          <div className="flex-grow-1 border">
            <LogoHeader />
            <div className="border">
              hello
              <Routes>
                <Route path="/" element={""} />
              </Routes>
            </div>
          </div>
        </Router>
      </div>
    </>
  );
}

export default App;
