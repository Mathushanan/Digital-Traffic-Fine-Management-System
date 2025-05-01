import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const MapView = () => {
  const [fines, setFines] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  // Fix marker icon issue
  delete L.Icon.Default.prototype._getIconUrl;
  const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    iconSize: [15, 20],
    iconAnchor: [12, 20],
    popupAnchor: [1, -34],
  });

  const fetchFines = async () => {
    try {
      const fetchFinesUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/get-all-fines`;
      const token = localStorage.getItem("authToken");

      const response = await axios.get(fetchFinesUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const fetchedFines = response.data;
        setFines(fetchedFines);
      } else {
        setMessage("Failed to fetch fines!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch fines: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("error");
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const center = { lat: 7.8731, lng: 80.7718 }; // Center of Sri Lanka

  // Group fines by district
  const groupFinesByDistrict = (fines) => {
    const grouped = {};

    fines.forEach((fine) => {
      const district = fine.district; // Use the district name from the fine object

      if (!grouped[district]) {
        grouped[district] = {
          district: district,
          count: 0,
          latitude: fine.latitude, // Assign the first fine's latitude
          longitude: fine.longitude, // Assign the first fine's longitude
        };
      }

      grouped[district].count += 1;
    });

    return Object.values(grouped);
  };

  const districtGroups = groupFinesByDistrict(fines);

  // Sort districts by the number of fines
  const sortedDistricts = districtGroups.sort((a, b) => b.count - a.count);

  // Assign colors based on ranking
  const getDistrictColor = (rank) => {
    if (rank === 0) return "red"; // High violation zone
    if (rank === 1) return "yellow"; // Moderate violation zone
    return "green"; // Low violation zone
  };

  return (
    <div className="container mt-3">
      <h2 className="text-center text-muted mb-3" style={{ fontSize: "16px" }}>
        This map shows the locations of traffic fines across Sri Lanka, with
        colored circles representing the districts with the highest number of
        fines:
      </h2>
      <ul
        className="list-group mb-3 d-flex flex-row justify-content-between list-group-flush"
        style={{ fontSize: "16px" }}
      >
        <li className="list-group-item flex-fill border-0 bg-danger text-white">
          <strong>Red</strong>: High violation zone (Most fines)
        </li>
        <li className="list-group-item flex-fill border-0 bg-warning text-dark">
          <strong>Yellow</strong>: Moderate violation zone
        </li>
        <li className="list-group-item flex-fill border-0 bg-success text-white">
          <strong>Green</strong>: Low violation zone (Fewest fines)
        </li>
      </ul>

      {message && <div className={`alert ${messageType} mb-3`}>{message}</div>}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={7}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Highlight top 3 districts */}
        {sortedDistricts.slice(0, 3).map((district, index) => (
          <Circle
            key={district.district}
            center={[district.latitude, district.longitude]}
            radius={50000}
            pathOptions={{
              color: getDistrictColor(index),
              fillColor: getDistrictColor(index),
              fillOpacity: 0.4,
            }}
          >
            <Popup>
              <strong>{district.district}</strong>
              <br />
              Number of Fines: {district.count}
            </Popup>
          </Circle>
        ))}
        {/* Individual fines */}
        {fines.map((fine, index) => (
          <Marker
            key={index}
            position={[fine.latitude, fine.longitude]}
            icon={customIcon}
          >
            <Popup>
              {fine.district} <br />
              Fine Amount: {fine.fineAmount} <br />
              Fine Date: {fine.dueDate}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
