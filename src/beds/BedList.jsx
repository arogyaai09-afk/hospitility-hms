// BedList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Edit, Delete } from "@mui/icons-material";
import { getBeds, updateBed, deleteBed } from "../api/beds";
import { getAdmissions } from "../api/admissions";
import "./beds.scss";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

const Beds = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bedToDelete, setBedToDelete] = useState(null);
  const [beds, setBeds] = useState([]);
  const [admissions, setAdmissions] = useState([]);
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
      setError("");

      const [bedsResponse, admissionsResponse] = await Promise.all([
        getBeds(),
        getAdmissions(),
      ]);

      if (bedsResponse?.status === "success") {
        setBeds(Array.isArray(bedsResponse.data) ? bedsResponse.data : []);
      } else {
        setBeds([]);
        setError(bedsResponse?.message || "Failed to fetch beds");
      }

      if (admissionsResponse?.status === "success") {
        setAdmissions(
          Array.isArray(admissionsResponse.data) ? admissionsResponse.data : [],
        );
      } else {
        setAdmissions([]);
      }
    } catch (err) {
      console.error("Beds/admissions fetch error:", err);

      setError(err?.message || "Failed to fetch beds");
    } finally {
      setLoading(false);
    }
  };

  const filteredBeds = beds.filter((bed) => {
    const matchesSearch = bed.bedNumber
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || bed.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    return status === "available" ? "badge-success" : "badge-warning";
  };

  const getAssignedPatient = (bed) => {
    if (!bed?.assignedAdmissionId) {
      return null;
    }

    const admission = admissions.find(
      (item) =>
        String(item.id) === String(bed.assignedAdmissionId) ||
        String(item._id) === String(bed.assignedAdmissionId),
    );

    console.log("BED:", bed.bedNumber);
    console.log("ASSIGNED ADMISSION ID:", bed.assignedAdmissionId);
    console.log("MATCHING ADMISSION:", admission);

    return admission || null;
  };

  const handleDeleteBed = (bed) => {
    if (!bed?._id) {
      showToast("Bed ID is missing.", "error");
      return;
    }

    setBedToDelete(bed);
    setShowDeleteModal(true);
  };

  const handleEditBed = () => {
    showToast("Bed edit API is not connected yet.", "error");
  };

  const handleConfirmDelete = async () => {
    if (!bedToDelete?._id) {
      showToast("Bed ID is missing.", "error");
      return;
    }

    try {
      await deleteBed(bedToDelete._id);

      showToast("Bed deleted successfully.", "success");

      setShowDeleteModal(false);
      setBedToDelete(null);

      await fetchBeds();
    } catch (err) {
      console.error("Delete bed error:", err);

      showToast(err?.message || err?.error || "Failed to delete bed.", "error");
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
  <div className="assigned-patient">
    <span className="label">Assigned To:</span>

    {(() => {
      const admission = getAssignedPatient(bed);

      if (!admission) {
        return (
          <div className="patient-name">
            Patient details unavailable
          </div>
        );
      }

      return (
        <>
          <div className="patient-name">
            {admission.patientName}
          </div>

          <div className="admission-id">
            Admission ID: {admission.id || admission._id}
          </div>
        </>
      );
    })()}
  </div>
)}
              </div>

              <div className="bed-actions">
                <button
                  className="btn-icon btn-edit"
                  title="Edit"
                  onClick={() => handleEditBed(bed)}
                >
                  <Edit />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteBed(bed)}
                  title="Delete"
                >
                  <Delete />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Bed"
        message={
          bedToDelete
            ? `Are you sure you want to delete bed ${bedToDelete.bedNumber}?`
            : "Are you sure you want to delete this bed?"
        }
        confirmText="Delete Bed"
        cancelText="Cancel"
        onCancel={() => {
          setShowDeleteModal(false);
          setBedToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Beds;
