// labReports/LabReports.jsx
import { useEffect, useMemo, useState } from "react";
import ScienceIcon from "@mui/icons-material/Science";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EventNoteIcon from "@mui/icons-material/EventNote";
import BiotechIcon from "@mui/icons-material/Biotech";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RefreshIcon from "@mui/icons-material/Refresh";

import { getPatients, getPatientById } from "../api/patients";
import axiosInstance, { API_BASE_URL } from "../api/axiosInstance";
import { getPatientLabOrders } from "../api/labOrders";
import { createLabReport, getVisitReports } from "../api/labReports";
import { getVisitById } from "../api/visits";
import { useToast } from "../context/ToastContext";

import "./labReports.scss";

const getId = (value) =>
  typeof value === "object" && value !== null
    ? value._id || value.id
    : value;

const getPatientCode = (patient) =>
  patient?.patientCode || patient?.patientId || patient?._id || "—";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

const getProfileImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${API_ORIGIN}${
    image.startsWith("/") ? image : `/${image}`
  }`;
};

const getPatientName = (patient) =>
  patient?.name ||
  [patient?.firstName, patient?.lastName].filter(Boolean).join(" ") ||
  "Unknown Patient";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateAge = (dob) => {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const month = now.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : "—";
};

function PatientAvatar({ name = "", image, size = 38 }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";

    const loadImage = async () => {
      if (!image) {
        setImageUrl("");
        return;
      }

      try {
        const blob = await axiosInstance.getBlob(image);
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (error) {
        console.error("Failed to load patient image:", error);
        setImageUrl("");
      }
    };

    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [image]);

  return (
    <div
      className="patient-avatar-image-wrapper"
      style={{
        width: size,
        height: size,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="patient-avatar-image"
        />
      ) : (
        <PersonOutlineIcon fontSize="small" />
      )}
    </div>
  );
}

export default function LabReports() {
  const { showToast } = useToast();

  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patient, setPatient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [visitMeta, setVisitMeta] = useState({});
  const [reports, setReports] = useState({});
  const [resultDrafts, setResultDrafts] = useState({});
  const [attachmentDrafts, setAttachmentDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        const response = await getPatients();
        if (response?.status === "success") {
          setPatients(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to load patients:", error);
        showToast?.("Failed to load patients.", "error");
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, [showToast]);

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) return patients.slice(0, 12);

    return patients
      .filter((item) => {
        const name = getPatientName(item).toLowerCase();
        const code = String(getPatientCode(item)).toLowerCase();
        const phone = String(item?.phone || "").toLowerCase();
        return name.includes(query) || code.includes(query) || phone.includes(query);
      })
      .slice(0, 12);
  }, [patients, patientSearch]);

  const loadPatientOrders = async (patientId) => {
    if (!patientId) return;

    try {
      setLoading(true);
      const [patientResponse, ordersResponse] = await Promise.all([
        getPatientById(patientId),
        getPatientLabOrders(patientId),
      ]);

      const loadedPatient =
        patientResponse?.status === "success" ? patientResponse.data : null;
      const loadedOrders =
        ordersResponse?.status === "success" && Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : [];

      setPatient(loadedPatient);
      setOrders(loadedOrders);

      const visitIds = [
        ...new Set(
          loadedOrders
            .map((order) => getId(order.visitId))
            .filter(Boolean)
            .map(String)
        ),
      ];

      const visitEntries = await Promise.all(
        visitIds.map(async (visitId) => {
          try {
            const response = await getVisitById(visitId);
            return [visitId, response?.status === "success" ? response.data : null];
          } catch {
            return [visitId, null];
          }
        })
      );
      setVisitMeta(Object.fromEntries(visitEntries));

      const reportEntries = await Promise.all(
        visitIds.map(async (visitId) => {
          try {
            const response = await getVisitReports(visitId);
            const list =
              response?.status === "success" && Array.isArray(response.data)
                ? response.data
                : [];
            return [visitId, list];
          } catch {
            return [visitId, []];
          }
        })
      );

      const reportMap = {};
      reportEntries.forEach(([visitId, list]) => {
        list.forEach((report) => {
          const labOrderId = getId(report.labOrderId);
          if (labOrderId) reportMap[String(labOrderId)] = report;
        });
      });
      setReports(reportMap);

      const drafts = {};
      const attachments = {};
      loadedOrders.forEach((order) => {
        const orderId = getId(order);
        const existing = reportMap[String(orderId)];
        drafts[String(orderId)] = existing?.resultText || "";
        attachments[String(orderId)] = existing?.attachmentUrl || "";
      });
      setResultDrafts(drafts);
      setAttachmentDrafts(attachments);
    } catch (error) {
      console.error("Failed to load lab orders:", error);
      setOrders([]);
      showToast?.("Failed to load lab orders.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patientId) => {
    setSelectedPatientId(patientId);
    setPatientSearch("");
    await loadPatientOrders(patientId);
  };

  const handleSaveReport = async (order) => {
    const orderId = getId(order);
    const resultText = (resultDrafts[String(orderId)] || "").trim();

    if (!orderId || !resultText) {
      showToast?.("Enter the laboratory result first.", "error");
      return;
    }

    try {
      setSavingOrderId(String(orderId));

      await createLabReport(orderId, {
        resultText,
        ...(attachmentDrafts[String(orderId)] || "").trim()
          ? { attachmentUrl: attachmentDrafts[String(orderId)].trim() }
          : {},
      });

      showToast?.("Lab report saved successfully.", "success");
      await loadPatientOrders(selectedPatientId);
    } catch (error) {
      console.error("Failed to save lab report:", error);
      showToast?.(
        error?.response?.data?.message || "Failed to save lab report.",
        "error"
      );
    } finally {
      setSavingOrderId("");
    }
  };

  const groupedVisits = useMemo(() => {
    const groups = new Map();

    orders.forEach((order) => {
      const visitId = String(getId(order.visitId) || "unknown");
      if (!groups.has(visitId)) groups.set(visitId, []);
      groups.get(visitId).push(order);
    });

    return [...groups.entries()]
      .map(([visitId, visitOrders]) => ({
        visitId,
        visit: visitMeta[visitId],
        orders: visitOrders,
      }))
      .sort((a, b) => {
        const aDate = new Date(a.orders[0]?.orderedAt || a.orders[0]?.createdAt || 0).getTime();
        const bDate = new Date(b.orders[0]?.orderedAt || b.orders[0]?.createdAt || 0).getTime();
        return bDate - aDate;
      });
  }, [orders, visitMeta]);

  const getSampleId = (order) => {
    // Temporary frontend fallback until backend exposes sampleId.
    return order?.sampleId || getPatientCode(patient);
  };

  return (
    <div className="lab-reports-page">
      <div className="lab-reports-page-header">
        <div>
          <div className="lab-reports-title-row">
            <div className="lab-reports-title-icon">
              <ScienceIcon />
            </div>
            <div>
              <h1>Lab Reports</h1>
              <p>Process ordered laboratory tests and record their results.</p>
            </div>
          </div>
        </div>

        {selectedPatientId && (
          <button
            type="button"
            className="lab-secondary-btn"
            onClick={() => loadPatientOrders(selectedPatientId)}
            disabled={loading}
          >
            <RefreshIcon fontSize="small" />
            Refresh
          </button>
        )}
      </div>

      <div className="lab-patient-picker card">
        <div className="lab-section-heading">
          <div>
            <h2>Select Patient</h2>
            <p>Find a patient to view their pending and completed lab orders.</p>
          </div>
        </div>

        <div className="lab-search-wrap">
          <SearchIcon fontSize="small" />
          <input
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder="Search by Patient ID, name or phone..."
          />
        </div>

        {!selectedPatientId && (
          <div className="patient-search-results">
            {loadingPatients ? (
              <div className="lab-empty">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="lab-empty">No patients found.</div>
            ) : (
              filteredPatients.map((item) => {
                const id = getId(item);
                return (
                  <button
                    type="button"
                    className="patient-result-row"
                    key={id}
                    onClick={() => handleSelectPatient(id)}
                  >
                    <span className="patient-result-avatar">
  <PatientAvatar
    name={getPatientName(item)}
    image={getProfileImageUrl(item?.profileImage)}
    size={36}
  />
</span>
                    <span className="patient-result-main">
                      <strong>{getPatientName(item)}</strong>
                      <small>{getPatientCode(item)} • {item?.phone || "No phone"}</small>
                    </span>
                    <span className="patient-result-arrow">View</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedPatientId && patient && (
        <>
          <div className="patient-summary-card card">
            <div className="patient-summary-main">
              <div className="patient-large-avatar">
  <PatientAvatar
    name={getPatientName(patient)}
    image={getProfileImageUrl(patient?.profileImage)}
    size={56}
  />
</div>
              <div>
                <h2>{getPatientName(patient)}</h2>
                <div className="patient-meta-line">
                  <span>Patient ID: <strong>{getPatientCode(patient)}</strong></span>
                  <span>Age: <strong>{calculateAge(patient.dateOfBirth)}</strong></span>
                  <span>Gender: <strong>{patient.gender || "—"}</strong></span>
                  <span>Phone: <strong>{patient.phone || "—"}</strong></span>
                  <span>Blood Group: <strong>{patient.bloodGroup || "—"}</strong></span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="lab-link-btn"
              onClick={() => {
                setSelectedPatientId("");
                setPatient(null);
                setOrders([]);
                setReports({});
              }}
            >
              Change Patient
            </button>
          </div>

          {loading ? (
            <div className="lab-empty card">Loading lab orders...</div>
          ) : groupedVisits.length === 0 ? (
            <div className="lab-empty card">
              No lab orders found for this patient.
            </div>
          ) : (
            <div className="lab-visit-list">
              {groupedVisits.map(({ visitId, visit, orders: visitOrders }) => (
                <section className="lab-visit-card card" key={visitId}>
                  <div className="lab-visit-header">
                    <div>
                      <div className="lab-visit-title">
                        <EventNoteIcon fontSize="small" />
                        <h2>Visit {visit?.visitCode || visitId}</h2>
                      </div>
                      <p>
                        Ordered {formatDate(visitOrders[0]?.orderedAt || visitOrders[0]?.createdAt)}
                        {visit?.doctorId ? ` • Doctor: ${typeof visit.doctorId === "object" ? visit.doctorId.name || visit.doctorId._id : visit.doctorId}` : ""}
                      </p>
                    </div>
                    <div className="sample-id-badge">
                      <span>Sample ID</span>
                      <strong>{getSampleId(visitOrders[0])}</strong>
                    </div>
                  </div>

                  <div className="ordered-tests-strip">
                    <div className="ordered-tests-label">
                      <BiotechIcon fontSize="small" />
                      Tests in this visit
                    </div>
                    <div className="ordered-test-chips">
                      {visitOrders.map((order) => (
                        <span key={getId(order)} className="ordered-test-chip">
                          {order.testName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lab-test-list">
                    {visitOrders.map((order) => {
                      const orderId = String(getId(order));
                      const existingReport = reports[orderId];
                      const completed = Boolean(existingReport) || order.status === "completed";

                      return (
                        <article className="lab-test-card" key={orderId}>
                          <div className="lab-test-card-header">
                            <div>
                              <h3>{order.testName}</h3>
                              {order.instructions && <p>{order.instructions}</p>}
                            </div>
                            <span className={`lab-status ${completed ? "completed" : order.status}`}>
                              {completed ? "Completed" : order.status || "ordered"}
                            </span>
                          </div>

                          {completed ? (
                            <div className="completed-result">
                              <div className="completed-result-heading">
                                <CheckCircleOutlineIcon fontSize="small" />
                                Lab Result
                              </div>
                              <div className="result-text">
                                {existingReport?.resultText || "Report completed. Result is available in the visit history."}
                              </div>
                              {existingReport?.attachmentUrl && (
                                <div className="attachment-line">
                                  Attachment: {existingReport.attachmentUrl}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="lab-result-form">
                              <div className="result-form-label">
                                <PendingActionsIcon fontSize="small" />
                                Enter Test Result
                              </div>
                              <textarea
                                value={resultDrafts[orderId] || ""}
                                onChange={(e) =>
                                  setResultDrafts((prev) => ({
                                    ...prev,
                                    [orderId]: e.target.value,
                                  }))
                                }
                                placeholder={`Enter ${order.testName} result...`}
                                rows={5}
                                disabled={savingOrderId === orderId}
                              />
                              <input
                                value={attachmentDrafts[orderId] || ""}
                                onChange={(e) =>
                                  setAttachmentDrafts((prev) => ({
                                    ...prev,
                                    [orderId]: e.target.value,
                                  }))
                                }
                                placeholder="Optional report / attachment URL"
                                disabled={savingOrderId === orderId}
                              />
                              <div className="result-actions">
                                <button
                                  type="button"
                                  className="lab-primary-btn"
                                  onClick={() => handleSaveReport(order)}
                                  disabled={savingOrderId === orderId}
                                >
                                  <BiotechIcon fontSize="small" />
                                  {savingOrderId === orderId ? "Saving..." : "Save Lab Report"}
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
