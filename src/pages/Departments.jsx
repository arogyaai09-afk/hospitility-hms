import { useEffect, useState } from "react";
import { getDepartments } from "../api/departments";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await getDepartments();
      const list = response?.data || response || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Failed to load departments");
      console.error("Departments fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32 }}>Departments</h1>
          <p style={{ margin: "8px 0 0", color: "#64748b" }}>
            Clinical departments and operational units for the hospital.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee2e2", color: "#991b1b", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "#475569" }}>Loading departments...</div>
      ) : departments.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderRadius: 12, color: "#475569" }}>
          No departments found.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {departments.map((dept) => (
            <div
              key={dept._id || dept.id || dept.code}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 18,
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 20 }}>{dept.name}</h3>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: dept.isActive === false ? "#fee2e2" : "#dcfce7",
                    color: dept.isActive === false ? "#991b1b" : "#166534",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {dept.isActive === false ? "Inactive" : "Active"}
                </span>
              </div>

              <div style={{ color: "#475569", fontSize: 14 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Code:</strong> {dept.code || "-"}
                </div>
                <div>
                  <strong>Tenant:</strong> {dept.tenantId || "Current tenant"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
