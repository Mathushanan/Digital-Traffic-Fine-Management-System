import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const stations = [
  {
    id: 1,
    name: "Colombo Fort Police Station - 01",
    city: "Colombo",
    contact: "011-2433333",
    email: "colombo_fort01@police.lk",
    address: "No. 22, Chatham Street, Colombo 01, Sri Lanka",
    adminName: "John Doe",
    adminEmail: "john.doe@police.lk",
    adminContact: "011-1234567",
    badgeNumber: "12345",
  },
  {
    id: 2,
    name: "Kandy Police Station - 01",
    city: "Kandy",
    contact: "081-2222222",
    email: "kandy01@police.lk",
    address: "74, Peradeniya Road, Kandy, Sri Lanka",
    adminName: "Jane Smith",
    adminEmail: "jane.smith@police.lk",
    adminContact: "081-7654321",
    badgeNumber: "67890",
  },
  // Add other stations here...
];

const EditStations = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter stations based on the search term
  const filteredStations = stations.filter(
    (station) =>
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-5">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search Stations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {stations.map((station) => (
          <div className="col" key={station.id}>
            <div className="card shadow-lg rounded-3 border-light">
              <div className="card-body">
                <h5 className="card-title text-center fs-6">{station.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted text-center">
                  {station.city}
                </h6>
                <div className="text-start">
                  <h7>Contact</h7>
                  <p className="fs-6">
                    {station.contact} |{" "}
                    <span>
                      <a href={`mailto:${station.email}`} className="">
                        {station.email}
                      </a>
                    </span>
                    <br />
                    {station.address}
                  </p>
                </div>

                {/* Admin Details */}
                <div className="text-start">
                  <h7>Admin</h7>
                  <p className="fs-7">
                    {station.adminName} (Badge no: {station.badgeNumber})
                    <br />
                    {station.adminContact} |{" "}
                    <span>
                      <a href={`mailto:${station.adminEmail}`} className="">
                        {station.adminEmail}
                      </a>
                    </span>{" "}
                    <br />
                  </p>
                </div>

                {/* Button Section */}
                <div className="d-flex">
                  <button className="btn btn-warning btn-sm d-flex align-items-center justify-content-center w-50">
                    <FaEdit className="me-2" /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm d-flex align-items-center justify-content-center w-50 ms-2">
                    <FaTrash className="me-2" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditStations;
