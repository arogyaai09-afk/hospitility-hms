import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SaveIcon from "@mui/icons-material/Save";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { getPatientById, getPatientSummary } from "../api/patients";

import { getVisitById } from "../api/visits";

import {
  createConsultation,
  getConsultationByVisit,
} from "../api/consultations";

import "./consultation.scss";
import { useToast } from "../context/ToastContext";

export default function Consultation() {
  const navigate = useNavigate();
  const { patientId, visitId } = useParams();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [visit, setVisit] = useState(null);
  const [patientSummary, setPatientSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    chiefComplaint: "",
    symptoms: "",
    examination: "",
    vitals: "",
    assessment: "",
    diagnosis: "",
    treatmentPlan: "",
    followUpDate: "",
    clinicalNotes: "",
    status: "draft",
  });

  useEffect(() => {
    const loadConsultationData = async () => {
      if (!patientId || !visitId) return;

      try {
        setLoading(true);

        const [
          patientResponse,
          visitResponse,
          summaryResponse,
          consultationResponse,
        ] = await Promise.all([
          getPatientById(patientId),
          getVisitById(visitId),
          getPatientSummary(patientId),
          getConsultationByVisit(visitId),
        ]);

        if (patientResponse?.status === "success" && patientResponse?.data) {
          setPatient(patientResponse.data);
        }

        if (visitResponse?.status === "success" && visitResponse?.data) {
          setVisit(visitResponse.data);
        }

        if (summaryResponse?.status === "success" && summaryResponse?.data) {
          setPatientSummary(summaryResponse.data);
        }

        if (
          consultationResponse?.status === "success" &&
          consultationResponse?.data
        ) {
          const consultation = consultationResponse.data;

          setForm({
            chiefComplaint: consultation.chiefComplaint || "",
            symptoms: consultation.symptoms || "",
            examination: consultation.examination || "",
            vitals:
              typeof consultation.vitals === "object"
                ? JSON.stringify(consultation.vitals, null, 2)
                : consultation.vitals || "",
            assessment: consultation.assessment || "",
            diagnosis: consultation.diagnosis || "",
            treatmentPlan: consultation.treatmentPlan || "",
            followUpDate: consultation.followUpDate
              ? consultation.followUpDate.slice(0, 10)
              : "",
            clinicalNotes: consultation.clinicalNotes || "",
            status: consultation.status || "draft",
          });
        }
      } catch (error) {
        console.error("Consultation loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConsultationData();
  }, [patientId, visitId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (status = "draft") => {
  if (!visitId) {
    showToast("Visit ID is missing.", "error");
    return;
  }

  // Consultation is already completed.
  // Do not submit it again.
  if (form.status === "completed") {
    showToast("This consultation is already completed.", "error");
    return;
  }

  try {
    setSaving(true);

    const payload = {
      chiefComplaint: form.chiefComplaint.trim(),
      symptoms: form.symptoms.trim(),
      examination: form.examination.trim(),
      vitals: form.vitals.trim(),
      assessment: form.assessment.trim(),
      diagnosis: form.diagnosis.trim(),
      treatmentPlan: form.treatmentPlan.trim(),
      followUpDate: form.followUpDate || null,
      clinicalNotes: form.clinicalNotes.trim(),
      status,
    };

    // Save consultation
    await createConsultation(visitId, payload);

    // Update local form status immediately
    setForm((prev) => ({
      ...prev,
      status,
    }));

    // Refresh visit
    const response = await getVisitById(visitId);

    if (response?.status === "success" && response?.data) {
      setVisit(response.data);
    }

    showToast(
      status === "completed"
        ? "Consultation completed successfully."
        : "Consultation saved as draft.",
      "success"
    );

  } catch (error) {
    console.error("Save consultation error:", error);

    showToast(
      error?.message ||
        error?.error ||
        "Failed to save consultation.",
      "error"
    );
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return <div className="consultation-loading">Loading consultation...</div>;
  }

  if (!patient || !visit) {
    return (
      <div className="consultation-loading">
        Patient or visit information not found.
      </div>
    );
  }

  const allergies = patientSummary?.patient?.allergies || [];
  const medications = patientSummary?.patient?.currentMedications || [];

  return (
    <div className="consultation-page">
      {/* Header */}
      <div className="consultation-header">
        <button
          className="back-btn"
          onClick={() => navigate(`/patients/${patientId}`)}
        >
          <ArrowBackIosNewIcon />
          Patient Details
        </button>

        <div>
          <h1>Consultation</h1>
          <p>Clinical consultation for this visit</p>
        </div>
      </div>

      {/* Patient / Visit Info */}
      <div className="consultation-top-grid">
        <div className="consultation-card patient-card">
          <div className="card-title">
            <MedicalServicesIcon />
            Patient Information
          </div>

          <div className="patient-main">
            <div className="patient-avatar">
              {patient.name
                ?.split(" ")
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <h2>{patient.name}</h2>
              <p>
                Patient ID: <strong>{patient.patientCode}</strong>
              </p>
            </div>
          </div>

          <div className="patient-meta-grid">
            <div>
              <span>Gender</span>
              <strong>{patient.gender || "N/A"}</strong>
            </div>

            <div>
              <span>Blood Group</span>
              <strong>{patient.bloodGroup || "N/A"}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{patient.phone || "N/A"}</strong>
            </div>

            <div>
              <span>DOB</span>
              <strong>
                {patient.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB")
                  : "N/A"}
              </strong>
            </div>
          </div>
        </div>

        <div className="consultation-card visit-card">
          <div className="card-title">
            <MedicalServicesIcon />
            Visit Information
          </div>

          <div className="visit-info">
            <div>
              <span>Visit ID</span>
              <strong>{visit.visitCode || visit._id}</strong>
            </div>

            <div>
              <span>Visit Type</span>
              <strong>{visit.visitType || "N/A"}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong className="visit-status">{visit.status || "N/A"}</strong>
            </div>

            <div>
              <span>Visit Reason</span>
              <strong>{visit.visitReason || "N/A"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="clinical-alerts">
        <div className="alert-card allergy-alert">
          <WarningAmberIcon />

          <div>
            <strong>Allergies</strong>

            <p>
              {Array.isArray(allergies)
                ? allergies.length
                  ? allergies
                      .map((item) =>
                        typeof item === "object"
                          ? item.name || item.allergen || "-"
                          : item,
                      )
                      .join(", ")
                  : "No known allergies"
                : allergies || "No known allergies"}
            </p>
          </div>
        </div>

        <div className="alert-card medication-alert">
          <MedicalServicesIcon />

          <div>
            <strong>Current Medications</strong>

            <p>
              {Array.isArray(medications)
                ? medications.length
                  ? medications
                      .map((item) =>
                        typeof item === "object"
                          ? item.name ||
                            item.medicineName ||
                            item.medicationName ||
                            "-"
                          : item,
                      )
                      .join(", ")
                  : "No current medications"
                : medications || "No current medications"}
            </p>
          </div>
        </div>
      </div>

      {/* Consultation Form */}
      <div className="consultation-card form-card">
        <div className="form-card-header">
          <div>
            <h2>Clinical Consultation</h2>
            <p>Record clinical findings for this visit.</p>
          </div>

          <span className={`draft-badge ${form.status}`}>{form.status}</span>
        </div>

        <div className="form-grid">
          <div className="form-group full-width">
            <label>Chief Complaint</label>
            <textarea
              disabled={form.status === "completed"}
              name="chiefComplaint"
              value={form.chiefComplaint}
              onChange={handleChange}
              placeholder="Enter patient's main complaint..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Symptoms</label>
            <textarea
              disabled={form.status === "completed"}
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
              placeholder="Enter symptoms..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Examination</label>
            <textarea
              disabled={form.status === "completed"}
              name="examination"
              value={form.examination}
              onChange={handleChange}
              placeholder="Enter examination findings..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Vitals</label>
            <textarea
              disabled={form.status === "completed"}
              name="vitals"
              value={form.vitals}
              onChange={handleChange}
              placeholder="Enter vital signs..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Assessment</label>
            <textarea
              disabled={form.status === "completed"}
              name="assessment"
              value={form.assessment}
              onChange={handleChange}
              placeholder="Enter clinical assessment..."
              rows={5}
            />
          </div>

          <div className="form-group full-width">
            <label>Diagnosis</label>
            <textarea
              disabled={form.status === "completed"}
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              placeholder="Enter diagnosis..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Treatment Plan</label>
            <textarea
              disabled={form.status === "completed"}
              name="treatmentPlan"
              value={form.treatmentPlan}
              onChange={handleChange}
              placeholder="Enter treatment plan..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Clinical Notes</label>
            <textarea
              disabled={form.status === "completed"}
              name="clinicalNotes"
              value={form.clinicalNotes}
              onChange={handleChange}
              placeholder="Enter additional clinical notes..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Follow-up Date</label>
            <input
              type="date"
              name="followUpDate"
              value={form.followUpDate}
              onChange={handleChange}
              disabled={form.status === "completed"}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate(`/patients/${patientId}`)}
          >
              Back
          </button>

          {form.status !== "completed" && (
            <>
              {form.status !== "completed" && (
  <>
    <button
      type="button"
      className="draft-btn"
      disabled={saving}
      onClick={() => handleSave("draft")}
    >
      {saving ? "Saving..." : "Save Draft"}
    </button>

    <button
      type="button"
      className="primary-btn"
      disabled={saving}
      onClick={() => handleSave("completed")}
    >
      <SaveIcon />
      {saving ? "Saving..." : "Complete Consultation"}
    </button>
  </>
)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
