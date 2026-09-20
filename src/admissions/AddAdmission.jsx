// AddAdmission.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { createIPDAdmission } from "../api/admissions";
import { getPatients } from "../api/patients";
import { getDoctors } from "../api/doctors";
import { getAvailableBeds } from "../api/beds";
import { useToast } from "../context/ToastContext";

const initialState = {
  patientId: "",
  doctorId: "",
  bedId: "",
  admissionType: "IPD",
  reason: "",
  ward: "General Ward",
  department: "General Medicine",
  status: "admitted",
};

export default function AddAdmission() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialState);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, doctorRes, bedRes] = await Promise.all([
          getPatients(),
          getDoctors(),
          getAvailableBeds(),
        ]);

        const patientList = patientRes?.data || patientRes || [];
        const doctorList = doctorRes?.data || doctorRes || [];
        const bedList = bedRes?.data || bedRes || [];

        setPatients(Array.isArray(patientList) ? patientList : []);
        setDoctors(Array.isArray(doctorList) ? doctorList : []);
        setBeds(Array.isArray(bedList) ? bedList : []);
      } catch (error) {
        console.error("Admission form data load error:", error);
      }
    };

    fetchData();
  }, []);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedPatient = patients.find(
        (p) => (p._id || p.id) === form.patientId,
      );

      const selectedBed = beds.find((b) => (b._id || b.id) === form.bedId);

      if (!selectedPatient || !selectedBed || !form.doctorId) {
        showToast("Please select patient, doctor and bed", "warning");
        setLoading(false);
        return;
      }

      const payload = {
        patientName: selectedPatient?.name,
        admissionType: "IPD",
        bedNumber: selectedBed?.bedNumber,
        doctorId: form.doctorId,
      };

      await createIPDAdmission(payload);
      showToast("Admission created successfully", "success");
      navigate("/admissions");
    } catch (error) {
      showToast(error?.message || "Failed to create admission", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-doctor-page">
      <div className="breadcrumb">
        <span className="bc-back" onClick={() => navigate("/admissions")}>
          <ArrowBackIosNewIcon /> Admissions
        </span>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-title">Create New Admission</div>

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
              <label>
                Doctor <span className="req">*</span>
              </label>
              <select
                value={form.doctorId}
                onChange={(e) => setField("doctorId", e.target.value)}
                required
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
              <label>Admission Type</label>
              <select
                value={form.admissionType}
                onChange={(e) => setField("admissionType", e.target.value)}
              >
                <option value="IPD">IPD</option>
              </select>
            </div>

            <div className="form-group">
              <label>Available Bed</label>
              <select
                value={form.bedId}
                onChange={(e) => setField("bedId", e.target.value)}
              >
                <option value="">Select bed</option>
                {beds.map((bed) => (
                  <option key={bed._id || bed.id} value={bed._id || bed.id}>
                    {bed.bedNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input
                value={form.department}
                onChange={(e) => setField("department", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Ward</label>
              <input
                value={form.ward}
                onChange={(e) => setField("ward", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Admission</label>
            <textarea
              rows="4"
              value={form.reason}
              onChange={(e) => setField("reason", e.target.value)}
              placeholder="Describe patient condition or reason for admission"
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
