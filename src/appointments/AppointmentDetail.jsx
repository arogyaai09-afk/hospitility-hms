import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { getAppointments } from "../api/appointments";
import { useToast } from "../context/ToastContext";
import "./appointmentDetail.scss";

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getId = (value) => {
  if (!value) return "";
  return typeof value === "string" ? value : value._id || "";
};

const getName = (value, fallback = "N/A") => {
  if (!value) return fallback;
  return typeof value === "string" ? value : value.name || fallback;
};

function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);

        const response = await getAppointments();

        const appointments =
          response?.data?.data ||
          response?.data ||
          [];

        const found = appointments.find(
          (item) => (item?._id || item?.id) === id
        );

        if (!found) {
          showToast("Appointment not found.", "error");
          navigate("/appointments");
          return;
        }

        setAppointment(found);
      } catch (error) {
        console.error("Failed to fetch appointment:", error);

        showToast(
          error?.message ||
            error?.response?.data?.message ||
            "Failed to load appointment.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointment();
    }
  }, [id, navigate, showToast]);

  if (loading) {
    return (
      <div className="appointment-detail-page">
        <div className="appointment-detail-loading">
          Loading appointment...
        </div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const patientId = getId(appointment.patientId);
  const doctorId = getId(appointment.doctorId);

  const patientName =
    appointment.patientName ||
    getName(appointment.patientId, "Unknown Patient");

  const doctorName =
    appointment.doctorName ||
    getName(appointment.doctorId, "Unknown Doctor");

  const doctorSpecialization =
    appointment.doctorId?.specialization ||
    appointment.designation ||
    "N/A";

  const status = appointment.status || "N/A";

  return (
    <div className="appointment-detail-page">
      {/* Header */}
      <div className="appointment-detail-header">
        <div className="appointment-detail-heading">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/appointments")}
          >
            <ArrowBackIcon />
          </button>

          <div>
            <h1>Appointment Details</h1>
            <p>View complete appointment information</p>
          </div>
        </div>

        <span
          className={`appointment-detail-status ${status
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
        >
          {status}
        </span>
      </div>

      {/* Main Information */}
      <div className="appointment-detail-grid">
        {/* Patient */}
        <div className="appointment-info-card">
          <div className="appointment-card-title">
            <PersonIcon />
            <h2>Patient Information</h2>
          </div>

          <div className="appointment-info-list">
            <div className="appointment-info-item">
              <span>Patient Name</span>

              {patientId ? (
                <button
                  type="button"
                  className="detail-link"
                  onClick={() => navigate(`/patients/${patientId}`)}
                >
                  {patientName}
                </button>
              ) : (
                <strong>{patientName}</strong>
              )}
            </div>

            <div className="appointment-info-item">
              <span>Patient ID</span>
              <strong>{patientId || "N/A"}</strong>
            </div>

            <div className="appointment-info-item">
              <span>Patient Type</span>
              <strong>{appointment.patientType || "N/A"}</strong>
            </div>

            <div className="appointment-info-item">
              <span>Phone</span>
              <strong>
                {appointment.patientPhone ||
                  appointment.patientId?.phone ||
                  "N/A"}
              </strong>
            </div>
          </div>
        </div>

        {/* Doctor */}
        <div className="appointment-info-card">
          <div className="appointment-card-title">
            <MedicalServicesIcon />
            <h2>Doctor Information</h2>
          </div>

          <div className="appointment-info-list">
            <div className="appointment-info-item">
              <span>Doctor Name</span>

              {doctorId ? (
                <button
                  type="button"
                  className="detail-link"
                  onClick={() => navigate(`/doctors/${doctorId}`)}
                >
                  {doctorName}
                </button>
              ) : (
                <strong>{doctorName}</strong>
              )}
            </div>

            <div className="appointment-info-item">
              <span>Specialization</span>
              <strong>{doctorSpecialization}</strong>
            </div>

            <div className="appointment-info-item">
              <span>Doctor ID</span>
              <strong>{doctorId || "N/A"}</strong>
            </div>
          </div>
        </div>

        {/* Appointment */}
        <div className="appointment-info-card">
          <div className="appointment-card-title">
            <CalendarTodayIcon />
            <h2>Appointment Information</h2>
          </div>

          <div className="appointment-info-list">
            <div className="appointment-info-item">
              <span>Appointment ID</span>
              <strong>{appointment._id || appointment.id}</strong>
            </div>

            <div className="appointment-info-item">
              <span>Appointment Type</span>
              <strong>
                {appointment.appointmentType ||
                  appointment.mode ||
                  "N/A"}
              </strong>
            </div>

            <div className="appointment-info-item">
              <span>Status</span>
              <strong>{status}</strong>
            </div>

            <div className="appointment-info-item">
              <span>Created At</span>
              <strong>{formatDate(appointment.createdAt)}</strong>
            </div>
          </div>
        </div>

        {/* Visit */}
        <div className="appointment-info-card">
          <div className="appointment-card-title">
            <EventNoteIcon />
            <h2>Visit Information</h2>
          </div>

          <div className="appointment-info-list">
            <div className="appointment-info-item">
              <span>Visit ID</span>
              <strong>{getId(appointment.visitId) || "Not created"}</strong>
            </div>

            <div className="appointment-info-item appointment-reason">
              <span>Visit Reason</span>
              <strong>
                {appointment.visitReason || "N/A"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="appointment-detail-footer">
        <button
          type="button"
          className="appointment-back-btn"
          onClick={() => navigate("/appointments")}
        >
          Back to Appointments
        </button>
      </div>
    </div>
  );
}

export default AppointmentDetail;