import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PersonIcon from "@mui/icons-material/Person";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { createStaff } from "../api/staff";

const initialForm = {
  profileImage: null,
  profilePreview: "",
  name: "",
  email: "",
  phone: "",
  role: "staff",
  department: "",
  status: "active",
};

const roles = ["staff", "nurse", "supervisor", "admin", "receptionist", "lab technician"];
const departments = [
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "General Medicine",
  "Radiology",
  "Pharmacy",
  "Nursing",
  "Administration",
];

function FormGroup({ label, required, error, children }) {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span className="req"> *</span>}
        </label>
      )}
      {children}
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
}

export default function AddStaff() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profileImage: file, profilePreview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{7,15}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number";
    }
    if (!form.role) nextErrors.role = "Role is required";
    if (!form.department) nextErrors.department = "Department is required";

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = document.querySelector(".error");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        department: form.department,
        status: form.status,
      };

      const response = await createStaff(payload);
      if (response?.status === "success" || response?.message) {
        alert("Staff member added successfully");
        navigate("/staff");
      }
    } catch (error) {
      console.error("Create staff error:", error);
      alert(error?.message || "Failed to create staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-doctor-page">
      <div className="breadcrumb">
        <span className="bc-back" onClick={() => navigate("/staff")}>
          <ArrowBackIosNewIcon /> Staff
        </span>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-title" style={{ paddingTop: 8 }}>Staff Information</div>

          <div className="profile-upload">
            <span className="upload-label">Profile Image</span>
            <div className="upload-circle">
              {form.profilePreview ? (
                <img src={form.profilePreview} alt="preview" />
              ) : (
                <PersonIcon className="upload-icon" />
              )}
              <div className="upload-cam">
                <CameraAltIcon />
              </div>
              <input type="file" accept="image/*" onChange={handleImage} />
            </div>
          </div>

          <div className="form-row">
            <FormGroup label="Full Name" required error={errors.name}>
              <input
                type="text"
                className={errors.name ? "error" : ""}
                placeholder="Enter full name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
              />
            </FormGroup>

            <FormGroup label="Role" required error={errors.role}>
              <select
                className={errors.role ? "error" : ""}
                value={form.role}
                onChange={(event) => setField("role", event.target.value)}
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </FormGroup>
          </div>

          <div className="form-row">
            <FormGroup label="Email" required error={errors.email}>
              <input
                type="email"
                className={errors.email ? "error" : ""}
                placeholder="Enter email address"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
              />
            </FormGroup>

            <FormGroup label="Phone" required error={errors.phone}>
              <input
                type="tel"
                className={errors.phone ? "error" : ""}
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
              />
            </FormGroup>
          </div>

          <div className="form-row">
            <FormGroup label="Department" required error={errors.department}>
              <select
                className={errors.department ? "error" : ""}
                value={form.department}
                onChange={(event) => setField("department", event.target.value)}
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Status">
              <select value={form.status} onChange={(event) => setField("status", event.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </FormGroup>
          </div>

          <div className="form-row" style={{ justifyContent: "flex-end", marginTop: 24 }}>
            <button type="button" className="btn-secondary" onClick={() => navigate("/staff")}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Create Staff"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
