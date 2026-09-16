import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Edit, Visibility } from "@mui/icons-material";
import { getAdmissions } from "../api/admissions";
import "./admissions.scss";

const Admissions = () => {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const response = await getAdmissions();
      if (response.status === "success") {
        setAdmissions(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch admissions");
      console.error("Admissions fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmissions = admissions.filter((admission) => {
    const matchesSearch =
      admission.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.bedNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || admission.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (id) => {
    navigate(`/admissions/${id}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "admitted":
        return "badge-primary";
      case "discharged":
        return "badge-success";
      case "pending":
        return "badge-warning";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="admissions-page">
      <div className="page-header">
        <div>
          <h1>Admissions</h1>
          <p>Manage patient admissions and bed assignments</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/admissions/new")}>
          <Add /> New Admission
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by patient name or bed number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="admitted">Admitted</option>
          <option value="discharged">Discharged</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading admissions...</div>
      ) : filteredAdmissions.length === 0 ? (
        <div className="empty-state">
          <p>No admissions found</p>
        </div>
      ) : (
        <div className="admissions-table">
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Admission Type</th>
                <th>Bed Number</th>
                <th>Status</th>
                <th>Admitted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmissions.map((admission) => (
                <tr key={admission._id}>
                  <td className="patient-name">{admission.patientName}</td>
                  <td>{admission.admissionType}</td>
                  <td className="bed-number">{admission.bedNumber}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(admission.status)}`}>
                      {admission.status}
                    </span>
                  </td>
                  <td>{new Date(admission.admittedAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleViewDetails(admission._id)}
                      title="View Details"
                    >
                      <Visibility />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => navigate(`/admissions/${admission._id}/edit`)}
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

export default Admissions;
