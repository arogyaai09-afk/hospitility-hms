import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RefreshIcon from "@mui/icons-material/Refresh";

import axiosInstance from "../api/axiosInstance";

import { getAppointments, checkInAppointment } from "../api/appointments";

import { getPatientById } from "../api/patients";
import { getVisitHistory } from "../api/visits";

import VisitHistoryModal from "../patients/VisitHistoryModal";

import { useToast } from "../context/ToastContext";

import "./TodayAppointments.scss";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    return value;
  }
  return value._id || value.id || "";
};

const getPatientId = (appointment) => {
  return (
    getId(appointment?.patientId) ||
    getId(appointment?.patient?._id) ||
    getId(appointment?.patient?.id)
  );
};

const getPatientName = (appointment) => {
  return (
    appointment?.patientName ||
    appointment?.patient?.name ||
    (typeof appointment?.patientId === "object"
      ? appointment.patientId?.name
      : "") ||
    "Unknown Patient"
  );
};

function PatientAvatarImage({ image, alt }) {
  const [imageUrl, setImageUrl] = useState("");
  useEffect(() => {
    let objectUrl = "";
    const loadImage = async () => {
      if (!image) {
        setImageUrl("");
        return;
      }
      try {
        let endpoint = image;
        if (image.startsWith("http://") || image.startsWith("https://")) {
          const url = new URL(image);
          endpoint = url.pathname.replace(/^\/api\/v1/, "");
          if (url.search) {
            endpoint += url.search;
          }
        }
        const blob = await axiosInstance.getBlob(endpoint);
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (error) {
        console.error("Failed to load patient profile image:", error);
        setImageUrl("");
      }
    };
    loadImage();
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [image]);
  if (!imageUrl) {
    return null;
  }
  return <img src={imageUrl} alt={alt} className="patient-avatar-image" />;
}

const getDoctorId = (appointment) => {
  return getId(appointment?.doctorId);
};

const normalizeStatus = (status) => {
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

const getConsultationStatus = (history) => {
  return (
    history?.consultation?.status ||
    history?.visit?.consultation?.status ||
    history?.clinicalHistory?.consultation?.status ||
    ""
  );
};

const formatTime = (dateValue) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isToday = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export default function TodayAppointments() {
  const navigate = useNavigate();
  const { id: doctorId } = useParams();

  const { showToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [doctorName, setDoctorName] = useState("Doctor");

  const [patientData, setPatientData] = useState({});
  const [patientImages, setPatientImages] = useState({});
  const [consultationData, setConsultationData] = useState({});

  const [selectedVisitHistory, setSelectedVisitHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchTodayAppointments = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAppointments();

      const allAppointments = response?.data?.data || response?.data || [];

      const filteredAppointments = Array.isArray(allAppointments)
        ? allAppointments.filter((appointment) => {
            const appointmentDoctorId = getDoctorId(appointment);
            return (
              String(appointmentDoctorId) === String(doctorId) &&
              isToday(
                appointment?.scheduledAt ||
                  appointment?.appointmentDate ||
                  appointment?.createdAt,
              )
            );
          })
        : [];

      // Latest appointment first.

      filteredAppointments.sort(
        (a, b) =>
          new Date(
            b?.scheduledAt || b?.appointmentDate || b?.createdAt || 0,
          ).getTime() -
          new Date(
            a?.scheduledAt || a?.appointmentDate || a?.createdAt || 0,
          ).getTime(),
      );
      setAppointments(filteredAppointments);

      // Doctor name appointment se hi mil jaye to use karo.
      const firstDoctorName = filteredAppointments.find(
        (appointment) =>
          appointment?.doctorName ||
          appointment?.doctor?.name ||
          (typeof appointment?.doctorId === "object" &&
            appointment?.doctorId?.name),
      );

      if (firstDoctorName) {
        setDoctorName(
          firstDoctorName?.doctorName ||
            firstDoctorName?.doctor?.name ||
            (typeof firstDoctorName?.doctorId === "object"
              ? firstDoctorName?.doctorId?.name
              : "") ||
            "Doctor",
        );
      }

      /*
       * Patient details + visit history loading.
       * Today Appointment's consultation status
       * sync Patient Detail with Visit/Consultation status.
       */
      const patientIds = [
        ...new Set(filteredAppointments.map(getPatientId).filter(Boolean)),
      ];
      const patientResults = await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const patientResponse = await getPatientById(patientId);
            const patient =
              patientResponse?.data?.data || patientResponse?.data || null;
            return [patientId, patient];
          } catch (error) {
            console.error(`Patient ${patientId} fetch error:`, error);
            return [patientId, null];
          }
        }),
      );
      setPatientData(
        Object.fromEntries(patientResults.filter(([, patient]) => patient)),
      );
      const imageMap = Object.fromEntries(
        patientResults
          .filter(([, patient]) => patient?.profileImage)
          .map(([patientId, patient]) => [patientId, patient.profileImage]),
      );
      setPatientImages(imageMap);

      /*
       * Visit history fetch.
       *
       * IMPORTANT:
       * Appointment status might be checked_in,
       * maybe consultation complete.
       *
       * So, we need to fetch visit history to determine
       * the consultation status for each appointment.
       */
      const historyResults = await Promise.all(
        filteredAppointments.map(async (appointment) => {
          const visitId =
            getId(appointment?.visitId) || getId(appointment?.visit);
          if (!visitId) {
            return [
              getId(appointment),
              {
                visitId: "",
                history: null,
                consultationStatus: "",
              },
            ];
          }
          try {
            const historyResponse = await getVisitHistory(visitId);
            const history =
              historyResponse?.data?.data || historyResponse?.data || null;
            return [
              getId(appointment),
              {
                visitId,
                history,
                consultationStatus: getConsultationStatus(history),
              },
            ];
          } catch (error) {
            console.error(`Visit history ${visitId} error:`, error);
            return [
              getId(appointment),
              {
                visitId,
                history: null,
                consultationStatus: "",
              },
            ];
          }
        }),
      );

      setConsultationData(Object.fromEntries(historyResults));
    } catch (error) {
      console.error("Today's appointments error:", error);
      showToast(
        error?.message ||
          error?.error ||
          "Failed to load today's appointments.",
        "error",
      );
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, [doctorId]);

  const handleCheckIn = async (appointment) => {
    const appointmentId = getId(appointment);
    if (!appointmentId) {
      showToast("Appointment ID is missing.", "error");
      return;
    }
    try {
      const response = await checkInAppointment(appointmentId);
      if (response?.status && response.status !== "success") {
        throw new Error(response?.message || "Failed to check in appointment.");
      }
      showToast("Patient checked in successfully.", "success");
      await fetchTodayAppointments(true);
    } catch (error) {
      console.error("Check-in error:", error);
      showToast(
        error?.response?.data?.message ||
          error?.message ||
          error?.error ||
          "Failed to check in patient.",
        "error",
      );
    }
  };

  const handleStartConsultation = (appointment) => {
    const appointmentId = getId(appointment);
    const data = consultationData[appointmentId] || {};
    const visitId =
      data?.visitId || getId(appointment?.visitId) || getId(appointment?.visit);
    const patientId = getPatientId(appointment);
    if (!patientId) {
      showToast("Patient ID is missing.", "error");
      return;
    }
    if (!visitId) {
      showToast(
        "Visit ID is missing. Please check in the patient first.",
        "error",
      );
      return;
    }
    navigate(`/patients/${patientId}/visits/${visitId}/consultation`);
  };

  const handleViewConsultation = async (appointment) => {
    const appointmentId = getId(appointment);
    const data = consultationData[appointmentId] || {};
    const visitId =
      data?.visitId || getId(appointment?.visitId) || getId(appointment?.visit);
    if (!visitId) {
      showToast("Visit ID is missing.", "error");
      return;
    }

    try {
      setHistoryLoading(true);
      const response = await getVisitHistory(visitId);
      const history = response?.data?.data || response?.data || null;
      if (!history) {
        throw new Error("Consultation history not found.");
      }
      setSelectedVisitHistory(history);
    } catch (error) {
      console.error("View consultation error:", error);
      showToast(
        error?.message || "Failed to load consultation history.",
        "error",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const getAction = (appointment) => {
    const appointmentId = getId(appointment);
    const appointmentStatus = normalizeStatus(appointment?.status);
    const consultationStatus = normalizeStatus(
      consultationData[appointmentId]?.consultationStatus,
    );

    /*
     * Consultation completed
     * ---------------------
     * Even if appointment.status is still checked_in,
     * completed consultation gets View Consultation.
     */
    if (
      consultationStatus === "completed" ||
      appointmentStatus === "completed"
    ) {
      return "view";
    }

    /*
     * Draft consultation means doctor started earlier
     * but has not completed it.
     */
    if (consultationStatus === "draft") {
      return "continue";
    }

    /*
     * Appointment already checked in
     * and no completed/draft consultation exists.
     */
    if (
      appointmentStatus === "checked_in" ||
      appointmentStatus === "checked-in" ||
      appointmentStatus === "in_consultation"
    ) {
      return "start";
    }

    /*
     * Scheduled / confirmed appointment.
     */
    if (
      appointmentStatus === "scheduled" ||
      appointmentStatus === "schedule" ||
      appointmentStatus === "confirmed" ||
      appointmentStatus === "pending"
    ) {
      return "checkin";
    }

    return "checkin";
  };

  const counts = useMemo(() => {
    let waiting = 0;
    let completed = 0;
    appointments.forEach((appointment) => {
      const action = getAction(appointment);
      if (action === "view") {
        completed += 1;
      } else {
        waiting += 1;
      }
    });
    return {
      total: appointments.length,
      waiting,
      completed,
    };
  }, [appointments, consultationData]);
  if (loading) {
    return (
      <div className="today-appointments-page">
        <div className="today-loading">Loading today's appointments...</div>
      </div>
    );
  }

  return (
    <div className="today-appointments-page">
      {/* Header */}
      <div className="today-page-header">
        <div className="today-header-left">
          <button
            type="button"
            className="today-back-btn"
            onClick={() => navigate(`/doctors/${doctorId}`)}
          >
            ←
          </button>
          <div className="today-header-icon">
            <CalendarMonthIcon />
          </div>
          <div>
            <h1>Today's Appointments</h1>
            <p>
              {doctorName} ·{" "}
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="today-refresh-btn"
          onClick={() => fetchTodayAppointments(true)}
          disabled={refreshing}
        >
          <RefreshIcon className={refreshing ? "refresh-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary */}
      <div className="today-summary-grid">
        <div className="today-summary-card">
          <div className="today-summary-icon blue">
            <CalendarMonthIcon />
          </div>
          <div>
            <span>Total Appointments</span>
            <strong>{counts.total}</strong>
          </div>
        </div>
        <div className="today-summary-card">
          <div className="today-summary-icon orange">
            <PersonIcon />
          </div>
          <div>
            <span>Patients Waiting</span>
            <strong>{counts.waiting}</strong>
          </div>
        </div>
        <div className="today-summary-card">
          <div className="today-summary-icon green">
            <CalendarMonthIcon />
          </div>
          <div>
            <span>Completed</span>
            <strong>{counts.completed}</strong>
          </div>
        </div>
      </div>

      {/* Queue */}
      <div className="patient-queue-card">
        <div className="queue-header">
          <div>
            <h2>Patient Queue</h2>
            <p>Patients scheduled for consultation with <span className="doctor-Name-with-Prefix"> Dr. {doctorName} </span> today.</p>
          </div>
          <span className="patient-count">
            {appointments.length}{" "}
            {appointments.length === 1 ? "Patient" : "Patients"}
          </span>
        </div>
        {appointments.length === 0 ? (
          <div className="empty-queue">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="queue-table-wrapper">
            <table className="patient-queue-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Appointment Time</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => {
                  const appointmentId = getId(appointment);
                  const patientId = getPatientId(appointment);
                  const patient = patientData[patientId];
                  const patientName =
                    getPatientName(appointment) !== "Unknown Patient"
                      ? getPatientName(appointment)
                      : patient?.name || "Unknown Patient";
                  const initials =
                    patientName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((word) => word.charAt(0))
                      .join("")
                      .toUpperCase() || "?";
                  const appointmentDate =
                    appointment?.scheduledAt ||
                    appointment?.appointmentDate ||
                    appointment?.createdAt;
                  const action = getAction(appointment);
                  const appointmentStatus = normalizeStatus(
                    appointment?.status,
                  );
                  const consultationStatus = normalizeStatus(
                    consultationData[appointmentId]?.consultationStatus,
                  );
                  let statusLabel = "Scheduled";
                  if (action === "view") {
                    statusLabel = "Completed";
                  } else if (action === "continue") {
                    statusLabel = "Consultation Draft";
                  } else if (action === "start") {
                    statusLabel = "Checked In";
                  } else if (appointmentStatus === "confirmed") {
                    statusLabel = "Confirmed";
                  }
                  return (
                    <tr key={appointmentId}>
                      {/* Patient */}
                      <td>
                        <button
                          type="button"
                          className="patient-cell-btn"
                          onClick={() => {
                            if (patientId) {
                              navigate(`/patients/${patientId}`);
                            }
                          }}
                        >
                          <div className="patient-avatar">
                            <span className="patient-avatar-initials">
                              {initials}
                            </span>
                            <PatientAvatarImage
                              image={patientImages[patientId]}
                              alt={patientName}
                            />
                          </div>
                          <div className="patient-cell-info">
                            <strong>{patientName}</strong>
                            <span>ID: {patientId || "N/A"}</span>
                          </div>
                        </button>
                      </td>

                      {/* Time */}
                      <td>
                        <div className="appointment-time">
                          <div>
                            <AccessTimeIcon />
                            <strong>{formatTime(appointmentDate)}</strong>
                          </div>
                          <span>{formatDate(appointmentDate)}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <span className="appointment-type">
                          {appointment?.appointmentType ||
                            appointment?.type ||
                            "OPD"}
                        </span>
                      </td>

                      {/* Reason */}
                      <td>
                        <span className="appointment-reason">
                          {appointment?.reason ||
                            appointment?.visitReason ||
                            "N/A"}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`today-status ${action}`}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* Action */}
                      <td>
                        <div className="today-action-group">
                          {action === "checkin" && (
                            <button
                              type="button"
                              className="today-action-btn checkin"
                              onClick={() => handleCheckIn(appointment)}
                            >
                              Check In
                            </button>
                          )}
                          {action === "start" && (
                            <button
                              type="button"
                              className="today-action-btn start"
                              onClick={() =>
                                handleStartConsultation(appointment)
                              }
                            >
                              Start Consultation
                            </button>
                          )}
                          {action === "continue" && (
                            <button
                              type="button"
                              className="today-action-btn continue"
                              onClick={() =>
                                handleStartConsultation(appointment)
                              }
                            >
                              Continue Consultation
                            </button>
                          )}
                          {action === "view" && (
                            <button
                              type="button"
                              className="today-action-btn view"
                              onClick={() =>
                                handleViewConsultation(appointment)
                              }
                            >
                              View Consultation
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Same Visit History popup used on Patient Detail */}
      <VisitHistoryModal
        history={selectedVisitHistory}
        loading={historyLoading}
        onClose={() => setSelectedVisitHistory(null)}
      />
    </div>
  );
}
