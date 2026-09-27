import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { createEmergency } from "../api/emergencies";
import { getPatients } from "../api/patients";
import { getDoctors } from "../api/doctors";
import { useToast } from "../context/ToastContext";

const initialState = {
  patientId: "",
  emergencyType: "accident",
  severity: "high",
  assignedDoctor: "",
};

export default function AddEmergency() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(initialState);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [patientResponse, doctorResponse] = await Promise.all([
          getPatients(),
          getDoctors(),
        ]);

        const patientList = patientResponse?.data || patientResponse || [];

        const doctorList = doctorResponse?.data || doctorResponse || [];

        setPatients(Array.isArray(patientList) ? patientList : []);
        setDoctors(Array.isArray(doctorList) ? doctorList : []);
      } catch (error) {
        console.error("Emergency form load error:", error);

        showToast(
          error?.message || "Failed to load patients and doctors",
          "error",
        );
      }
    };

    fetchFormData();
  }, [showToast]);

  const setField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.patientId) {
      showToast("Please select a patient", "warning");
      return;
    }

    if (!form.assignedDoctor) {
      showToast("Please select a doctor", "warning");
      return;
    }

    const selectedPatient = patients.find(
      (patient) => String(patient._id || patient.id) === String(form.patientId),
    );

    try {
      setLoading(true);

      await createEmergency({
        patientName: selectedPatient?.name || "",
        patientId: form.patientId,
        emergencyType: form.emergencyType,
        severity: form.severity,
        assignedDoctor: form.assignedDoctor,
      });

      showToast("Emergency case created successfully", "success");

      navigate("/emergencies");
    } catch (error) {
      console.error("Create emergency error:", error);

      showToast(error?.message || "Failed to create emergency case", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-doctor-page">
      <div className="breadcrumb">
        <span className="bc-back" onClick={() => navigate("/emergencies")}>
          <ArrowBackIosNewIcon />
          Emergencies
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
                onChange={(event) => setField("patientId", event.target.value)}
                required
              >
                <option value="">Select patient</option>

                {patients.map((patient) => (
                  <option
                    key={patient._id || patient.id}
                    value={patient._id || patient.id}
                  >
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Doctor <span className="req">*</span>
              </label>

              <select
                value={form.assignedDoctor}
                onChange={(event) =>
                  setField("assignedDoctor", event.target.value)
                }
                required
              >
                <option value="">Select doctor</option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor._id || doctor.id}
                    value={doctor._id || doctor.id}
                  >
                    {doctor.name}
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
                onChange={(event) =>
                  setField("emergencyType", event.target.value)
                }
              >
                <option value="accident">Accident</option>
                <option value="cardiac">Cardiac</option>
                <option value="respiratory">Respiratory</option>
                <option value="neurological">Neurological</option>
                <option value="obstetric">Obstetric</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>

              <select
                value={form.severity}
                onChange={(event) => setField("severity", event.target.value)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-footer">
            <button
              className="btn-cancel-form"
              type="button"
              onClick={() => navigate("/emergencies")}
            >
              Cancel
            </button>

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Emergency"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
