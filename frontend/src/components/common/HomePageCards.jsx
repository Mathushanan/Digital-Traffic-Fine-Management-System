import React from "react";
import {
  FaLaptopCode,
  FaNewspaper,
  FaImages,
  FaPhoneAlt,
  FaUserPlus,
} from "react-icons/fa"; // Import necessary icons

const HomePageCards = () => {
  const sections = [
    {
      icon: <FaLaptopCode />,
      title: "E-Services",
      text: "Report your Complaints",
    },
    {
      icon: <FaNewspaper />,
      title: "Media",
      text: "Press Releases & News Updates",
    },
    {
      icon: <FaImages />,
      title: "Gallery",
      text: "Image & Video Collection",
    },
    {
      icon: <FaPhoneAlt />,
      title: "Contact us",
      text: "Telephone & Police Stations",
    },
    {
      icon: <FaUserPlus />,
      title: "Join",
      text: "Become a Peace Officer",
    },
  ];

  return (
    <div className="container py-4 home-cards">
      <div className="row justify-content-center g-4">
        {sections.map((section, index) => (
          <div key={index} className="col-12 col-md-4 col-lg-2">
            <div className="card shadow-sm border rounded-3 p-2 text-center">
              <div className="icon-container mb-3" style={{ fontSize: "2em" }}>
                {section.icon}
              </div>
              <h5 className="card-title">{section.title}</h5>
              <p className="card-text">{section.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePageCards;
