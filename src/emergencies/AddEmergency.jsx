import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { createEmergency } from "../api/emergencies";
import { getPatients } from "../api/patients";
import { getDoctors } from "../api/doctors";
import { useToast } from "../context/ToastContext";

const initialState = {
  patientId: "",
  doctorId: "",
  emergencyType: "Trauma",
  severity: "high",
  description: "",
  status: "pending",
};

export default function AddEmergency() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialState);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, doctorRes] = await Promise.all([
          getPatients(),
          getDoctors(),
        ]);

        setPatients(
          Array.isArray(patientRes?.data || patientRes)
            ? patientRes?.data || patientRes
            : [],
        );
        setDoctors(
          Array.isArray(doctorRes?.data || doctorRes)
            ? doctorRes?.data || doctorRes
            : [],
        );
      } catch (error) {
        console.error("Emergency form load error:", error);
      }
    };

    fetchData();
  }, []);

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createEmergency({
        patientId: form.patientId,
        doctorId: form.doctorId,
        emergencyType: form.emergencyType,
        severity: form.severity,
        description: form.description,
        status: form.status,
      });
      showToast("Emergency case created successfully", "success");
      navigate("/emergencies");
    } catch (error) {
      showToast(error?.message || "Failed to create emergency case", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-doctor-page">
      <div className="breadcrumb">
        <span className="bc-back" onClick={() => navigate("/emergencies")}>
          <ArrowBackIosNewIcon /> Emergencies
        </span>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-title">Report Emergency</div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Patient <span className="req">*</span>
              </label>
              <select
                value={form.patientId}
                onChange={(e) => setField("patientId", e.target.value)}
                required
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Doctor</label>
              <select
                value={form.doctorId}
                onChange={(e) => setField("doctorId", e.target.value)}
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Emergency Type</label>
              <select
                value={form.emergencyType}
                onChange={(e) => setField("emergencyType", e.target.value)}
              >
                <option value="Trauma">Trauma</option>
                <option value="Cardiac">Cardiac</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Neurological">Neurological</option>
                <option value="Obstetric">Obstetric</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setField("severity", e.target.value)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="5"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe the emergency condition, symptoms, and initial assessment"
            />
          </div>

          <div className="form-footer">
            <button
              className="btn-cancel-form"
              type="button"
              onClick={() => navigate("/admissions")}
            >
              Cancel
            </button>

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Admission"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
