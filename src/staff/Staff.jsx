// staff.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStaff, deleteStaff } from "../api/staff";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
export default function StaffPage() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await getStaff();
      const list = response?.data || response || [];
      setStaff(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Failed to load staff");
      console.error("Staff fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      await deleteStaff(staffToDelete);

      setStaff((currentStaff) =>
        currentStaff.filter(
          (person) => String(person._id || person.id) !== String(staffToDelete),
        ),
      );

      showToast("Staff member deleted successfully", "success");
    } catch (error) {
      console.error("Delete staff error:", error);

      showToast(error?.message || "Failed to delete staff member", "error");
    } finally {
      setStaffToDelete(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 32 }}>Staff Directory</h1>
          <p style={{ margin: "8px 0 0", color: "#64748b" }}>
            Team members, nurses, and operational staff for clinical workflows.
          </p>
        </div>
        <button
          onClick={() => navigate("/staff/new")}
          style={{
            border: "none",
            borderRadius: 10,
            background: "#2563eb",
            color: "#fff",
            padding: "10px 18px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add Staff
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "#475569" }}>
          Loading staff...
        </div>
      ) : staff.length === 0 ? (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            background: "#f8fafc",
            borderRadius: 12,
            color: "#475569",
          }}
        >
          No staff records found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {staff.map((person) => (
            <div
              key={person._id || person.id || person.email || person.name}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 18,
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 20 }}>
                  {person.name || "Unnamed staff"}
                </h3>
                <span
                  style={{
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                >
                  {person.role || "staff"}
                </span>
              </div>

              <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.8 }}>
                <div>
                  <strong>Email:</strong> {person.email || "-"}
                </div>
                <div>
                  <strong>Phone:</strong> {person.phone || "-"}
                </div>
                <div>
                  <strong>Tenant:</strong> {person.tenantId || "Current tenant"}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/staff/${person._id || person.id}`)}
                  style={{
                    flex: 1,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/staff/${person._id || person.id}/edit`)
                  }
                  style={{
                    flex: 1,
                    border: "1px solid #bfdbfe",
                    background: "#eff6ff",
                    color: "#2563eb",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStaffToDelete(person._id || person.id);
                    setShowDeleteModal(true);
                  }}
                  style={{
                    flex: 1,
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    color: "#dc2626",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Staff Member?"
        message="Are you sure you want to delete this staff member? This action cannot be undone."
        confirmText="Delete Staff"
        cancelText="Cancel"
        onConfirm={handleDeleteStaff}
        onCancel={() => {
          setStaffToDelete(null);
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
}
