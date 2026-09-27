import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { getStaffById } from "../api/staff";

export default function StaffDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStaffMember = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getStaffById(id);
        const staffData = response?.data || response;

        setStaff(staffData);
      } catch (err) {
        console.error("Staff detail error:", err);
        setError(err?.message || "Failed to load staff member");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffMember();
    }
  }, [id]);

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

  if (error || !staff) {
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
          {error || "Staff member not found"}
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

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 28,
          marginTop: 20,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 30,
                color: "#0f172a",
              }}
            >
              {staff.name || "Unnamed Staff"}
            </h1>

            <span
              style={{
                display: "inline-block",
                marginTop: 10,
                background: "#dbeafe",
                color: "#1d4ed8",
                borderRadius: 999,
                padding: "5px 12px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {staff.role || "staff"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/staff/${id}/edit`)}
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
            Edit Staff
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
          }}
        >
          <div
            style={{
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              Email
            </div>

            <div
              style={{
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {staff.email || "-"}
            </div>
          </div>

          <div
            style={{
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              Phone
            </div>

            <div
              style={{
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {staff.phone || "-"}
            </div>
          </div>

          <div
            style={{
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              Role
            </div>

            <div
              style={{
                fontWeight: 600,
                color: "#0f172a",
                textTransform: "capitalize",
              }}
            >
              {staff.role || "-"}
            </div>
          </div>

          <div
            style={{
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              Tenant
            </div>

            <div
              style={{
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {staff.tenantId || "Current tenant"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}