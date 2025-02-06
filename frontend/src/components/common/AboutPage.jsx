import React from "react";
import { FaRegLightbulb, FaBullhorn, FaUsers, FaCogs } from "react-icons/fa";

const AboutPage = () => {
  return (
    <div className="container my-5 about-page">
      {/* Vision */}
      <section className="text-center mb-4">
        <h2 className="text-primary fs-5">Vision</h2>
        <p>
          "A responsive organization aspiring towards excellence through modern
          technology in motor traffic regulation!"
        </p>
      </section>

      {/* Mission */}
      <section className="text-center mb-5">
        <h2 className="text-primary fs-5">Mision</h2>
        <p>
          "Efficiently executing rules and regulations through teamwork and
          technology to create a responsive government organization!"
        </p>
      </section>

      {/* Values */}
      <section className="text-center mb-4">
        <h2 className="text-primary fs-5">Values</h2>
        <div className="row">
          <div className="col-6 col-md-3 mb-4">
            <div className="card p-3">
              <FaRegLightbulb
                size={40}
                className="text-primary mb-3 card-icon"
              />
              <p>Public Appreciation</p>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-4">
            <div className="card p-3">
              <FaBullhorn size={40} className="text-primary mb-3 card-icon" />
              <p>Efficiency & Effectiveness</p>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-4">
            <div className="card p-3">
              <FaUsers size={40} className="text-primary mb-3 card-icon" />
              <p>Customer Satisfaction</p>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-4">
            <div className="card p-3">
              <FaCogs size={40} className="text-primary mb-3 card-icon" />
              <p>Employee Motivation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Policy */}
      <section className="">
        <h2 className="text-primary fs-5 ">Quality Policy</h2>
        <p className="text-start">
          “We at the Department of Motor Traffic abide by the Motor Traffic Act
          of Sri Lanka and always strive to meet and exceed our customer
          expectations, developing and supporting our colleagues to deliver our
          promise and never compromise social obligations as a responsive public
          service organization. Our aim is to live up to our VISION and MISSION
          with a relentless focus on monitoring the organizational objectives,
          continual improvement of systems, standards, and risk-based thinking
          as per ISO 9001:2015 requirements, while meeting regulatory and other
          relevant requirements for our service offerings.”
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
