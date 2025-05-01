import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { jwtDecode } from "jwt-decode";

const MapView = () => {
  const [fines, setFines] = useState([]);
  const [center, setCenter] = useState({ lat: 7.8731, lng: 80.7718 }); // Default center
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  // Fix Leaflet icon issue
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
      }/get-all-fines-to-station-admin`;
      const token = localStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      const stationId = decodedToken.RegisteredStationId;

      const response = await axios.post(
        fetchFinesUrl,
        { stationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        setFines(data);

        // Center map on first fine if available
        if (data.length > 0) {
          const lat = parseFloat(data[0].latitude);
          const lng = parseFloat(data[0].longitude);
          setCenter({ lat, lng });
        }
      } else {
        setMessage("Failed to fetch fines!");
        setMessageType("danger");
      }
    } catch (error) {
      setMessage(
        "Failed to fetch fines: " +
          (error.response ? error.response.data : error.message)
      );
      setMessageType("danger");
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  return (
    <div className="container mt-3">
      <h2 className="text-center text-muted mb-3" style={{ fontSize: "16px" }}>
        This map shows all traffic fines recorded by station.
      </h2>

      {message && <div className={`alert alert-${messageType}`}>{message}</div>}

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={7}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Highlight the district area */}
        {fines.length > 0 && (
          <Circle
            center={[
              parseFloat(fines[0].latitude),
              parseFloat(fines[0].longitude),
            ]}
            radius={30000}
            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.3 }}
          />
        )}

        {/* Render each fine as a marker */}
        {fines.map((fine, index) => (
          <Marker
            key={index}
            position={[parseFloat(fine.latitude), parseFloat(fine.longitude)]}
            icon={customIcon}
          >
            <Popup>
              <strong>District:</strong> {fine.district} <br />
              <strong>Fine Amount:</strong> {fine.fineAmount} <br />
              <strong>Due Date:</strong> {fine.dueDate?.split("T")[0]}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
