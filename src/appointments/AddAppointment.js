//appointments/AddAppointmentList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getPatients } from "../api/patients";
import { getDoctors } from "../api/doctors";
import { createAppointment } from "../api/appointments";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const PATIENTS = ["Alberto Ripley", "Susan Babin", "Martin Lisa", "Stella Mary", "Carol Lam", "Marsha Noland", "Irma Armstrong", "Ezra Belcher", "Glen Lentz"];
const DOCTORS = ["Dr. Mick Thompson", "Dr. Sarah Johnson", "Dr. Emily Carter", "Dr. David Lee", "Dr. Anna Kim", "Dr. John Smith", "Dr. Lisa White", "Dr. Patricia Brown"];
const DEPARTMENTS = ["General Medicine", "Pediatrics", "Gynecology", "Cardiology", "Orthopedics", "Neurology", "Oncology", "Psychiatry", "Urology"];
const APPT_TYPES = ["OPD", "IPD", "Emergency"];
const STATUSES = ["Checked Out", "Checked In", "Cancelled", "Schedule", "Confirmed"];

// ─── CUSTOM SELECT ────────────────────────────────────────────────────────────
function CustomSelect({
  label,
  required,
  options,
  value,
  onChange,
  error,
  placeholder = "Select",
  dropUp = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="form-group" style={{ position: "relative" }}>
      {label && <label>{label}{required && <span className="req"> *</span>}</label>}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          border: `1px solid ${error ? "#ef4444" : "#e2e8f0"}`,
          borderRadius: 8, padding: "9px 12px", cursor: "pointer",
          background: "white", userSelect: "none",
        }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ fontSize: 13, color: value ? "#1e293b" : "#94a3b8" }}>
          {value || placeholder}
        </span>
        <KeyboardArrowDownIcon style={{
          fontSize: 16, color: "#94a3b8",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }} />
      </div>

      {open && (
        <div style={{
          position: "absolute",
          top: dropUp ? "auto" : "calc(100% + 2px)",
          bottom: dropUp ? "calc(100% + 2px)" : "auto",
          left: 0,
          right: 0,
          background: "white", border: "1px solid #e2e8f0",
          borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          zIndex: 9999, maxHeight: 200, overflowY: "auto",
        }}>
          <div
            style={{ padding: "9px 14px", fontSize: 13, color: "#94a3b8", cursor: "pointer" }}
            onClick={() => { onChange(""); setOpen(false); }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          >
            Select
          </div>
          {options.map(opt => (
            <div
              key={opt}
              style={{
                padding: "9px 14px", fontSize: 13, cursor: "pointer",
                background: value === opt ? "#3b82f6" : "white",
                color: value === opt ? "white" : "#475569",
                fontWeight: value === opt ? 600 : 400,
              }}
              onClick={() => { onChange(opt); setOpen(false); }}
              onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = "white"; }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validate(form) {
  const e = {};
  if (!form.patient) e.patient = "Patient is required";
  if (!form.department) e.department = "Department is required";
  if (!form.doctor) e.doctor = "Doctor is required";
  if (!form.appointmentType) e.appointmentType = "Appointment type is required";
  if (!form.date) e.date = "Date is required";
  if (!form.time) e.time = "Time is required";
  if (!form.reason.trim()) e.reason = "Appointment reason is required";
  if (!form.status) e.status = "Status is required";
  return e;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function NewAppointment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
  appointmentId: `AP${Date.now()}`,
  patient: "",
    patientId: "",
    patientType: "",
    department: "",
    doctor: "",
    doctorId: "",
    appointmentType: "",
    date: "",
    time: "",
    reason: "",
    status: "",
  });
  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientsLoading(true);

        const response = await getPatients();

        const backendPatients = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

        setPatients(backendPatients);
      } catch (error) {
        console.error("Patients API Error:", error);
        setPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);

        const response = await getDoctors();

        const backendDoctors = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

        setDoctors(backendDoctors);
      } catch (error) {
        console.error("Doctors API Error:", error);
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    setErrors(errs);

    if (Object.keys(errs).length !== 0) {
      const first = document.querySelector(".error-msg");

      if (first) {
        first.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      return;
    }

    try {
      const statusMap = {
        "Checked Out": "completed",
        "Checked In": "completed",
        Cancelled: "cancelled",
        Schedule: "scheduled",
        Confirmed: "scheduled",
      };

      const payload = {
        patientId: form.patientId,
        patientName: form.patient,
        patientType: form.patientType || "local",
        appointmentType: form.appointmentType,
        visitReason: form.reason,
        doctorId: form.doctorId,
      };

      console.log("Creating appointment:", payload);

      await createAppointment(payload);

      alert("Appointment created successfully!");

      navigate("/appointments");
    } catch (error) {
      console.error("Create Appointment Error:", error);

      alert(
        error?.message ||
        error?.error ||
        "Failed to create appointment"
      );
    }
  };

  return (
    <div className="add-doctor-page">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="bc-back" onClick={() => navigate("/appointments")}>
          <ArrowBackIosNewIcon /> Appointments
        </span>
      </div>

      <div className="form-card">
        <div className="form-section">

          {/* Appointment ID */}
          <div className="form-group">
            <label>Appointment ID <span className="req">*</span></label>
            <input
              type="text"
              value={form.appointmentId}
              onChange={e => set("appointmentId", e.target.value)}
              style={{ background: "#f8fafc", color: "#64748b" }}
              readOnly
            />
          </div>

          {/* Patient / Department */}
          <div className="form-row">
            {/* Patient with Add New */}
            <div className="form-group" style={{ position: "relative" }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Patient <span className="req">*</span></span>
                <span
                  style={{ display: "flex", alignItems: "center", gap: 4, color: "#3b82f6", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  onClick={() => navigate("/patients/create")}
                >
                  <AddCircleOutlineIcon style={{ fontSize: 14 }} /> Add New
                </span>
              </label>
              <CustomSelect
                options={patients.map((patient) => patient.name)}
                value={form.patient}
                onChange={(value) => {
                  const selectedPatient = patients.find(
                    (patient) => patient.name === value
                  );

                  setForm((current) => ({
                    ...current,
                    patient: value,
                    patientId: selectedPatient?._id || "",
                    patientType: selectedPatient?.patientType || "local",
                  }));

                  if (errors.patient) {
                    setErrors((current) => ({
                      ...current,
                      patient: "",
                    }));
                  }
                }}
                error={errors.patient}
                placeholder={patientsLoading ? "Loading patients..." : "Select"}
              />
            </div>

            <CustomSelect
              label="Department"
              required
              options={DEPARTMENTS}
              value={form.department}
              onChange={v => set("department", v)}
              error={errors.department}
            />
          </div>

          {/* Doctor / Appointment Type */}
          <div className="form-row">
            <CustomSelect
              label="Doctor"
              required
              options={doctors.map((doctor) => doctor.name)}
              value={form.doctor}
              onChange={(value) => {
                const selectedDoctor = doctors.find(
                  (doctor) => doctor.name === value
                );

                setForm((current) => ({
                  ...current,
                  doctor: value,
                  doctorId: selectedDoctor?._id || "",
                  department: selectedDoctor?.specialization || current.department,
                }));

                if (errors.doctor) {
                  setErrors((current) => ({
                    ...current,
                    doctor: "",
                  }));
                }
              }}
              error={errors.doctor}
              placeholder={doctorsLoading ? "Loading doctors..." : "Select"}
            />
            <CustomSelect
              label="Appointment Type"
              required
              options={APPT_TYPES}
              value={form.appointmentType}
              onChange={v => set("appointmentType", v)}
              error={errors.appointmentType}
            />
          </div>

          {/* Date / Time */}
          <div className="form-row">
            <div className="form-group">
              <label>Date of Appointment <span className="req">*</span></label>
              <div className="input-icon-wrap">
                <input
                  type="date"
                  className={errors.date ? "error" : ""}
                  value={form.date}
                  onChange={e => set("date", e.target.value)}
                />
                <span className="input-icon"><CalendarTodayIcon /></span>
              </div>
              {errors.date && <span className="error-msg">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label>Time <span className="req">*</span></label>
              <div className="input-icon-wrap">
                <input
                  type="time"
                  className={errors.time ? "error" : ""}
                  value={form.time}
                  onChange={e => set("time", e.target.value)}
                />
                <span className="input-icon"><AccessTimeIcon /></span>
              </div>
              {errors.time && <span className="error-msg">{errors.time}</span>}
            </div>
          </div>

          {/* Appointment Reason */}
          <div className="form-group">
            <label>Appointment Reason <span className="req">*</span></label>
            <textarea
              rows={4}
              className={errors.reason ? "error" : ""}
              placeholder="Enter reason for appointment..."
              value={form.reason}
              onChange={e => set("reason", e.target.value)}
              style={{ resize: "vertical", minHeight: 80 }}
            />
            {errors.reason && <span className="error-msg">{errors.reason}</span>}
          </div>

          {/* Status */}
          <div style={{ position: "relative", zIndex: 20 }}>
            <CustomSelect
              label="Status"
              required
              options={STATUSES}
              value={form.status}
              onChange={v => set("status", v)}
              error={errors.status}
              dropUp 
            />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="form-footer">
        <button className="btn-cancel-form" onClick={() => navigate("/appointments")}>
          Cancel
        </button>
        <button className="btn-submit" onClick={handleSubmit}>
          Create Appointment
        </button>
      </div>

    </div>
  );
}