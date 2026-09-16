//patientlistnew.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";
import { getPatients, deletePatient } from "../api/patients";
import "../assets/styles/patient.scss";


const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDeletePatient = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this patient?"
  );

  if (!confirmed) return;

  try {
    await deletePatient(id);

    setPatients((currentPatients) =>
      currentPatients.filter((patient) => patient.id !== id)
    );

    setOpenMenu(null);
  } catch (error) {
    console.error("Delete patient error:", error);
    alert(error.message || "Failed to delete patient");
  }
};

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      if (response.status === "success") {
        setPatients(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch patients");
      console.error("Patients fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientCode?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewDetails = (id) => {
    navigate(`/patients/${id}`);
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "P";
  };

  return (
    <div className="patients-page">
      
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>Manage patient records and medical history</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/patients/create")}>
          <Add /> Add Patient
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by name, email, or patient code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Loading patients...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="empty-state">
          <p>No patients found</p>
        </div>
      ) : (
        <div className="patients-table">
          <table>
            <thead>
              <tr>
                <th>Patient Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td className="code">{patient.patientCode}</td>
                  <td className="name">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#10b981',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {getInitials(patient.name)}
                      </div>
                      <span>{patient.name}</span>
                    </div>
                  </td>
                  <td>{patient.email}</td>
                  <td>{patient.phone}</td>
                  <td>
                    <span className="badge badge-secondary">
                      {patient.gender}
                    </span>
                  </td>
                  <td>{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleViewDetails(patient._id)}
                      title="View Details"
                    >
                      <Visibility />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => navigate(`/patients/${patient._id}/edit`)}
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

export default PatientList;
