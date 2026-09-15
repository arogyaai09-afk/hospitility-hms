import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Eye, Edit } from "@mui/icons-material";
import { getAppointments } from "../api/appointments";
import "../assets/styles/appointment.scss";

const AppointmentList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments();
      if (response.status === "success") {
        setAppointments(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch appointments");
      console.error("Appointments fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.appointmentType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "scheduled":
        return "badge-primary";
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="appointments-page">
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>Manage patient appointments and schedules</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/appointments/new")}>
          <Add /> New Appointment
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by patient name or appointment type..."
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
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="appointments-table">
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Appointment Type</th>
                <th>Visit Reason</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="patient-name">{appointment.patientName}</td>
                  <td>{appointment.appointmentType}</td>
                  <td>{appointment.visitReason}</td>
                  <td>{appointment.doctorId || "Not assigned"}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>{new Date(appointment.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => navigate(`/appointments/${appointment._id}`)}
                      title="View Details"
                    >
                      <Eye />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => navigate(`/appointments/${appointment._id}/edit`)}
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

export default AppointmentList;
