//doctors/EditDoctor.jsx
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { updateDoctor } from "../api/doctors";

const EditDoctor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const doctor = location.state?.doctor;

  const [formData, setFormData] = useState({
    name: doctor?.name || "",
    role: doctor?.role || "",
    dept: doctor?.dept || "",
    phone: doctor?.phone || "",
    email: doctor?.email || "",
    fee: doctor?.fee || "",
    status: doctor?.status || "Available",
    avail: doctor?.avail || "",
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
    const payload = {
      name: formData.name.trim(),
      specialization: formData.role || formData.dept,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
    };

    await updateDoctor(id, payload);

    setSaved(true);

    setTimeout(() => {
      navigate("/doctors");
    }, 500);
  } catch (error) {
    console.error("Update doctor error:", error);

    alert(
      error?.message ||
        error?.error ||
        "Failed to update doctor. Please try again."
    );
  }
};
  return (
    <div className="add-doctor-page">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span
          className="bc-back"
          onClick={() => navigate("/doctors")}
        >
          <ArrowBackIosNewIcon />
          Doctor
        </span>
      </div>

      {/* Main Form Card */}
      <div className="form-card">

        <div className="form-card-title">
          Edit Doctor
        </div>

        {/* Contact Information */}
        <div className="form-section">

          <div className="section-title">
            Contact Information
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>
                Doctor Name <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter doctor name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Designation <span>*</span>
              </label>

              <input
                type="text"
                name="role"
                placeholder="Enter designation"
                value={formData.role}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-row">

            <div className="form-group">
              <label>
                Department <span>*</span>
              </label>

              <input
                type="text"
                name="dept"
                placeholder="Enter department"
                value={formData.dept}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-row">

            <div className="form-group">
              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Consultation Fees
              </label>

              <input
                type="number"
                name="fee"
                placeholder="Enter consultation fees"
                value={formData.fee}
                onChange={handleChange}
              />
            </div>

          </div>

        </div>

        {/* Professional Information */}
        <div className="form-section">

          <div className="section-title">
            Professional Information
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Available">
                  Available
                </option>

                <option value="Unavailable">
                  Unavailable
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Availability
              </label>

              <input
                type="text"
                name="avail"
                placeholder="Enter availability"
                value={formData.avail}
                onChange={handleChange}
              />
            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="form-footer">

        <button
          type="button"
          className="btn-cancel-form"
          onClick={() => navigate("/doctors")}
        >
          Cancel
        </button>

        <button
          type="button"
          className="btn-submit"
          onClick={handleSubmit}
        >
          {saved ? "Saved ✓" : "Save Changes"}
        </button>

      </div>

    </div>
  );
};

export default EditDoctor;