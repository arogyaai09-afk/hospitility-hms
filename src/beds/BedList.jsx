import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Edit, Delete } from "@mui/icons-material";
import { getBeds } from "../api/beds";
import "./beds.scss";

const Beds = () => {
  const navigate = useNavigate();
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const response = await getBeds();
      if (response.status === "success") {
        setBeds(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch beds");
      console.error("Beds fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBeds = beds.filter((bed) => {
    const matchesSearch = bed.bedNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || bed.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    return status === "available" ? "badge-success" : "badge-warning";
  };

  const handleDeleteBed = async (id) => {
    if (window.confirm("Are you sure you want to delete this bed?")) {
      try {
        // Call delete API
        console.log("Deleting bed:", id);
        fetchBeds(); // Refresh list
      } catch (err) {
        setError("Failed to delete bed");
      }
    }
  };

  return (
    <div className="beds-page">
      <div className="page-header">
        <div>
          <h1>Bed Management</h1>
          <p>Manage hospital beds and availability</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/beds/new")}>
          <Add /> Add Bed
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by bed number..."
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
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading beds...</div>
      ) : filteredBeds.length === 0 ? (
        <div className="empty-state">
          <p>No beds found</p>
        </div>
      ) : (
        <div className="beds-grid">
          {filteredBeds.map((bed) => (
            <div key={bed._id} className="bed-card">
              <div className="bed-header">
                <h3>{bed.bedNumber}</h3>
                <span className={`badge ${getStatusBadgeClass(bed.status)}`}>
                  {bed.status}
                </span>
              </div>

              <div className="bed-info">
                <p>
                  <span className="label">Status:</span>
                  <span className="value">{bed.status}</span>
                </p>
                {bed.assignedAdmissionId && (
                  <p>
                    <span className="label">Assigned To:</span>
                    <span className="value">{bed.assignedAdmissionId}</span>
                  </p>
                )}
              </div>

              <div className="bed-actions">
                <button className="btn-icon btn-edit" title="Edit">
                  <Edit />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteBed(bed._id)}
                  title="Delete"
                >
                  <Delete />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Beds;
