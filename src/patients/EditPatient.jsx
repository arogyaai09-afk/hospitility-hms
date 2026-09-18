// EditPatient.jsx
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { updatePatient } from "../api/patients";

const EditPatient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const patient = location.state?.patient;

  const [formData, setFormData] = useState({
    patientCode: patient?.patientCode || `PT${id}`,
    name: patient?.name || "",
    age: patient?.age || "",
    gender: patient?.gender || "",
    phone: patient?.phone || "",
    doctor: patient?.doctor || "",
    address: patient?.address || "",
    status: patient?.status || "Available",
  });

  const [saved, setSaved] = useState(false);

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
    const response = await updatePatient(id, {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender.toLowerCase(),
      address: formData.address.trim(),
    });

    console.log("Update patient response:", response);

    if (response.status === "success") {
      setSaved(true);

      setTimeout(() => {
        navigate("/patients");
      }, 500);
    }
  } catch (error) {
    console.error("Update patient error:", error);
    alert(error?.message || "Failed to update patient");
  }
};

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
              onChange={handleChange}
              style={inputStyle}
              readOnly
            />
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

          {/* Age */}
          <div>
            <label style={labelStyle}>Age</label>

            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter age"
              min="0"
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
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
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

          {/* Doctor */}
          <div>
            <label style={labelStyle}>Doctor</label>

            <input
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter doctor name"
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
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
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
            onClick={() => navigate("/patients")}
            style={cancelButtonStyle}
          >
            Cancel
          </button>

          <button
            type="submit"
            style={saveButtonStyle}
          >
            {saved ? "Saved ✓" : "Save Changes"}
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