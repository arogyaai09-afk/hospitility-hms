import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Edit, Visibility } from "@mui/icons-material";
import { getEmergencies } from "../api/emergencies";
import "./emergencies.scss";

const Emergencies = () => {
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const response = await getEmergencies();
      if (response.status === "success") {
        setEmergencies(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch emergencies");
      console.error("Emergencies fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmergencies = emergencies.filter((emergency) => {
    const matchesSearch =
      emergency.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emergency.emergencyType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      filterSeverity === "all" || emergency.severity === filterSeverity;

    return matchesSearch && matchesSeverity;
  });

  const handleViewDetails = (id) => {
    navigate(`/emergencies/${id}`);
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "high":
        return "badge-danger";
      case "medium":
        return "badge-warning";
      case "low":
        return "badge-info";
      default:
        return "badge-secondary";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "in-progress":
        return "badge-primary";
      case "resolved":
        return "badge-success";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="emergencies-page">
      <div className="page-header">
        <div>
          <h1>Emergency Cases</h1>
          <p>Manage emergency patient cases and admissions</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/emergencies/new")}>
          <Add /> Report Emergency
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by patient name or emergency type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Severity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading emergencies...</div>
      ) : filteredEmergencies.length === 0 ? (
        <div className="empty-state">
          <p>No emergency cases found</p>
        </div>
      ) : (
        <div className="emergencies-table">
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Emergency Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned Doctor</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmergencies.map((emergency) => (
                <tr key={emergency._id}>
                  <td className="patient-name">{emergency.patientName}</td>
                  <td>{emergency.emergencyType}</td>
                  <td>
                    <span className={`badge ${getSeverityBadgeClass(emergency.severity)}`}>
                      {emergency.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(emergency.status)}`}>
                      {emergency.status}
                    </span>
                  </td>
                  <td>{emergency.assignedDoctor || "Not assigned"}</td>
                  <td>{new Date(emergency.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleViewDetails(emergency._id)}
                      title="View Details"
                    >
                      <Visibility />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => navigate(`/emergencies/${emergency._id}/edit`)}
                      title="Edit"
                    >
                      <Edit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Emergencies;
