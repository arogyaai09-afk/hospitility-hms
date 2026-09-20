//AdmissionDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { getAdmissions, dischargeAdmission } from "../api/admissions";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import "./AdmissionDetail.scss";

export default function AdmissionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discharging, setDischarging] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchAdmission = async () => {
      try {
        const response = await getAdmissions();

        if (response.status === "success") {
          const admissionList = response.data?.data || [];

          const foundAdmission = admissionList.find((item) => item._id === id);

          if (foundAdmission) {
            setAdmission(foundAdmission);
          } else {
            setError("Admission not found");
          }
        } else {
          setError(response.message || "Failed to fetch admissions");
        }
      } catch (error) {
        setError(error?.message || "Failed to fetch admission");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmission();
  }, [id]);

  const handleDischarge = async () => {


    try {
      setDischarging(true);

      const response = await dischargeAdmission(id);

      if (response.status === "success") {
        showToast("Patient discharged successfully", "success");
        setAdmission(response.data);
      } else {
        showToast(response.message || "Failed to discharge patient", "error");
      }
    } catch (error) {
      showToast(error?.message || "Failed to discharge patient", "error");
    } finally {
      setDischarging(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading admission...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!admission) {
    return <div className="empty-state">Admission not found</div>;
  }

  return (
    <div className="admission-detail-page">
      <div className="admission-detail-breadcrumb">
        <button onClick={() => navigate("/admissions")}>
          <ArrowBackIosNewIcon fontSize="small" />
          Admissions
        </button>
      </div>

      <div className="admission-detail-header">
        <div>
          <h1>Admission Details</h1>
          <p>View patient admission and bed information</p>
        </div>

        <span
          className={`admission-status ${
            admission.status === "discharged" ? "discharged" : "admitted"
          }`}
        >
          <span className="status-dot"></span>
          {admission.status}
        </span>
      </div>

      <div className="admission-detail-card">
        <div className="card-title">
          <div>
            <h2>Admission Information</h2>
            <p>Patient and admission details</p>
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Patient Name</span>
            <span className="detail-value">{admission.patientName || "—"}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Admission Type</span>
            <span className="detail-value">
              {admission.admissionType || "—"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Bed Number</span>
            <span className="detail-value bed-value">
              {admission.bedNumber || "—"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Admission Status</span>
            <span className="detail-value">
              <span
                className={`inline-status ${
                  admission.status === "discharged" ? "discharged" : "admitted"
                }`}
              >
                {admission.status}
              </span>
            </span>
          </div>
        </div>

        <div className="timeline-section">
          <h3>Admission Timeline</h3>

          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-icon admitted-icon"></div>

              <div>
                <strong>Patient Admitted</strong>
                <p>
                  {admission.admittedAt
                    ? new Date(admission.admittedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon discharge-icon"></div>

              <div>
                <strong>
                  {admission.dischargedAt
                    ? "Patient Discharged"
                    : "Discharge Pending"}
                </strong>

                <p>
                  {admission.dischargedAt
                    ? new Date(admission.dischargedAt).toLocaleString()
                    : "Patient is currently admitted"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="admission-actions">
          <button
            className="back-button"
            onClick={() => navigate("/admissions")}
          >
            Back to Admissions
          </button>

          {admission.status !== "discharged" && (
            <button
              className="discharge-button"
              onClick={() => setShowConfirmModal(true)}
              disabled={discharging}
            >
              {discharging ? "Discharging..." : "Discharge Patient"}
            </button>
          )}
        </div>
      </div>
      <ConfirmModal
  open={showConfirmModal}
  title="Confirm Discharge"
  message="Are you sure you want to discharge this patient?"
  confirmText="Discharge Patient"
  cancelText="Cancel"
  onCancel={() => setShowConfirmModal(false)}
  onConfirm={async () => {
  await handleDischarge();
  setShowConfirmModal(false);
}}
  loading={discharging}
/>
    </div>
  );
}
