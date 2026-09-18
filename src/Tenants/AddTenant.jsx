import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTenant, createTenantUser } from "../api/tenants";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export default function AddTenant() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    state: "",
    country: "India",
    email: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";

    let password = "";

    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Tenant name is required";
    }

    if (!form.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      // 1. Create tenant
      const tenantResponse = await createTenant({
        name: form.name.trim(),
        state: form.state.trim(),
        country: form.country.trim() || "India",
      });

      console.log("Create Tenant Response:", tenantResponse);

      const tenantId = tenantResponse?._id;

      if (!tenantId) {
        throw new Error("Tenant was created but tenant ID was not returned.");
      }

      // 2. Generate login password
      const generatedPassword = generatePassword();

      // 3. Create tenant login user
      const userResponse = await createTenantUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: generatedPassword,
        role: "tenant",
        tenantId: tenantId,
      });

      console.log("Create Tenant User Response:", userResponse);

      // 4. Show credentials to admin
      alert(
        `Tenant created successfully!\n\n` +
          `Email: ${form.email.trim()}\n` +
          `Password: ${generatedPassword}`,
      );

      navigate("/tenants");
    } catch (error) {
      console.error("Create tenant error:", error);

      alert(
        error?.message ||
          error?.error ||
          "Failed to create tenant. Please try again.",
      );
    }
  };

  return (
    <div className="add-doctor-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="bc-back" onClick={() => navigate("/tenants")}>
          <ArrowBackIosNewIcon />
          Tenants
        </span>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <div className="form-card-title">New Tenant</div>

        {/* Tenant Information */}
        <div className="form-section">
          <div className="section-title">Tenant Information</div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Tenant Name <span className="req">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter tenant name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "error" : ""}
              />

              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>
                State <span className="req">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter state"
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className={errors.state ? "error" : ""}
              />

              {errors.state && (
                <span className="error-msg">{errors.state}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country</label>

              <input
                type="text"
                placeholder="Enter country"
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>
                Email <span className="req">*</span>
              </label>

              <input
                type="email"
                placeholder="Enter tenant email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "error" : ""}
              />

              {errors.email && (
                <span className="error-msg">{errors.email}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="form-footer">
        <button
          className="btn-cancel-form"
          onClick={() => navigate("/tenants")}
        >
          Cancel
        </button>

        <button className="btn-submit" onClick={handleSubmit}>
          Create Tenant
        </button>
      </div>
    </div>
  );
}
