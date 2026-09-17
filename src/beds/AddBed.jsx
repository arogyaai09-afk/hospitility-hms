import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { createBed } from "../api/beds";

const initialForm = {
  bedNumber: "",
  ward: "General Ward",
  roomNumber: "",
  status: "available",
  type: "General",
};

export default function AddBed() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createBed({
        bedNumber: form.bedNumber,
        ward: form.ward,
        roomNumber: form.roomNumber,
        status: form.status,
        type: form.type,
      });
      alert("Bed added successfully");
      navigate("/beds");
    } catch (error) {
      alert(error?.message || "Failed to add bed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-doctor-page">
      <div className="breadcrumb">
        <span className="bc-back" onClick={() => navigate("/beds")}>
          <ArrowBackIosNewIcon /> Beds
        </span>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-title">Add New Bed</div>

          <div className="form-row">
            <div className="form-group">
              <label>Bed Number <span className="req">*</span></label>
              <input
                value={form.bedNumber}
                onChange={(e) => setField("bedNumber", e.target.value)}
                placeholder="e.g. G-101-B1"
                required
              />
            </div>

            <div className="form-group">
              <label>Room Number</label>
              <input
                value={form.roomNumber}
                onChange={(e) => setField("roomNumber", e.target.value)}
                placeholder="e.g. G-101"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ward</label>
              <input value={form.ward} onChange={(e) => setField("ward", e.target.value)} />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setField("type", e.target.value)}>
                <option value="General">General</option>
                <option value="ICU">ICU</option>
                <option value="Private">Private</option>
                <option value="Pediatric">Pediatric</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-row" style={{ justifyContent: "flex-end", marginTop: 24 }}>
            <button type="button" className="btn-secondary" onClick={() => navigate("/beds")}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Bed"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
