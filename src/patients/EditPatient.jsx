// EditPatient.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPatientById, updatePatient } from "../api/patients";
import { useToast } from "../context/ToastContext";

const EditPatient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    patientCode: "",
    name: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    status: "active",
  });

  // Fetch actual patient from backend
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPatientById(id);

        const patient = response?.data;

        if (!patient) {
          throw new Error("Patient data not found");
        }

        setFormData({
          patientCode: patient.patientCode || "",
          name: patient.name || "",
          dateOfBirth: patient.dateOfBirth
            ? patient.dateOfBirth.substring(0, 10)
            : "",
          gender: patient.gender || "",
          phone: patient.phone || "",
          email: patient.email || "",
          address: patient.address || "",
          status: patient.status || "active",
        });
      } catch (err) {
        console.error("Fetch patient error:", err);

        setError(
          err?.message ||
            err?.error?.message ||
            "Failed to load patient information"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const payload = {
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender.toLowerCase(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        status: formData.status,
      };

      console.log("Updating patient:", payload);

      const response = await updatePatient(id, payload);

      console.log("Update patient response:", response);

      if (response?.status === "success") {
  setSaved(true);

  showToast("Patient updated successfully", "success");

  setTimeout(() => {
    navigate(`/patients/${id}`);
  }, 700);
} else {
        throw new Error(
          response?.message || "Failed to update patient"
        );
      }
    } catch (err) {
  console.error("Update patient error:", err);

  const errorMessage =
    err?.message ||
    err?.error?.message ||
    "Failed to update patient";

  setError(errorMessage);
  showToast(errorMessage, "error");
} finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "28px",
          background: "#f4f7fb",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "30px",
            maxWidth: "1000px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            color: "#64748b",
          }}
        >
          Loading patient information...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "28px",
        background: "#f4f7fb",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            onClick={() => navigate("/patients")}
            style={{
              cursor: "pointer",
              color: "#64748b",
              marginBottom: "8px",
              fontSize: "14px",
            }}
          >
            ← Patients
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#172033",
            }}
          >
            Edit Patient
          </h1>

          <p
            style={{
              marginTop: "6px",
              color: "#64748b",
            }}
          >
            Update patient information
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            borderRadius: "8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "28px",
          maxWidth: "1000px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "22px",
          }}
        >
          {/* Patient Code */}
          <div>
            <label style={labelStyle}>Patient Code</label>

            <input
              name="patientCode"
              value={formData.patientCode}
              style={inputStyle}
              readOnly
            />

            <small
              style={{
                display: "block",
                marginTop: "5px",
                color: "#94a3b8",
              }}
            >
              Patient ID cannot be changed.
            </small>
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Patient Name</label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter patient name"
              required
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label style={labelStyle}>Date of Birth</label>

            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Gender */}
          <div>
            <label style={labelStyle}>Gender</label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>Phone</label>

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter phone number"
            />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter email"
            />
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

          {/* Address */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Address</label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{
                ...inputStyle,
                minHeight: "100px",
                resize: "vertical",
              }}
              placeholder="Enter address"
            />
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "28px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(`/patients/${id}`)}
            style={cancelButtonStyle}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            style={{
              ...saveButtonStyle,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : saved
                ? "Saved ✓"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  border: "1px solid #d9e1ec",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#1e293b",
  background: "#fff",
  outline: "none",
};

const cancelButtonStyle = {
  padding: "11px 20px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#475569",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

const saveButtonStyle = {
  padding: "11px 22px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

export default EditPatient;