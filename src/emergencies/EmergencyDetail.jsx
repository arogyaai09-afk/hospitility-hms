import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { getEmergencies, admitEmergency } from "../api/emergencies";
import { getAvailableBeds } from "../api/beds";
import { getDoctors } from "../api/doctors";
import { useToast } from "../context/ToastContext";

export default function EmergencyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [emergency, setEmergency] = useState(null);
  const [beds, setBeds] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [admitting, setAdmitting] = useState(false);

  const [bedNumber, setBedNumber] = useState("");
  const [doctorId, setDoctorId] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        setLoading(true);
        setError("");

        const [emergencyResponse, bedsResponse, doctorsResponse] =
          await Promise.all([
            getEmergencies(),
            getAvailableBeds(),
            getDoctors(),
          ]);

        const emergencyList =
          emergencyResponse?.data || emergencyResponse || [];

        const availableBeds = bedsResponse?.data || bedsResponse || [];

        const doctorList = doctorsResponse?.data || doctorsResponse || [];

        const emergencyData = Array.isArray(emergencyList)
          ? emergencyList.find((item) => String(item._id) === String(id))
          : null;

        setEmergency(emergencyData || null);

        setBeds(Array.isArray(availableBeds) ? availableBeds : []);

        setDoctors(Array.isArray(doctorList) ? doctorList : []);
      } catch (err) {
        console.error("Emergency detail error:", err);

        setError(err?.message || "Failed to load emergency details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmergencyData();
    }
  }, [id]);

  const handleAdmitToIPD = async (event) => {
    event.preventDefault();

    if (!bedNumber) {
      showToast("Please select a bed", "warning");
      return;
    }

    if (!doctorId) {
      showToast("Please select a doctor", "warning");
      return;
    }

    try {
      setAdmitting(true);

      await admitEmergency(id, bedNumber, doctorId);

      showToast("Emergency patient admitted to IPD successfully", "success");

      navigate("/admissions");
    } catch (err) {
      console.error("Emergency admission error:", err);

      showToast(err?.message || "Failed to admit emergency patient", "error");
    } finally {
      setAdmitting(false);
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
        Loading emergency details...
      </div>
    );
  }

  if (error || !emergency) {
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
          {error || "Emergency case not found"}
        </div>

        <button
          type="button"
          onClick={() => navigate("/emergencies")}
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
          Back to Emergencies
        </button>
      </div>
    );
  }

  const isAlreadyAdmitted =
    emergency.status === "admitted" || emergency.status === "resolved";

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/emergencies")}
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
        Emergencies
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
            alignItems: "flex-start",
            gap: 20,
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
              {emergency.patientName || "Emergency Patient"}
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
              }}
            >
              {emergency.emergencyType || "Emergency Case"}
            </p>
          </div>

          <span
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "capitalize",
            }}
          >
            {emergency.severity || "unknown"}
          </span>
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
            <div style={{ fontSize: 13, color: "#64748b" }}>Patient</div>

            <div
              style={{
                marginTop: 6,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {emergency.patientName || "-"}
            </div>
          </div>

          <div
            style={{
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#64748b" }}>Emergency Type</div>

            <div
              style={{
                marginTop: 6,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {emergency.emergencyType || "-"}
            </div>
          </div>

          <div
            style={{
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#64748b" }}>Severity</div>

            <div
              style={{
                marginTop: 6,
                fontWeight: 600,
                textTransform: "capitalize",
                color: "#0f172a",
              }}
            >
              {emergency.severity || "-"}
            </div>
          </div>

          <div
            style={{
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#64748b" }}>Status</div>

            <div
              style={{
                marginTop: 6,
                fontWeight: 600,
                textTransform: "capitalize",
                color: "#0f172a",
              }}
            >
              {emergency.status || "-"}
            </div>
          </div>

          <div
            style={{
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Assigned Doctor
            </div>

            <div
              style={{
                marginTop: 6,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {emergency.assignedDoctor || "Not assigned"}
            </div>
          </div>

          <div
            style={{
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#64748b" }}>Created</div>

            <div
              style={{
                marginTop: 6,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {emergency.createdAt
                ? new Date(emergency.createdAt).toLocaleDateString()
                : "-"}
            </div>
          </div>
        </div>

        {emergency.description && (
          <div
            style={{
              marginTop: 18,
              padding: 18,
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "#64748b" }}>Description</div>

            <div
              style={{
                marginTop: 6,
                color: "#334155",
                lineHeight: 1.6,
              }}
            >
              {emergency.description}
            </div>
          </div>
        )}

        {!isAlreadyAdmitted && (
          <form
            onSubmit={handleAdmitToIPD}
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: 22,
                color: "#0f172a",
              }}
            >
              Admit to IPD
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#64748b",
                fontSize: 14,
              }}
            >
              Select an available bed and doctor for IPD admission.
            </p>

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
                  Available Bed
                </label>

                <select
                  value={bedNumber}
                  onChange={(event) => setBedNumber(event.target.value)}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    background: "#fff",
                    fontSize: 14,
                  }}
                >
                  <option value="">Select bed</option>

                  {beds.map((bed) => {
                    const value =
                      bed.bedNumber || bed.number || bed._id || bed.id;

                    return (
                      <option key={bed._id || bed.id || value} value={value}>
                        {bed.bedNumber || bed.number || `Bed ${value}`}
                      </option>
                    );
                  })}
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
                  Doctor
                </label>

                <select
                  value={doctorId}
                  onChange={(event) => setDoctorId(event.target.value)}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    background: "#fff",
                    fontSize: 14,
                  }}
                >
                  <option value="">Select doctor</option>

                  {doctors.map((doctor) => (
                    <option
                      key={doctor._id || doctor.id}
                      value={doctor._id || doctor.id}
                    >
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 22,
              }}
            >
              <button
                type="submit"
                disabled={admitting}
                style={{
                  border: "none",
                  borderRadius: 8,
                  background: "#2563eb",
                  color: "#fff",
                  padding: "11px 20px",
                  cursor: admitting ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {admitting ? "Admitting..." : "Admit to IPD"}
              </button>
            </div>
          </form>
        )}

        {isAlreadyAdmitted && (
          <div
            style={{
              marginTop: 28,
              padding: 16,
              background: "#ecfdf5",
              color: "#047857",
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            This emergency case is no longer pending admission.
          </div>
        )}
      </div>
    </div>
  );
}
