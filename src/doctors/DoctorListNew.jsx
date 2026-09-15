import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Edit, Delete, Eye } from "@mui/icons-material";
import { getDoctors } from "../api/doctors";
import "../assets/styles/doctors.scss";

const DoctorList = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getDoctors();
      if (response.status === "success") {
        setDoctors(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch doctors");
      console.error("Doctors fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewDetails = (id) => {
    navigate(`/doctors/${id}`);
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "D";
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <div>
          <h1>Doctors</h1>
          <p>Manage hospital doctors and their specializations</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/doctors/add")}>
          <Add /> Add Doctor
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by name, specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Loading doctors...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="empty-state">
          <p>No doctors found</p>
        </div>
      ) : (
        <div className="doctors-grid">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-header">
                <div className="doctor-avatar" style={{ background: "#3b82f6" }}>
                  {getInitials(doctor.name)}
                </div>
                <div className="doctor-badge">
                  <span className="badge-specialty">{doctor.specialization}</span>
                </div>
              </div>

              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <p className="email">{doctor.email}</p>
                <p className="phone">{doctor.phone}</p>
              </div>

              <div className="doctor-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleViewDetails(doctor._id)}
                  title="View Details"
                >
                  <Eye />
                </button>
                <button
                  className="btn-icon btn-edit"
                  onClick={() => navigate(`/doctors/${doctor._id}/edit`)}
                  title="Edit"
                >
                  <Edit />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList;
