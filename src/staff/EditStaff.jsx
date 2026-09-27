import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { getStaffById, updateStaff } from "../api/staff";
import { useToast } from "../context/ToastContext";

const roles = [
  "staff",
  "nurse",
  "supervisor",
  "admin",
  "receptionist",
  "lab technician",
];

export default function EditStaff() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchStaffMember = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getStaffById(id);
        const staffData = response?.data || response;

        setForm({
          name: staffData?.name || "",
          email: staffData?.email || "",
          phone: staffData?.phone || "",
          role: staffData?.role || "staff",
        });
      } catch (err) {
        console.error("Staff fetch error:", err);
        setError(err?.message || "Failed to load staff member");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffMember();
    }
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      showToast("Name, email and phone are required", "warning");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
      };

      await updateStaff(id, payload);

      showToast("Staff member updated successfully", "success");
      navigate("/staff");
    } catch (err) {
      console.error("Update staff error:", err);

      showToast(
        err?.message || "Failed to update staff member",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#475569",
        }}
      >
        Loading staff member...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div
          style={{
            padding: 16,
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/staff")}
          style={{
            border: "none",
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            padding: "10px 18px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to Staff
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => navigate("/staff")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "transparent",
            color: "#475569",
            cursor: "pointer",
            padding: 0,
            fontWeight: 600,
          }}
        >
          <ArrowBackIosNewIcon style={{ fontSize: 16 }} />
          Staff
        </button>

        <h1
          style={{
            margin: "16px 0 6px",
            fontSize: 30,
          }}
        >
          Edit Staff
        </h1>

        <p
          style={{
            margin: 0,
            color: "#64748b",
          }}
        >
          Update staff member information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 24,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setField("name", event.target.value)
              }
              placeholder="Enter full name"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Role
            </label>

            <select
              value={form.role}
              onChange={(event) =>
                setField("role", event.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                outline: "none",
                fontSize: 14,
                background: "#fff",
              }}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setField("email", event.target.value)
              }
              placeholder="Enter email address"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "#334155",
              }}
            >
              Phone
            </label>

            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setField("phone", event.target.value)
              }
              placeholder="Enter phone number"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/staff")}
            disabled={saving}
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              borderRadius: 8,
              padding: "10px 18px",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              border: "none",
              background: "#2563eb",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {saving ? "Updating..." : "Update Staff"}
          </button>
        </div>
      </form>
    </div>
  );
}