//patientdetails.js
import VisitHistoryModal from "./VisitHistoryModal";

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import CakeIcon from "@mui/icons-material/Cake";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import WcIcon from "@mui/icons-material/Wc";
import EmailIcon from "@mui/icons-material/Email";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import AirIcon from "@mui/icons-material/Air";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import SpeedIcon from "@mui/icons-material/Speed";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CallIcon from "@mui/icons-material/Call";
import ChatIcon from "@mui/icons-material/Chat";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  getPatientById,
  getPatientSummary,
} from "../api/patients";
import {
  getDoctorById,
} from "../api/doctors";
import {
  getVisitHistory,
} from "../api/visits";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

const DATE_OPTIONS = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month", "Last Month", "Custom Range"];
const ROWS_OPTIONS = [5, 10, 15, 20];

const statusClass = (s) => {
  const map = {
    "checked out": "checked-out",
    "checked in": "checked-in",
    "checked_in": "checked-in",
    "cancelled": "cancelled",
    "schedule": "schedule",
    "confirmed": "confirmed",
    "completed": "completed",
    "pending": "pending",
  };
  return map[s.toLowerCase()] || "confirmed";
};

// ─── OUTSIDE CLICK ────────────────────────────────────────────────────────────
function useOutsideClick(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PatientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("visits");
  const [search, setSearch] = useState("");
  const [dateLabel, setDateLabel] = useState("Last 30 Days");
  const [dateOpen, setDateOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [patientVisits, setPatientVisits] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});

  const [selectedVisitHistory, setSelectedVisitHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [patientSummary, setPatientSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);

        const response = await getPatientById(id);

        console.log("Patient Detail API Response:", response);

        if (response?.status === "success" && response?.data) {
          const data = response.data;

          setPatient({
            id: data.patientCode,
            name: data.name || "",
            age: data.dateOfBirth
              ? new Date().getFullYear() -
              new Date(data.dateOfBirth).getFullYear()
              : "",
            gender: data.gender
              ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
              : "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            dob: data.dateOfBirth
              ? new Date(data.dateOfBirth).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              : "",
            bloodGroup: data.bloodGroup || "N/A",
            lastVisited: "N/A",
            color: "#3b82f6",
            vitals: {
              bloodPressure: "N/A",
              heartRate: "N/A",
              spo2: "N/A",
              temperature: "N/A",
              respiratoryRate: "N/A",
              weight: "N/A",
            },
          });
        } else {
          setPatient(null);
        }
      } catch (error) {
        console.error("Patient detail API error:", error);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);


  useEffect(() => {
    const fetchPatientSummary = async () => {
      if (!id) return;

      try {
        setSummaryLoading(true);

        const response = await getPatientSummary(id);

        console.log("PATIENT SUMMARY:", response);

        if (response?.status === "success" && response?.data) {

          if (response.data.patient?.bloodGroup) {
            setPatient((prev) =>
              prev
                ? {
                  ...prev,
                  bloodGroup: response.data.patient.bloodGroup,
                }
                : prev
            );
          }

          const visits = (response.data.visits || []).map((item) => ({
            ...item.visit,
            clinicalHistory: item,
          }));

          setPatientVisits(visits);

          const summaryAppointments = response.data.appointments || [];

          setAppointments(summaryAppointments);

          // Appointment API me doctorId sirf ID aa rahi hai,
          // isliye doctor details separately fetch kar rahe hain.
          const doctorIds = [
            ...new Set(
              summaryAppointments
                .map((appointment) =>
                  typeof appointment.doctorId === "string"
                    ? appointment.doctorId
                    : appointment.doctorId?._id
                )
                .filter(Boolean)
            ),
          ];

          const doctorResults = await Promise.all(
            doctorIds.map(async (doctorId) => {
              try {
                const doctorResponse = await getDoctorById(doctorId);

                if (
                  doctorResponse?.status === "success" &&
                  doctorResponse?.data
                ) {
                  return [doctorId, doctorResponse.data];
                }

                return [doctorId, null];
              } catch (error) {
                console.error(`Doctor ${doctorId} fetch error:`, error);
                return [doctorId, null];
              }
            })
          );

          setDoctorMap(Object.fromEntries(doctorResults));
        } else {
          setPatientSummary(null);
          setPatientVisits([]);
          setAppointments([]);
        }
      } catch (error) {
        console.error("Patient Summary API Error:", error);
        setPatientSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchPatientSummary();
  }, [id]);


  const dateRef = useRef();
  useOutsideClick(dateRef, () => setDateOpen(false));

  useEffect(() => { setPage(1); }, [activeTab, search]);

  const handleVisitClick = async (visit) => {
    const visitId = visit._id || visit.id;

    if (!visitId) return;

    try {
      setHistoryLoading(true);

      const response = await getVisitHistory(visitId);

      console.log("VISIT HISTORY API RESPONSE:", response);

      if (response?.status === "success" && response?.data) {
        setSelectedVisitHistory(response.data);
      } else {
        setSelectedVisitHistory(null);
      }
    } catch (error) {
      console.error("Visit History API Error:", error);
      setSelectedVisitHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const visits = [...patientVisits].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // ── Filter data ──
  const apptFiltered = appointments.filter((a) => {
    const doctorId =
      typeof a.doctorId === "string"
        ? a.doctorId
        : a.doctorId?._id;

    const doctor = doctorMap[doctorId];

    const doctorName =
      a.doctorName ||
      doctor?.name ||
      (typeof a.doctorId === "object" ? a.doctorId?.name : "");

    const doctorSpecialization =
      doctor?.specialization ||
      (typeof a.doctorId === "object"
        ? a.doctorId?.specialization
        : "") ||
      a.designation ||
      "";

    return (
      `${doctorName} ${doctorSpecialization} ${doctorId} ${a.appointmentType || ""} ${a.status || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });


  const visitFiltered = visits.filter((visit) => {
    const visitId = visit._id || visit.id || "";
    const visitType = visit.visitType || "";
    const status = visit.status || "";

    return (
      visitId.toLowerCase().includes(search.toLowerCase()) ||
      visitType.toLowerCase().includes(search.toLowerCase()) ||
      status.toLowerCase().includes(search.toLowerCase())
    );
  });

  const admissions = patientSummary?.admissions || [];

  const admissionFiltered = admissions.filter((admission) => {
    const searchText = `
    ${admission.patientId || ""}
    ${admission.visitId || ""}
    ${admission.admissionType || ""}
    ${admission.bedNumber || ""}
    ${admission.status || ""}
  `.toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const discharges = patientSummary?.discharges || [];

  const transactions = [
    ...(patientSummary?.invoices || []).map((invoice) => ({
      id: invoice.invoiceNumber || invoice._id || invoice.id || "N/A",
      desc: "Invoice",
      date: invoice.createdAt || invoice.date || invoice.invoiceDate,
      method: "-",
      amount:
        invoice.totalAmount ??
        invoice.amount ??
        invoice.grandTotal ??
        0,
      status: invoice.status || "Pending",
      type: "invoice",
    })),

    ...(patientSummary?.payments || []).map((payment) => ({
      id: payment._id || payment.id || "N/A",
      desc: "Payment",
      date: payment.createdAt || payment.paymentDate || payment.date,
      method:
        payment.paymentMethod ||
        payment.method ||
        "N/A",
      amount:
        payment.amount ??
        payment.paidAmount ??
        payment.totalAmount ??
        0,
      status: payment.status || "Paid",
      type: "payment",
    })),
  ];

  const transactionFiltered = transactions.filter((transaction) =>
    `${transaction.id} ${transaction.desc} ${transaction.method} ${transaction.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const currentData =
    activeTab === "visits"
      ? visitFiltered
      : activeTab === "appointments"
        ? apptFiltered
        : activeTab === "admissions"
          ? admissionFiltered
          : transactionFiltered;

  const totalPages = Math.max(
    1,
    Math.ceil(currentData.length / rowsPerPage)
  );
  const pageData = currentData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading patient...</div>;
  }

  if (!patient) {
    return <div style={{ padding: "40px" }}>Patient not found.</div>;
  }

  const lastVisited = patientSummary?.latestVisit?.createdAt
    ? new Date(patientSummary.latestVisit.createdAt).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "N/A";

  const initials = patient.name.split(" ").slice(0, 2).map(w => w[0]).join("");

  return (
    <div className="patient-details-page">

      {/* Breadcrumb */}
      <div className="breadcrumb" onClick={() => navigate("/patients")}>
        <ArrowBackIosNewIcon /> Patients
      </div>

      {/* ── Hero Card ── */}
      <div className="patient-hero">
        {/* Abstract shape */}
        <div className="hero-bg-shape">
          <svg viewBox="0 0 240 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#312e81" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <polygon points="120,0 240,0 240,120 0,120" fill="url(#heroGrad)" opacity="0.15" />
            <polygon points="160,0 240,0 240,80" fill="url(#heroGrad)" opacity="0.2" />
          </svg>
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="patient-img" style={{ background: patient.color + "18", color: patient.color }}>
              {initials}
            </div>
            <div className="patient-info">
              <div className="patient-id">#{patient.id}</div>
              <div className="patient-name">{patient.name}</div>
              <div className="patient-address">
                <LocationOnIcon /> {patient.address}
              </div>
              <div className="patient-meta">
                <div className="meta-item">
                  <PhoneIcon /> Phone : {patient.phone}
                </div>
                <div className="meta-item">
                  <CalendarTodayIcon /> Last Visited : {lastVisited}
                </div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="icon-action-btn"><CallIcon /></div>
            <div className="icon-action-btn"><ChatIcon /></div>
            <div className="icon-action-btn"><VideoCallIcon /></div>
            <button
              className="btn-book"
              onClick={() => {
                const latestAppointment = [...appointments].sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )[0];

                navigate("/appointments/new", {
                  state: {
                    patient: {
                      ...patient,
                      _id: id,
                    },
                    lastAppointment: latestAppointment || null,
                  },
                });
              }}
            >
              <CalendarMonthIcon /> Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* ── About + Vital Signs ── */}
      <div className="info-row">

        {/* About */}
        <div className="info-card">
          <div className="ic-title">
            <PersonIcon /> About
          </div>
          <div className="about-grid">
            {[
              { icon: <CakeIcon />, label: "DOB", value: patient.dob },
              { icon: <BloodtypeIcon />, label: "Blood Group", value: patient.bloodGroup },
              { icon: <WcIcon />, label: "Gender", value: patient.gender },
              { icon: <EmailIcon />, label: "Email", value: patient.email },
            ].map((item, i) => (
              <div className="ag-item" key={i}>
                <div className="ag-icon">{item.icon}</div>
                <div className="ag-content">
                  <div className="ag-label">{item.label}</div>
                  <div className="ag-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="info-card">
          <div className="ic-title">
            <MonitorHeartIcon /> Vital Signs
          </div>
          <div className="vitals-grid">
            {[
              { icon: <FavoriteIcon />, label: "Blood Pressure", value: patient.vitals.bloodPressure, dot: "green" },
              { icon: <MonitorHeartIcon />, label: "Heart Rate", value: patient.vitals.heartRate, dot: "red" },
              { icon: <AirIcon />, label: "SPO2", value: patient.vitals.spo2, dot: "green" },
              { icon: <ThermostatIcon />, label: "Temperature", value: patient.vitals.temperature, dot: "red" },
              { icon: <SpeedIcon />, label: "Respiratory Rate", value: patient.vitals.respiratoryRate, dot: "red" },
              { icon: <FitnessCenterIcon />, label: "Weight", value: patient.vitals.weight, dot: "green" },
            ].map((v, i) => (
              <div className="vital-item" key={i}>
                <div className="vital-icon">{v.icon}</div>
                <div className="vital-content">
                  <div className="vital-label">{v.label}</div>
                  <div className="vital-value">
                    <span className={`vital-dot ${v.dot}`} />
                    {v.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Allergies + Current Medications ── */}

        {/* Allergies */}
        <div className="info-card">
          <div className="ic-title">
            <FavoriteIcon /> Allergies
          </div>

          <div style={{ padding: "12px 0" }}>
            {patientSummary?.patient?.allergies &&
              (Array.isArray(patientSummary.patient.allergies)
                ? patientSummary.patient.allergies.length > 0
                : patientSummary.patient.allergies) ? (
              Array.isArray(patientSummary.patient.allergies) ? (
                patientSummary.patient.allergies.map((allergy, index) => (
                  <span
                    key={index}
                  >
                    {typeof allergy === "object"
                      ? allergy.name || allergy.allergen || "-"
                      : allergy}
                  </span>
                ))
              ) : (
                <span>{patientSummary.patient.allergies}</span>
              )
            ) : (
              <span style={{ color: "#64748b" }}>No known allergies</span>
            )}
          </div>
        </div>

        {/* Current Medications */}
        <div className="info-card">
          <div className="ic-title">
            <MonitorHeartIcon /> Current Medications
          </div>

          <div style={{ padding: "12px 0" }}>
            {patientSummary?.patient?.currentMedications &&
              (Array.isArray(patientSummary.patient.currentMedications)
                ? patientSummary.patient.currentMedications.length > 0
                : patientSummary.patient.currentMedications) ? (
              Array.isArray(patientSummary.patient.currentMedications) ? (
                patientSummary.patient.currentMedications.map((medication, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px 10px",
                      marginBottom: "6px",
                      borderRadius: "6px",
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: "13px",
                    }}
                  >
                    {typeof medication === "object"
                      ? medication.name ||
                      medication.medicineName ||
                      medication.medicationName ||
                      "-"
                      : medication}
                  </div>
                ))
              ) : (
                <span>{patientSummary.patient.currentMedications}</span>
              )
            ) : (
              <span style={{ color: "#64748b" }}>
                No current medications
              </span>
            )}
          </div>
        </div>





      </div>

      {/* ── Tabs Card ── */}
      <div className="tabs-card">

        {/* Tab Nav */}
        <div className="tabs-nav">
          {["visits", "appointments", "admissions", "transactions"].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="tab-toolbar">
          <div className="tab-toolbar-left">
            {/* Search */}
            <div className="tab-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div ref={dateRef}>
              <div className="date-range-btn" onClick={() => setDateOpen(o => !o)}>
                <CalendarTodayIcon />
                8 Mar 26 - 8 Mar 26
                {dateOpen && (
                  <div className="date-dropdown">
                    {DATE_OPTIONS.map(opt => (
                      <div
                        key={opt}
                        className={`dd-item ${dateLabel === opt ? "active" : ""}`}
                        onClick={e => { e.stopPropagation(); setDateLabel(opt); setDateOpen(false); }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter btn */}
          <button className="btn-filter-sm">
            <FilterListIcon /> Filters
          </button>
        </div>

        {/* ── VISITS TABLE ── */}
        {activeTab === "visits" && (
          <div className="tab-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Visit ID</th>
                  <th>Visit Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visits.length > 0 ? (
                  pageData.map((visit) => {
                    const visitId = visit.visitCode || visit._id || visit.id;

                    const visitDate = visit.createdAt
                      ? new Date(visit.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "N/A";

                    return (
                      <tr
                        key={visitId}
                        onClick={() => handleVisitClick(visit)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{visitDate}</td>
                        <td>{visitId || "N/A"}</td>
                        <td>{visit.visitType || "N/A"}</td>

                        <td>
                          <span className={`appt-status ${statusClass(visit.status || "")}`}>
                            {visit.status || "N/A"}
                          </span>
                        </td>

                        <td>
                          {visit.status === "checked_in" && (
                            <button
                              type="button"
                              className="visit-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/patients/${id}/visits/${visit._id}/consultation`
                                );
                              }}
                            >
                              Consult
                            </button>
                          )}

                          {visit.status === "completed" && (
                            <button
                              type="button"
                              className="visit-action-btn secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVisitClick(visit);
                              }}
                            >
                              View History
                            </button>
                          )}

                          {visit.status === "registered" && (
                            <span className="visit-action-disabled">
                              Check-in required
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "30px" }}>
                      {summaryLoading
                        ? "Loading visits..."
                        : "No visits found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── APPOINTMENTS TABLE ── */}
        {activeTab === "appointments" && (
          <div className="tab-table">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Doctor Name</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((appt) => {
                  const appointmentDoctorId =
                    typeof appt.doctorId === "string"
                      ? appt.doctorId
                      : appt.doctorId?._id;

                  const doctor = doctorMap[appointmentDoctorId];

                  const doctorName =
                    appt.doctorName ||
                    doctor?.name ||
                    (typeof appt.doctorId === "object"
                      ? appt.doctorId?.name
                      : "") ||
                    "Unknown Doctor";

                  const doctorRole =
                    doctor?.specialization ||
                    (typeof appt.doctorId === "object"
                      ? appt.doctorId?.specialization
                      : "") ||
                    appt.designation ||
                    "";

                  const doctorInitials = doctorName
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const appointmentDate = appt.createdAt
                    ? new Date(appt.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "N/A";

                  const appointmentMode =
                    appt.appointmentType || "N/A";

                  const appointmentStatus =
                    appt.status || "N/A";

                  const appointmentId =
                    appt._id || appt.id;

                  return (
                    <tr key={appointmentId}>
                      <td>{appointmentDate}</td>

                      <td>
                        <div
                          className="doc-cell"
                          onClick={() =>
                            appointmentDoctorId &&
                            navigate(`/doctors/${appointmentDoctorId}`)
                          }
                        >
                          <div
                            className="cell-avatar"
                            style={{
                              background: "#3b82f622",
                              color: "#3b82f6",
                            }}
                          >
                            {doctorInitials}
                          </div>

                          <div>
                            <div className="cell-name">
                              {doctorName}
                            </div>

                            <div className="cell-sub">
                              {doctorRole}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>{appointmentMode}</td>

                      <td>
                        <span
                          className={`appt-status ${statusClass(
                            appointmentStatus
                          )}`}
                        >
                          {appointmentStatus}
                        </span>
                      </td>

                      <td>
                        <div style={{ position: "relative" }}>
                          <button
                            className="icon-btn"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === appointmentId
                                  ? null
                                  : appointmentId
                              )
                            }
                          >
                            <MoreVertIcon />
                          </button>

                          {openMenu === appointmentId && (
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "calc(100% + 4px)",
                                background: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                boxShadow:
                                  "0 4px 12px rgba(0,0,0,0.08)",
                                minWidth: 130,
                                zIndex: 50,
                                overflow: "hidden",
                              }}
                            >
                              {["View", "Edit", "Cancel"].map((opt) => (
                                <div
                                  key={opt}
                                  onClick={() => setOpenMenu(null)}
                                  style={{
                                    padding: "9px 16px",
                                    fontSize: 13,
                                    color:
                                      opt === "Cancel"
                                        ? "#ef4444"
                                        : "#475569",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "#f8fafc")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "")
                                  }
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
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

        {/* ── ADMISSIONS TABLE ── */}
        {activeTab === "admissions" && (
          <div className="tab-table">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Visit ID</th>
                  <th>Admission Type</th>
                  <th>Bed Number</th>
                  <th>Status</th>
                  <th>Admitted Date</th>
                  <th>Discharged Date</th>
                </tr>
              </thead>

              <tbody>
                {pageData.length > 0 ? (
                  pageData.map((admission) => (
                    <tr key={admission._id}>
                      <td>{admission.patientId || "N/A"}</td>

                      <td>{admission.visitId || "N/A"}</td>

                      <td>{admission.admissionType || "N/A"}</td>

                      <td>{admission.bedNumber || "N/A"}</td>

                      <td>
                        <span
                          className={`appt-status ${statusClass(
                            admission.status || "pending"
                          )}`}
                        >
                          {admission.status || "N/A"}
                        </span>
                      </td>

                      <td>
                        {admission.admittedAt
                          ? new Date(admission.admittedAt).toLocaleDateString(
                            "en-GB"
                          )
                          : "N/A"}
                      </td>
                      <td>
                        {admission.dischargedAt
                          ? new Date(admission.dischargedAt).toLocaleDateString(
                            "en-GB"
                          )
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#64748b",
                      }}
                    >
                      {summaryLoading
                        ? "Loading admissions..."
                        : "No admissions found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TRANSACTIONS TABLE ── */}
        {activeTab === "transactions" && (
          <div className="tab-table">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Paid Date</th>
                  <th>Payment Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length > 0 ? (
                  pageData.map((txn) => (
                    <tr key={txn.id}>
                      <td style={{ fontWeight: 600, color: "#1e293b" }}>{txn.id}</td>
                      <td>{txn.desc}</td>
                      <td>
                        {txn.date
                          ? new Date(txn.date).toLocaleDateString("en-GB")
                          : "N/A"}
                      </td>
                      <td>{txn.method}</td>
                      <td style={{ fontWeight: 700, color: "#1e293b" }}>
                        ₹{Number(txn.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className={`txn-status ${txn.status.toLowerCase()}`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#64748b",
                      }}
                    >
                      {summaryLoading
                        ? "Loading transactions..."
                        : "No transactions found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        <div className="tab-pagination">
          <div className="page-info">
            Row Per Page
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            >
              {ROWS_OPTIONS.map(r => <option key={r}>{r}</option>)}
            </select>
            Entries
          </div>

          <div className="page-nav">
            <button
              className="page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeftIcon />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`page-btn ${page === p ? "active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>

      </div>

      <VisitHistoryModal
        history={selectedVisitHistory}
        loading={historyLoading}
        onClose={() => setSelectedVisitHistory(null)}
      />
    </div>
  );
}