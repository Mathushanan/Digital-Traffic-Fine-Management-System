import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const VIOLATION_COLORS = [
  "#8884d8", // lavender
  "#82ca9d", // mint green
  "#ffc658", // light orange
  "#ff8042", // coral
  "#8dd1e1", // sky blue
];

const REVENUE_COLORS = [
  "#c23531", // red
  "#2f4554", // dark slate
  "#61a0a8", // teal
  "#d48265", // salmon
  "#91c7ae", // pale green
];

const Analysis = () => {
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const messageClass =
    messageType === "error" ? "alert-danger" : "alert-success";

  const [fines, setFines] = useState([]);
  const districtCounts = fines.reduce((acc, fine) => {
    if (!acc[fine.district]) acc[fine.district] = 0;
    acc[fine.district]++;
    return acc;
  }, {});
  const chartData = Object.entries(districtCounts).map(([district, count]) => ({
    district,
    count,
  }));

  const fineCountData = Object.entries(districtCounts)
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  // Revenue per district
  const districtRevenue = fines.reduce((acc, fine) => {
    const amount = fine.fineAmount || 0;
    acc[fine.district] = (acc[fine.district] || 0) + amount;
    return acc;
  }, {});
  const revenueData = Object.entries(districtRevenue)
    .map(([district, revenue]) => ({ district, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5); // Top 5

  // Violations by Station
  const stationCounts = fines.reduce((acc, fine) => {
    if (!acc[fine.stationName]) acc[fine.stationName] = 0;
    acc[fine.stationName]++;
    return acc;
  }, {});
  const stationData = Object.entries(stationCounts)
    .map(([station, count]) => ({ station, count }))
    .sort((a, b) => a.count - b.count); // Sort in ascending order

  //most frequent violations occured
  const sectionCounts = fines.reduce((acc, fine) => {
    if (!acc[fine.sectionOfAct]) acc[fine.sectionOfAct] = 0;
    acc[fine.sectionOfAct]++;
    return acc;
  }, {});
  const sectionChartData = Object.entries(sectionCounts)
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count); // Descending

  // Group fines by date (you can switch to week/month grouping later if needed)
  const finesOverTime = fines.reduce((acc, fine) => {
    const date = new Date(fine.violationDate).toISOString().split("T")[0]; // Format: yyyy-mm-dd
    if (!acc[date]) {
      acc[date] = { date, count: 0, amount: 0 };
    }
    acc[date].count += 1;
    acc[date].amount += fine.fineAmount || 0;
    return acc;
  }, {});

  const finesOverTimeData = Object.values(finesOverTime).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

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
        console.log(fetchedFines);
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
      console.error(
        "Failed to fetch fines:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  return (
    <>
      {/* Message Display Section */}
      {message && (
        <div
          className={`alert ${messageClass} alert-dismissible fade show w-100 w-md-50 shadow-lg rounded start-50 translate-middle-x mt-4`}
          role="alert"
        >
          <div className="d-flex align-items-center">
            {messageClass === "alert-success" && (
              <FaCheckCircle className="me-2" />
            )}
            {messageClass === "alert-danger" && (
              <FaTimesCircle className="me-2" />
            )}
            <span>{message}</span>
          </div>

          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => {
              setMessage(null);
              setMessageType(null);
            }}
          ></button>
        </div>
      )}

      <div className="container ">
        <div className="row ">
          {/* Row 1 */}
          <div className="col-md-12 ">
            <div
              className="card shadow-sm"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <h5 className="text-center text-muted my-3">
                Total Fine Count by District
              </h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="district"
                    label={{
                      value: "District",
                      position: "outsideBottom",
                      offset: 0,
                      dy: 30,
                      style: { textAnchor: "middle", fontSize: "14px" },
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Total Fine Count",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      dx: 20,
                      style: { textAnchor: "middle", fontSize: "14px" },
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Pie Charts Row */}
        <div className="row mt-4 ">
          {/* Violation-Prone Districts */}
          <div className="col-md-6">
            <div
              className="card shadow-sm"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <h5 className="text-center text-muted my-3">
                Top 5 Violation-Prone Districts
              </h5>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={fineCountData}
                    dataKey="count"
                    nameKey="district"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {fineCountData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={VIOLATION_COLORS[index % VIOLATION_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue-Generating Districts */}
          <div className="col-md-6">
            <div
              className="card shadow-sm"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <h5 className="text-center text-muted my-3">
                Top 5 Revenue-Generating Districts
              </h5>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    dataKey="revenue"
                    nameKey="district"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${value.toFixed(0)} LKR `} // Display LKR next to amount in labels
                  >
                    {revenueData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={REVENUE_COLORS[index % REVENUE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Row 3: Bar Chart for Violations Against Station Names */}
        <div className="row gap-2 mt-4">
          <div className="col-md-12">
            <div
              className="card shadow-sm"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <h5 className="text-center text-muted my-3">
                Total Violations by Station
              </h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stationData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="station"
                    label={{
                      value: "Station",
                      position: "outsideBottom",
                      offset: 0,
                      dy: 30,
                      style: { textAnchor: "middle", fontSize: "14px" },
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Violation Count",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      dx: 20,
                      style: { textAnchor: "middle", fontSize: "14px" },
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* 📆 Fines Over Time Chart */}
        <div className="row gap-2 mt-4">
          <div className="col-md-12">
            <div
              className="card shadow-sm"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <h5 className="text-center text-muted my-3">Fines Over Time</h5>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={finesOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    yAxisId="left"
                    label={{
                      value: "Count",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: "Amount (LKR)",
                      angle: -90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    activeDot={{ r: 6 }}
                    name="Fines Count"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="amount"
                    stroke="#82ca9d"
                    name="Total Fine Amount"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="row gap-2 mt-4">
          <div className="col-md-12">
            <div
              className="card shadow-sm"
              style={{ borderLeft: "5px solid #55798f" }}
            >
              <h5 className="text-center text-muted my-3">
                Most Frequent Violations by Section of Act
              </h5>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sectionChartData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="section"
                    label={{
                      value: "Section of Act",
                      position: "outsideBottom",
                      dy: 30,
                      style: { textAnchor: "middle", fontSize: "14px" },
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Violation Count",
                      angle: -90,
                      position: "insideLeft",
                      dx: 20,
                      style: { textAnchor: "middle", fontSize: "14px" },
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analysis;
