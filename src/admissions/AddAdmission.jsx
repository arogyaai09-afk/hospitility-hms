// AddAdmission.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { createIPDAdmission, getAdmissions } from "../api/admissions";
import { getPatients } from "../api/patients";
import { getPatientVisits } from "../api/visits";
import { getDoctors } from "../api/doctors";
import { getAvailableBeds } from "../api/beds";
import { useToast } from "../context/ToastContext";

const initialState = {
  patientId: "",
  visitId: "",
  doctorId: "",
  bedId: "",
  bedNumber: "",
  admissionType: "IPD",
  department: "",
  ward: "",
  reason: "",
};

export default function AddAdmission() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(initialState);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
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

  useEffect(() => {
    if (!isEditMode || !form.bedNumber || !beds.length) {
      return;
    }

    const currentBed = beds.find((bed) => bed.bedNumber === form.bedNumber);

    if (currentBed) {
      setField("bedId", currentBed._id || currentBed.id);
    }
  }, [beds, form.bedNumber, isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchAdmission = async () => {
      try {
        const response = await getAdmissions();

        const admissionList = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        const existingAdmission = admissionList.find((item) => item._id === id);

        if (!existingAdmission) {
          showToast("Admission not found", "error");
          navigate("/admissions");
          return;
        }

        setForm({
          patientId: existingAdmission.patientId || "",
          visitId: existingAdmission.visitId || "",
          doctorId: existingAdmission.doctorId || "",
          bedId: "",
          bedNumber: existingAdmission.bedNumber || "",
          admissionType: existingAdmission.admissionType || "IPD",
          department: existingAdmission.department || "",
          ward: existingAdmission.ward || "",
          reason: existingAdmission.reason || "",
        });
      } catch (error) {
        console.error("Admission edit data load error:", error);

        showToast(error?.message || "Failed to load admission", "error");

        navigate("/admissions");
      }
    };

    fetchAdmission();
  }, [id, isEditMode, navigate, showToast]);

  useEffect(() => {
    const fetchPatientVisits = async () => {
      if (!form.patientId) {
        setVisits([]);
        return;
      }

      try {
        setVisitsLoading(true);

        const response = await getPatientVisits(form.patientId);

        console.log("PATIENT VISITS RESPONSE:", response);
        console.log("PATIENT VISITS DATA:", response?.data);

        const visitList = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

        setVisits(visitList);

        // New admission mein patient change hone par visit reset karo.
        // Edit mode mein existing visitId ko preserve karo.
        if (!isEditMode) {
          setForm((prev) => ({
            ...prev,
            visitId: "",
          }));
        }
      } catch (error) {
        console.error("Patient visits load error:", error);
        setVisits([]);
      } finally {
        setVisitsLoading(false);
      }
    };

    fetchPatientVisits();
  }, [form.patientId]);

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

      if (!selectedPatient || !selectedBed || !form.doctorId || !form.visitId) {
        showToast("Please select patient, visit, doctor and bed", "warning");
        setLoading(false);
        return;
      }

      const payload = {
        patientId: form.patientId,
        visitId: form.visitId,
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
          <div className="section-title">
            {isEditMode ? "Edit Admission" : "Create New Admission"}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Patient <span className="req">*</span>
              </label>
              <select
                value={form.patientId}
                onChange={(e) => setField("patientId", e.target.value)}
                required
                disabled={isEditMode}
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
                Visit <span className="req">*</span>
              </label>

              <select
                value={form.visitId || ""}
                onChange={(e) => setField("visitId", e.target.value)}
                required
                disabled={isEditMode || !form.patientId || visitsLoading}
              >
                <option value="">
                  {!form.patientId
                    ? "Select patient first"
                    : visitsLoading
                      ? "Loading visits..."
                      : "Select visit"}
                </option>

                {visits.map((visit) => {
                  const visitId = visit._id || visit.id;
                  const visitCode = visit.visitCode || visitId;
                  const visitType = visit.visitType || "Visit";
                  const visitDate = visit.createdAt
                    ? new Date(visit.createdAt).toLocaleDateString("en-GB")
                    : "";

                  return (
                    <option key={visitId} value={visitId}>
                      {visitCode} - {visitType}
                      {visitDate ? ` - ${visitDate}` : ""}
                    </option>
                  );
                })}
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
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Admission"
                  : "Create Admission"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
