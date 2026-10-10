// consultations/consultation.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SaveIcon from "@mui/icons-material/Save";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import axiosInstance from "../api/axiosInstance";

import { getPatientById, getPatientSummary } from "../api/patients";
import {
  getVisitById,
  getPatientVisits,
  updateVisitStatus,
} from "../api/visits";

import {
  createConsultation,
  getConsultationByVisit,
} from "../api/consultations";

import {
  createPrescription,
  getPrescriptionsByVisit,
  updatePrescription,
} from "../api/prescriptions";

import { createLabOrder, getPatientLabOrders } from "../api/labOrders";

import { getVisitReports } from "../api/labReports";

import { createProcedure, getProceduresByVisit } from "../api/procedures";

import "./consultation.scss";
import { useToast } from "../context/ToastContext";

function SecureImage({ image, alt, size = 52 }) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";

    const loadImage = async () => {
      if (!image) {
        setImageUrl("");
        return;
      }

      try {
        let endpoint = image;

        if (image.startsWith("http://") || image.startsWith("https://")) {
          const url = new URL(image);
          endpoint = url.pathname.replace(/^\/api\/v1/, "");

          if (url.search) {
            endpoint += url.search;
          }
        }

        const blob = await axiosInstance.getBlob(endpoint);

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

  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt={alt}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: "50%",
        display: "block",
      }}
    />
  );
}

function PrescriptionDropdown({
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue) => {
    onChange({
      target: {
        name,
        value: selectedValue,
      },
    });

    setOpen(false);
  };

  return (
    <div
      className={`prescription-custom-select ${
        open ? "is-open" : ""
      } ${disabled ? "is-disabled" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="prescription-select-trigger"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
      >
        <span
          className={
            selectedOption
              ? "prescription-select-value"
              : "prescription-select-placeholder"
          }
        >
          {selectedOption?.label || placeholder}
        </span>

        <span className="prescription-select-arrow">{open ? "⌃" : "⌄"}</span>
      </button>

      {open && (
        <div className="prescription-select-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`prescription-select-option ${
                option.value === value ? "selected" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <span>{option.label}</span>

              {option.value === value && (
                <span className="prescription-option-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Consultation() {
  const navigate = useNavigate();
  const { patientId, visitId } = useParams();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [visit, setVisit] = useState(null);
  const [patientSummary, setPatientSummary] = useState(null);
  const [consultationDoctor, setConsultationDoctor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [labOrders, setLabOrders] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [selectedLabReportId, setSelectedLabReportId] = useState("");

  const [procedures, setProcedures] = useState([]);
  const [recentProcedureHistory, setRecentProcedureHistory] = useState([]);

  const [procedureForm, setProcedureForm] = useState({
    procedureName: "",
    status: "planned",
    procedureTiming: "later",
    performedAt: "",
    indication: "",
    notes: "",
    outcome: "",
  });

  const [labForm, setLabForm] = useState({
    testName: "",
    instructions: "",
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicineName: "",
    dosage: "",
    frequency: "",
    instructions: "",
    duration: "",
  });

  const [form, setForm] = useState({
    chiefComplaint: "",
    symptoms: "",
    examination: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      spo2: "",
      temperature: "",
      respiratoryRate: "",
      weight: "",
    },
    assessment: "",
    diagnosis: "",
    treatmentPlan: "",
    followUpDate: "",
    clinicalNotes: "",
    status: "draft",
  });

  useEffect(() => {
    const loadConsultationData = async () => {
      if (!patientId || !visitId) return;

      try {
        setLoading(true);

        const [
          patientResponse,
          visitResponse,
          summaryResponse,
          consultationResponse,
          prescriptionsResponse,
          labOrdersResponse,
          patientVisitsResponse,
          proceduresResponse,
        ] = await Promise.all([
          getPatientById(patientId),
          getVisitById(visitId),
          getPatientSummary(patientId),
          getConsultationByVisit(visitId),
          getPrescriptionsByVisit(visitId),
          getPatientLabOrders(patientId),
          getPatientVisits(patientId),
          getProceduresByVisit(visitId),
        ]);

        if (patientResponse?.status === "success" && patientResponse?.data) {
          setPatient(patientResponse.data);
        }

        if (visitResponse?.status === "success" && visitResponse?.data) {
          const currentVisit = visitResponse.data;

          setVisit(currentVisit);
        }

        if (summaryResponse?.status === "success" && summaryResponse?.data) {
          setPatientSummary(summaryResponse.data);
        }

        if (
          prescriptionsResponse?.status === "success" &&
          Array.isArray(prescriptionsResponse.data)
        ) {
          const prescriptionRecords = prescriptionsResponse.data;

          if (prescriptionRecords.length > 0) {
            // Latest prescription ko current prescription maanenge
            const latestPrescription = [...prescriptionRecords].sort(
              (a, b) =>
                new Date(b.prescribedAt || b.createdAt || 0) -
                new Date(a.prescribedAt || a.createdAt || 0),
            )[0];

            setPrescriptionId(
              latestPrescription._id || latestPrescription.id || null,
            );

            setPrescriptions(
              Array.isArray(latestPrescription.items)
                ? latestPrescription.items
                : [],
            );
          } else {
            setPrescriptionId(null);
            setPrescriptions([]);
          }
        }

        let allPatientLabOrders = [];

        if (
          labOrdersResponse?.status === "success" &&
          Array.isArray(labOrdersResponse.data)
        ) {
          allPatientLabOrders = labOrdersResponse.data;

          const currentVisitLabOrders = allPatientLabOrders.filter((order) => {
            const orderVisitId =
              typeof order.visitId === "object"
                ? order.visitId?._id || order.visitId?.id
                : order.visitId;

            return String(orderVisitId) === String(visitId);
          });

          setLabOrders(currentVisitLabOrders);
        } else {
          setLabOrders([]);
        }

        if (
          proceduresResponse?.status === "success" &&
          Array.isArray(proceduresResponse.data)
        ) {
          const sortedProcedures = [...proceduresResponse.data].sort(
            (a, b) =>
              new Date(b.performedAt || b.createdAt || 0).getTime() -
              new Date(a.performedAt || a.createdAt || 0).getTime(),
          );

          setProcedures(sortedProcedures);
        } else {
          setProcedures([]);
        }

        const patientVisits =
          patientVisitsResponse?.status === "success" &&
          Array.isArray(patientVisitsResponse.data)
            ? patientVisitsResponse.data
            : [];

        const sortedPatientVisits = [...patientVisits].sort(
          (a, b) =>
            new Date(
              b.visitDate || b.date || b.createdAt || b.scheduledAt || 0,
            ).getTime() -
            new Date(
              a.visitDate || a.date || a.createdAt || a.scheduledAt || 0,
            ).getTime(),
        );

        const previousFiveVisits = sortedPatientVisits
          .filter((item) => String(item?._id || item?.id) !== String(visitId))
          .slice(0, 5);

        const recentProcedureResponses = await Promise.all(
          previousFiveVisits.map(async (previousVisit) => {
            const previousVisitId = previousVisit?._id || previousVisit?.id;

            if (!previousVisitId) return [];

            try {
              const response = await getProceduresByVisit(previousVisitId);

              if (
                response?.status === "success" &&
                Array.isArray(response.data)
              ) {
                return response.data.map((procedure) => ({
                  ...procedure,
                  sourceVisitId: previousVisitId,
                  sourceVisitDate:
                    previousVisit.visitDate ||
                    previousVisit.date ||
                    previousVisit.createdAt ||
                    previousVisit.scheduledAt,
                }));
              }

              return [];
            } catch (error) {
              console.warn(
                `Failed to fetch procedures for visit ${previousVisitId}`,
                error,
              );

              return [];
            }
          }),
        );

        const recentProcedures = recentProcedureResponses
          .flat()
          .sort(
            (a, b) =>
              new Date(
                b.performedAt || b.createdAt || b.sourceVisitDate || 0,
              ).getTime() -
              new Date(
                a.performedAt || a.createdAt || a.sourceVisitDate || 0,
              ).getTime(),
          );

        setRecentProcedureHistory(recentProcedures);

        const visitIds = patientVisits
          .map((item) => item?._id || item?.id)
          .filter(Boolean);

        const reportResponses = await Promise.all(
          visitIds.map(async (id) => {
            try {
              const response = await getVisitReports(id);

              if (
                response?.status === "success" &&
                Array.isArray(response.data)
              ) {
                return response.data.map((report) => ({
                  ...report,
                  sourceVisitId: id,
                }));
              }

              return [];
            } catch (error) {
              console.warn(`Failed to fetch reports for visit ${id}`, error);
              return [];
            }
          }),
        );

        const allPatientReports = reportResponses
          .flat()
          .map((report) => {
            const reportLabOrderId =
              typeof report.labOrderId === "object"
                ? report.labOrderId?._id || report.labOrderId?.id
                : report.labOrderId;

            const matchedOrder = allPatientLabOrders.find(
              (order) =>
                String(order?._id || order?.id) === String(reportLabOrderId),
            );

            return {
              ...report,
              testName: matchedOrder?.testName || "Lab Test",
            };
          })
          .sort(
            (a, b) =>
              new Date(b.reportedAt || b.createdAt || 0).getTime() -
              new Date(a.reportedAt || a.createdAt || 0).getTime(),
          );

        setLabReports(allPatientReports);

        setSelectedLabReportId(
          allPatientReports.length > 0
            ? allPatientReports[0]?._id || allPatientReports[0]?.id
            : "",
        );

        if (consultationResponse?.status === "success") {
          const consultation = consultationResponse.data;

          if (consultation) {
            setForm({
              chiefComplaint: consultation.chiefComplaint || "",
              symptoms: consultation.symptoms || "",
              examination: consultation.examination || "",
              vitals: {
                bloodPressure: consultation.vitals?.bloodPressure || "",
                heartRate: consultation.vitals?.heartRate || "",
                spo2: consultation.vitals?.spo2 || "",
                temperature: consultation.vitals?.temperature || "",
                respiratoryRate: consultation.vitals?.respiratoryRate || "",
                weight: consultation.vitals?.weight || "",
              },
              assessment: consultation.assessment || "",
              diagnosis: consultation.diagnosis || "",
              treatmentPlan: consultation.treatmentPlan || "",
              followUpDate: consultation.followUpDate
                ? consultation.followUpDate.slice(0, 10)
                : "",
              clinicalNotes: consultation.clinicalNotes || "",
              status: consultation.status || "draft",
            });
          } else {
            setConsultationDoctor(null);
          }
        }
      } catch (error) {
        console.error("Consultation loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConsultationData();
  }, [patientId, visitId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVitalChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [name]: value,
      },
    }));
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;

    setPrescriptionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLabFormChange = (e) => {
    const { name, value } = e.target;

    setLabForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPrescription = () => {
    if (
      !prescriptionForm.medicineName.trim() ||
      !prescriptionForm.dosage.trim() ||
      !prescriptionForm.frequency.trim()
    ) {
      showToast("Medicine name, dosage and frequency are required.", "error");
      return;
    }

    setPrescriptions((prev) => [
      ...prev,
      {
        medicineName: prescriptionForm.medicineName.trim(),
        dosage: prescriptionForm.dosage.trim(),
        frequency: prescriptionForm.frequency.trim(),
        instructions: prescriptionForm.instructions.trim(),
        duration: prescriptionForm.duration.trim(),
        status: "active",
      },
    ]);

    setPrescriptionForm({
      medicineName: "",
      dosage: "",
      frequency: "",
      instructions: "",
      duration: "",
    });
  };

  const handleAddLabOrder = async () => {
    if (!labForm.testName.trim()) {
      showToast("Test name is required.", "error");
      return;
    }

    if (!visitId) {
      showToast("Visit ID is missing.", "error");
      return;
    }

    try {
      const response = await createLabOrder(visitId, {
        testName: labForm.testName.trim(),
        instructions: labForm.instructions.trim(),
      });

      if (response?.status === "success" && response?.data) {
        setLabOrders((prev) => [...prev, response.data]);

        setLabForm({
          testName: "",
          instructions: "",
        });

        showToast("Investigation advised successfully.", "success");
      }
    } catch (error) {
      console.error("Create lab order error:", error);

      showToast(
        error?.message || error?.error || "Failed to order lab test.",
        "error",
      );
    }
  };

  const handleProcedureFormChange = (e) => {
    const { name, value } = e.target;

    setProcedureForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProcedure = async () => {
    if (!procedureForm.procedureName.trim()) {
      showToast("Procedure name is required.", "error");
      return;
    }

    if (!visitId) {
      showToast("Visit ID is missing.", "error");
      return;
    }

    try {
      const payload = {
        procedureName: procedureForm.procedureName.trim(),
        status: procedureForm.status,
        indication: procedureForm.indication.trim(),
        notes: procedureForm.notes.trim(),
        outcome: procedureForm.outcome.trim(),
      };

      if (procedureForm.performedAt) {
        payload.performedAt = procedureForm.performedAt;
      }

      // 1. Save procedure
      const response = await createProcedure(visitId, payload);

      if (response?.status !== "success" || !response?.data) {
        throw new Error("Failed to save procedure.");
      }

      setProcedures((prev) =>
        [response.data, ...prev].sort(
          (a, b) =>
            new Date(b.performedAt || b.createdAt || 0).getTime() -
            new Date(a.performedAt || a.createdAt || 0).getTime(),
        ),
      );

      // 2. Planned + Today = send to Lab / OT
      if (
        procedureForm.status === "planned" &&
        procedureForm.procedureTiming === "now"
      ) {
        const labResponse = await createLabOrder(visitId, {
          testName: procedureForm.procedureName.trim(),
          instructions: procedureForm.notes.trim(),
        });

        if (labResponse?.status !== "success" || !labResponse?.data) {
          throw new Error(
            "Procedure saved, but Lab/OT order could not be created.",
          );
        }

        setLabOrders((prev) => [...prev, labResponse.data]);

        showToast(
          "Procedure saved and sent to Lab / OT successfully.",
          "success",
        );
      }

      // 3. Planned + Next Appointment
      else if (
        procedureForm.status === "planned" &&
        procedureForm.procedureTiming === "later"
      ) {
        showToast("Procedure planned for next appointment.", "success");
      }

      // 4. Completed
      else if (procedureForm.status === "completed") {
        showToast("Procedure marked as completed successfully.", "success");
      }

      // 5. Cancelled
      else if (procedureForm.status === "cancelled") {
        showToast("Procedure cancelled successfully.", "success");
      }

      // Reset form
      setProcedureForm({
        procedureName: "",
        status: "planned",
        procedureTiming: "later",
        performedAt: "",
        indication: "",
        notes: "",
        outcome: "",
      });
    } catch (error) {
      console.error("Create procedure error:", error);

      showToast(
        error?.message || error?.error || "Failed to save procedure.",
        "error",
      );
    }
  };

  const handleRemovePrescription = (index) => {
    setPrescriptions((prev) =>
      prev.filter((_, prescriptionIndex) => prescriptionIndex !== index),
    );
  };

  const handleSave = async (status = "draft") => {
    if (!visitId) {
      showToast("Visit ID is missing.", "error");
      return;
    }

    // Completed consultations are read-only.
    if (form.status === "completed" || visit?.status === "completed") {
      if (visit?.status === "registered" || visit?.status === "cancelled") {
        showToast(
          visit?.status === "registered"
            ? "Please check-in the patient before starting consultation."
            : "Cancelled visit cannot be consulted.",
          "error",
        );
        return;
      }
      showToast("This consultation is already completed.", "error");
      return;
    }

    try {
      setSaving(true);

      const visitDoctorId =
        typeof visit?.doctorId === "object"
          ? visit.doctorId?._id || visit.doctorId?.id
          : visit?.doctorId;

      const doctorId =
        visitDoctorId ||
        (typeof consultationDoctor === "object"
          ? consultationDoctor?._id || consultationDoctor?.id
          : consultationDoctor);

      // Backend requires doctorId for a consultation. Normally it is already
      // stored on the visit; send it explicitly when available.
      if (!doctorId) {
        showToast(
          "Doctor is not assigned to this visit. Please assign a doctor before saving the consultation.",
          "error",
        );
        return;
      }

      const payload = {
        doctorId,
        chiefComplaint: form.chiefComplaint.trim(),
        symptoms: form.symptoms.trim(),
        examination: form.examination.trim(),
        vitals: form.vitals,
        assessment: form.assessment.trim(),
        diagnosis: form.diagnosis.trim(),
        treatmentPlan: form.treatmentPlan.trim(),
        followUpDate: form.followUpDate || null,
        clinicalNotes: form.clinicalNotes.trim(),
        status,
      };

      // POST is the backend's save/upsert endpoint for a visit consultation.
      const consultationResponse = await createConsultation(visitId, payload);

      if (
        consultationResponse?.status === "success" &&
        consultationResponse?.data
      ) {
        setConsultationDoctor(consultationResponse.data.doctorId || doctorId);
      }

      if (prescriptionId) {
        // Existing prescription ko update karo
        await updatePrescription(prescriptionId, {
          items: prescriptions,
          status: "active",
        });
      } else if (prescriptions.length > 0) {
        // First time prescription create karo
        const prescriptionResponse = await createPrescription(visitId, {
          doctorId,
          items: prescriptions,
        });

        if (
          prescriptionResponse?.status === "success" &&
          prescriptionResponse?.data
        ) {
          setPrescriptionId(
            prescriptionResponse.data._id ||
              prescriptionResponse.data.id ||
              null,
          );
        }
      }

      // Complete consultation only after the consultation
      // has been saved successfully.
      if (status === "completed") {
        const latestVisitResponse = await getVisitById(visitId);

        if (
          latestVisitResponse?.status !== "success" ||
          !latestVisitResponse?.data
        ) {
          throw new Error("Failed to fetch current visit status.");
        }

        let currentVisit = latestVisitResponse.data;

        // If somehow the visit is still checked-in,
        // move it into consultation first.
        if (currentVisit.status === "checked_in") {
          const inConsultationResponse = await updateVisitStatus(
            visitId,
            "in_consultation",
          );

          if (
            inConsultationResponse?.status !== "success" ||
            !inConsultationResponse?.data
          ) {
            throw new Error("Failed to start consultation.");
          }

          currentVisit = inConsultationResponse.data;
        }

        // Backend allows in_consultation -> completed.
        if (currentVisit.status === "in_consultation") {
          const completedResponse = await updateVisitStatus(
            visitId,
            "completed",
          );

          if (
            completedResponse?.status !== "success" ||
            !completedResponse?.data
          ) {
            throw new Error("Failed to complete visit.");
          }

          currentVisit = completedResponse.data;
        }

        /*
         * Completion API kabhi-kabhi doctorId ko populated doctor object
         * ki jagah sirf ID/string ke form me return karti hai.
         * Initial visit me populated doctor object already available hai,
         * isliye usko preserve kar rahe hain.
         */
        if (
          typeof currentVisit?.doctorId !== "object" &&
          typeof visit?.doctorId === "object"
        ) {
          currentVisit = {
            ...currentVisit,
            doctorId: visit.doctorId,
          };
        }

        setVisit(currentVisit);
      }

      // Update local consultation status
      setForm((prev) => ({
        ...prev,
        status,
      }));

      showToast(
        status === "completed"
          ? "Consultation completed successfully."
          : "Consultation saved as draft.",
        "success",
      );

      if (status === "completed") {
        setTimeout(() => {
          window.print();
        }, 500);
      }
    } catch (error) {
      console.error("Save consultation error:", error);

      showToast(
        error?.message || error?.error || "Failed to save consultation.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="consultation-loading">Loading consultation...</div>;
  }

  if (!patient || !visit) {
    return (
      <div className="consultation-loading">
        Patient or visit information not found.
      </div>
    );
  }

  const allergies = patientSummary?.patient?.allergies || [];

  const medicationRecords = Array.isArray(patientSummary?.currentMedications)
    ? patientSummary.currentMedications
    : [];

  const latestMedicationRecord =
    [...medicationRecords]
      .filter(
        (record) =>
          record && typeof record === "object" && Array.isArray(record.items),
      )
      .sort(
        (a, b) =>
          new Date(b.prescribedAt || b.createdAt || 0).getTime() -
          new Date(a.prescribedAt || a.createdAt || 0).getTime(),
      )[0] || null;

  const medications = latestMedicationRecord?.items || [];

  const medicationDate =
    latestMedicationRecord?.prescribedAt ||
    latestMedicationRecord?.createdAt ||
    null;

  const doctorSource =
    consultationDoctor?.name ||
    consultationDoctor?.fullName ||
    consultationDoctor?.doctorName
      ? consultationDoctor
      : visit?.doctorId;

  const doctorName =
    typeof doctorSource === "object"
      ? doctorSource?.name ||
        doctorSource?.fullName ||
        doctorSource?.doctorName ||
        "-"
      : "-";
  return (
    <>
      <div className="consultation-page">
        {/* Header */}
        <div className="consultation-header">
          <button
            className="back-btn"
            onClick={() => navigate(`/patients/${patientId}`)}
          >
            <ArrowBackIosNewIcon />
            Patient Details
          </button>

          <div>
            <h1>Consultation</h1>
            <p>Clinical consultation for this visit</p>
          </div>
        </div>

        {/* Patient / Visit Info */}
        <div className="consultation-top-grid">
          <div className="consultation-card patient-card">
            <div className="card-title">
              <MedicalServicesIcon />
              Patient Information
            </div>

            <div className="patient-main">
              <div className="patient-avatar">
                {patient.profileImage ? (
                  <SecureImage
                    image={patient.profileImage}
                    alt={patient.name}
                    size={52}
                  />
                ) : (
                  patient.name
                    ?.split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                )}
              </div>

              <div>
                <h2>{patient.name}</h2>
                <p>
                  Patient ID: <strong>{patient.patientCode}</strong>
                </p>
              </div>
            </div>

            <div className="patient-meta-grid">
              <div>
                <span>Gender</span>
                <strong>{patient.gender || "N/A"}</strong>
              </div>

              <div>
                <span>Blood Group</span>
                <strong>{patient.bloodGroup || "N/A"}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{patient.phone || "N/A"}</strong>
              </div>

              <div>
                <span>DOB</span>
                <strong>
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB")
                    : "N/A"}
                </strong>
              </div>
            </div>
          </div>

          <div className="consultation-card visit-card">
            <div className="card-title">
              <MedicalServicesIcon />
              Visit Information
            </div>

            <div className="visit-info">
              <div>
                <span>Visit ID</span>
                <strong>{visit.visitCode || visit._id}</strong>
              </div>

              <div>
                <span>Visit Type</span>
                <strong>{visit.visitType || "N/A"}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong className="visit-status">
                  {visit.status || "N/A"}
                </strong>
              </div>

              <div>
                <span>Doctor</span>
                <strong>{doctorName}</strong>
              </div>

              <div>
                <span>Visit Reason</span>
                <strong>{visit.visitReason || "N/A"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="clinical-alerts">
          <div className="alert-card allergy-alert">
            <WarningAmberIcon />

            <div>
              <strong>Allergies</strong>

              <p>
                {Array.isArray(allergies)
                  ? allergies.length
                    ? allergies
                        .map((item) =>
                          typeof item === "object"
                            ? item.name || item.allergen || "-"
                            : item,
                        )
                        .join(", ")
                    : "No known allergies"
                  : allergies || "No known allergies"}
              </p>
            </div>
          </div>

          <div className="alert-card medication-alert">
            <MedicalServicesIcon />

            <div>
              <strong>Current Medications</strong>

              {medicationDate && (
                <span
                  style={{
                    display: "block",
                    marginTop: "4px",
                    marginBottom: "8px",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Prescribed on{" "}
                  {new Date(medicationDate).toLocaleDateString("en-GB")}
                </span>
              )}

              <div className="current-medications-list">
                {medications.length > 0 ? (
                  medications.map((item, index) => (
                    <div
                      className="current-medication-item"
                      key={
                        item?._id ||
                        item?.id ||
                        `${item?.medicineName || item?.name}-${index}`
                      }
                    >
                      <strong>
                        {item?.medicineName ||
                          item?.name ||
                          item?.medicationName ||
                          "-"}
                      </strong>

                      <span>
                        {item?.dosage || "-"} • {item?.frequency || "-"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No current medications</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Form */}
        <div className="consultation-card form-card">
          <div className="form-card-header">
            <div>
              <h2>Clinical Consultation</h2>
              <p>Record clinical findings for this visit.</p>
            </div>

            <span className={`draft-badge ${form.status}`}>{form.status}</span>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Chief Complaint</label>
              <textarea
                disabled={form.status === "completed"}
                name="chiefComplaint"
                value={form.chiefComplaint}
                onChange={handleChange}
                placeholder="Enter patient's main complaint..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Symptoms</label>
              <textarea
                disabled={form.status === "completed"}
                name="symptoms"
                value={form.symptoms}
                onChange={handleChange}
                placeholder="Enter symptoms..."
                rows={5}
              />
            </div>

            <div className="form-group">
              <label>Examination</label>
              <textarea
                disabled={form.status === "completed"}
                name="examination"
                value={form.examination}
                onChange={handleChange}
                placeholder="Enter examination findings..."
                rows={5}
              />
            </div>

            <div className="form-group">
              <label>Blood Pressure</label>
              <input
                type="text"
                name="bloodPressure"
                value={form.vitals.bloodPressure}
                onChange={handleVitalChange}
                placeholder="e.g. 120/80 mmHg"
                disabled={form.status === "completed"}
              />
            </div>

            <div className="form-group">
              <label>Heart Rate</label>
              <input
                type="number"
                name="heartRate"
                value={form.vitals.heartRate}
                onChange={handleVitalChange}
                placeholder="e.g. 72 bpm"
                disabled={form.status === "completed"}
              />
            </div>

            <div className="form-group">
              <label>SpO2</label>
              <input
                type="number"
                name="spo2"
                value={form.vitals.spo2}
                onChange={handleVitalChange}
                placeholder="e.g. 98%"
                disabled={form.status === "completed"}
              />
            </div>

            <div className="form-group">
              <label>Temperature</label>
              <input
                type="text"
                name="temperature"
                value={form.vitals.temperature}
                onChange={handleVitalChange}
                placeholder="e.g. 98.6 °F"
                disabled={form.status === "completed"}
              />
            </div>

            <div className="form-group">
              <label>Respiratory Rate</label>
              <input
                type="number"
                name="respiratoryRate"
                value={form.vitals.respiratoryRate}
                onChange={handleVitalChange}
                placeholder="e.g. 18 rpm"
                disabled={form.status === "completed"}
              />
            </div>

            <div className="form-group">
              <label>Weight</label>
              <input
                type="number"
                name="weight"
                value={form.vitals.weight}
                onChange={handleVitalChange}
                placeholder="e.g. 70 kg"
                disabled={form.status === "completed"}
              />
            </div>

            <div className="form-group">
              <label>Assessment</label>
              <textarea
                disabled={form.status === "completed"}
                name="assessment"
                value={form.assessment}
                onChange={handleChange}
                placeholder="Enter clinical assessment..."
                rows={5}
              />
            </div>

            <div className="form-group full-width">
              <label>Diagnosis</label>
              <textarea
                disabled={form.status === "completed"}
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="Enter diagnosis..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Treatment Plan</label>
              <textarea
                disabled={form.status === "completed"}
                name="treatmentPlan"
                value={form.treatmentPlan}
                onChange={handleChange}
                placeholder="Enter treatment plan..."
                rows={5}
              />
            </div>

            <div className="form-group">
              <label>Clinical Notes</label>

              <textarea
                disabled={form.status === "completed"}
                name="clinicalNotes"
                value={form.clinicalNotes}
                onChange={handleChange}
                placeholder="Enter additional clinical notes..."
                rows={5}
              />
            </div>

            <div className="prescription-section full-width">
              <div className="prescription-section-header">
                <div>
                  <h2>Prescription</h2>
                  <p>Add medicines prescribed for this visit.</p>
                </div>
              </div>

              <div className="prescription-form-grid">
                <div className="form-group">
                  <label>Medicine Name</label>
                  <input
                    type="text"
                    name="medicineName"
                    value={prescriptionForm.medicineName}
                    onChange={handlePrescriptionChange}
                    placeholder="e.g. Paracetamol"
                    disabled={form.status === "completed"}
                  />
                </div>

                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    name="dosage"
                    value={prescriptionForm.dosage}
                    onChange={handlePrescriptionChange}
                    placeholder="e.g. 650mg"
                    disabled={form.status === "completed"}
                  />
                </div>

                <div className="form-group">
                  <label>Frequency</label>
                  <PrescriptionDropdown
                    name="frequency"
                    value={prescriptionForm.frequency}
                    onChange={handlePrescriptionChange}
                    placeholder="Select frequency"
                    disabled={form.status === "completed"}
                    options={[
                      {
                        value: "OD",
                        label: "Once a day (OD)",
                      },
                      {
                        value: "BD",
                        label: "Twice a day (BD)",
                      },
                      {
                        value: "TDS",
                        label: "Three times a day (TDS)",
                      },
                      {
                        value: "QID",
                        label: "Four times a day (QID)",
                      },
                      {
                        value: "SOS",
                        label: "As needed (SOS)",
                      },
                      {
                        value: "HS",
                        label: "At bedtime (HS)",
                      },
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label>When to Take</label>
                  <PrescriptionDropdown
                    name="instructions"
                    value={prescriptionForm.instructions}
                    onChange={handlePrescriptionChange}
                    placeholder="Select timing"
                    disabled={form.status === "completed"}
                    options={[
                      {
                        value: "Before food",
                        label: "Before food",
                      },
                      {
                        value: "After food",
                        label: "After food",
                      },
                      {
                        value: "With food",
                        label: "With food",
                      },
                      {
                        value: "Anytime",
                        label: "Anytime",
                      },
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={prescriptionForm.duration}
                    onChange={handlePrescriptionChange}
                    placeholder="e.g. 5 days"
                    disabled={form.status === "completed"}
                  />
                </div>

                <div className="prescription-add-wrapper">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleAddPrescription}
                    disabled={form.status === "completed"}
                  >
                    + Add Medicine
                  </button>
                </div>
              </div>

              {prescriptions.length > 0 && (
                <div className="prescription-list">
                  <div className="prescription-list-header">
                    <span>Medicine</span>
                    <span>Dosage</span>
                    <span>Frequency</span>
                    <span>Timing</span>
                    <span>Duration</span>
                    <span>Action</span>
                  </div>

                  {prescriptions.map((medicine, index) => (
                    <div className="prescription-row" key={index}>
                      <strong>{medicine.medicineName}</strong>

                      <span>{medicine.dosage}</span>

                      <span>{medicine.frequency}</span>

                      <span>{medicine.instructions || "-"}</span>

                      <span>{medicine.duration || "-"}</span>

                      {form.status !== "completed" && (
                        <button
                          type="button"
                          className="remove-prescription-btn"
                          onClick={() => handleRemovePrescription(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="prescription-section full-width lab-order-section">
                <div className="prescription-section-header">
                  <div>
                    <h2>Investigations Advised</h2>
                    <p>Recommend laboratory tests for this visit.</p>
                  </div>
                </div>

                <div className="prescription-form-grid">
                  <div className="form-group">
                    <label>Test Name</label>

                    <input
                      type="text"
                      name="testName"
                      value={labForm.testName}
                      onChange={handleLabFormChange}
                      placeholder="e.g. CBC, LFT, Blood Sugar"
                      disabled={form.status === "completed"}
                    />
                  </div>

                  <div className="form-group">
                    <label>Instructions</label>

                    <input
                      type="text"
                      name="instructions"
                      value={labForm.instructions}
                      onChange={handleLabFormChange}
                      placeholder="e.g. Fasting sample"
                      disabled={form.status === "completed"}
                    />
                  </div>

                  <div className="prescription-add-wrapper">
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={handleAddLabOrder}
                      disabled={form.status === "completed"}
                    >
                      + Add Lab Test
                    </button>
                  </div>
                </div>

                {labOrders.length > 0 && (
                  <div className="prescription-list lab-order-list">
                    <div className="prescription-list-header">
                      <span>Test</span>
                      <span>Instructions</span>
                      <span>Status</span>
                    </div>

                    {labOrders.map((order) => (
                      <div
                        className="prescription-row"
                        key={order._id || order.id}
                      >
                        <strong>{order.testName || "-"}</strong>

                        <span>{order.instructions || "-"}</span>

                        <span>{order.status || "ordered"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="prescription-section full-width lab-results-section">
                <div className="prescription-section-header">
                  <div>
                    <h2>Lab Results</h2>
                    <p>
                      Patient's laboratory reports from previous and current
                      visits.
                    </p>
                  </div>
                </div>

                {labReports.length === 0 ? (
                  <div className="empty-state">
                    No lab reports available for this patient.
                  </div>
                ) : (
                  <>
                    <div className="lab-report-selector">
                      <div className="form-group">
                        <label>Select Lab Report</label>

                        <PrescriptionDropdown
                          name="selectedLabReport"
                          value={selectedLabReportId}
                          onChange={(e) =>
                            setSelectedLabReportId(e.target.value)
                          }
                          placeholder="Select a lab report"
                          options={labReports.map((report) => {
                            const reportId = report._id || report.id;

                            const reportDate =
                              report.reportedAt || report.createdAt;

                            return {
                              value: reportId,
                              label: `${report.testName || "Lab Test"} • ${
                                reportDate
                                  ? new Date(reportDate).toLocaleString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "Date unavailable"
                              }`,
                            };
                          })}
                        />
                      </div>
                    </div>

                    {(() => {
                      const selectedReport = labReports.find(
                        (report) =>
                          String(report._id || report.id) ===
                          String(selectedLabReportId),
                      );

                      if (!selectedReport) {
                        return (
                          <div className="empty-state">
                            Select a lab report to view its result.
                          </div>
                        );
                      }

                      return (
                        <div className="lab-report-detail">
                          <div className="lab-report-detail-header">
                            <div>
                              <span className="lab-report-label">
                                TEST NAME
                              </span>

                              <h3>{selectedReport.testName || "Lab Test"}</h3>
                            </div>

                            <span className="lab-report-status">
                              {selectedReport.status || "Completed"}
                            </span>
                          </div>

                          <div className="lab-report-meta">
                            <div>
                              <span>Reported At</span>
                              <strong>
                                {selectedReport.reportedAt
                                  ? new Date(
                                      selectedReport.reportedAt,
                                    ).toLocaleString("en-GB")
                                  : "-"}
                              </strong>
                            </div>

                            <div>
                              <span>Result</span>
                              <strong>
                                {selectedReport.resultText || "-"}
                              </strong>
                            </div>
                          </div>

                          {selectedReport.attachmentUrl && (
                            <div className="lab-report-attachment">
                              <span>Attachment</span>

                              <a
                                href={selectedReport.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View Attachment
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
            <div className="prescription-section full-width procedure-section">
              <div className="prescription-section-header">
                <div>
                  <h2>Procedures Advised / Performed</h2>
                  <p>Record procedures advised or performed for this visit.</p>
                </div>
              </div>

              <div className="prescription-form-grid procedure-form-grid">
                <div className="form-group">
                  <label>Procedure Name</label>

                  <input
                    type="text"
                    name="procedureName"
                    value={procedureForm.procedureName}
                    onChange={handleProcedureFormChange}
                    placeholder="e.g. Nebulization"
                    disabled={form.status === "completed"}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>

                  <PrescriptionDropdown
                    name="status"
                    value={procedureForm.status}
                    onChange={handleProcedureFormChange}
                    placeholder="Select status"
                    disabled={form.status === "completed"}
                    options={[
                      {
                        value: "planned",
                        label: "Planned / Advised",
                      },
                      {
                        value: "completed",
                        label: "Completed",
                      },
                      {
                        value: "cancelled",
                        label: "Cancelled",
                      },
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label>Procedure Timing</label>

                  <PrescriptionDropdown
                    name="procedureTiming"
                    value={procedureForm.procedureTiming}
                    onChange={handleProcedureFormChange}
                    placeholder="Select timing"
                    disabled={form.status === "completed"}
                    options={[
                      {
                        value: "later",
                        label: "Next Appointment",
                      },
                      {
                        value: "now",
                        label: "Today / Send to Lab or OT",
                      },
                    ]}
                  />
                </div>

                <div className="form-group">
                  <label>Performed At</label>

                  <input
                    type="datetime-local"
                    name="performedAt"
                    value={procedureForm.performedAt}
                    onChange={handleProcedureFormChange}
                    disabled={form.status === "completed"}
                  />
                </div>

                <div className="form-group">
                  <label>Indication</label>

                  <input
                    type="text"
                    name="indication"
                    value={procedureForm.indication}
                    onChange={handleProcedureFormChange}
                    placeholder="Why is this procedure needed?"
                    disabled={form.status === "completed"}
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>

                  <textarea
                    name="notes"
                    value={procedureForm.notes}
                    onChange={handleProcedureFormChange}
                    placeholder="Procedure notes..."
                    rows={4}
                    disabled={form.status === "completed"}
                  />
                </div>

                <div className="form-group">
                  <label>Outcome</label>

                  <textarea
                    name="outcome"
                    value={procedureForm.outcome}
                    onChange={handleProcedureFormChange}
                    placeholder="Procedure outcome..."
                    rows={4}
                    disabled={form.status === "completed"}
                  />
                </div>

                <div className="prescription-add-wrapper">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleAddProcedure}
                    disabled={form.status === "completed"}
                  >
                    + Save Procedure
                  </button>
                </div>
              </div>

              {procedures.length === 0 ? (
                <div className="empty-state">No procedures for this visit.</div>
              ) : (
                <div className="prescription-list procedure-list">
                  <div className="prescription-list-header">
                    <span>Procedure</span>
                    <span>Status</span>
                    <span>Performed At</span>
                    <span>Outcome</span>
                  </div>

                  {procedures.map((procedure) => (
                    <div
                      className="prescription-row"
                      key={procedure._id || procedure.id}
                    >
                      <strong>{procedure.procedureName || "-"}</strong>

                      <span className={`procedure-status ${procedure.status}`}>
                        {procedure.status || "-"}
                      </span>

                      <span>
                        {procedure.performedAt
                          ? new Date(procedure.performedAt).toLocaleString(
                              "en-GB",
                            )
                          : "-"}
                      </span>

                      <span>{procedure.outcome || "-"}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="recent-procedure-history">
                <div className="recent-procedure-history-header">
                  <div>
                    <h3>Recent Procedure History</h3>
                    <p>Procedures from the lasts consultations.</p>
                  </div>
                </div>

                {recentProcedureHistory.length === 0 ? (
                  <div className="empty-state">
                    No previous procedures found.
                  </div>
                ) : (
                  <div className="prescription-list procedure-history-list">
                    <div className="prescription-list-header">
                      <span>Procedure</span>
                      <span>Status</span>
                      <span>Performed At</span>
                      <span>Outcome</span>
                    </div>

                    {recentProcedureHistory.map((procedure, index) => (
                      <div
                        className="prescription-row"
                        key={
                          procedure._id ||
                          procedure.id ||
                          `${procedure.sourceVisitId}-${index}`
                        }
                      >
                        <strong>{procedure.procedureName || "-"}</strong>

                        <span
                          className={`procedure-status ${procedure.status || ""}`}
                        >
                          {procedure.status || "-"}
                        </span>

                        <span>
                          {procedure.performedAt
                            ? new Date(procedure.performedAt).toLocaleString(
                                "en-GB",
                              )
                            : procedure.sourceVisitDate
                              ? new Date(
                                  procedure.sourceVisitDate,
                                ).toLocaleString("en-GB")
                              : "-"}
                        </span>

                        <span>{procedure.outcome || "-"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Follow-up Date</label>
              <input
                type="date"
                name="followUpDate"
                value={form.followUpDate}
                onChange={handleChange}
                disabled={form.status === "completed"}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate(`/patients/${patientId}`)}
            >
              Back
            </button>

            {form.status !== "completed" && (
              <>
                {form.status !== "completed" && (
                  <>
                    <button
                      type="button"
                      className="draft-btn"
                      disabled={saving}
                      onClick={() => handleSave("draft")}
                    >
                      {saving ? "Saving..." : "Save Draft"}
                    </button>

                    <button
                      type="button"
                      className="primary-btn"
                      disabled={saving}
                      onClick={() => handleSave("completed")}
                    >
                      <SaveIcon />
                      {saving ? "Saving..." : "Complete Consultation"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="print-prescription-sheet">
        <div className="print-header">
          <div>
            <h1>Prescription & Consultation Advice</h1>
            <p>Hospital Management System</p>
          </div>

          <div className="print-date">
            <strong>Date:</strong> {new Date().toLocaleDateString("en-GB")}
          </div>
        </div>

        {/* Patient / Visit / Doctor */}
        <div className="print-patient-section">
          <div>
            <span>Patient Name</span>
            <strong>{patient?.name || "-"}</strong>
          </div>

          <div>
            <span>Patient ID</span>
            <strong>{patient?.patientCode || "-"}</strong>
          </div>

          <div>
            <span>Visit ID</span>
            <strong>{visit?.visitCode || visit?._id || "-"}</strong>
          </div>

          <div>
            <span>Doctor</span>
            <strong>{doctorName}</strong>
          </div>
        </div>

        {/* Vitals */}
        <div className="print-section">
          <h2>Vitals</h2>

          <div className="print-vitals-grid">
            <div>
              <span>Blood Pressure</span>
              <strong>
                {form.vitals.bloodPressure
                  ? `${form.vitals.bloodPressure} mmHg`
                  : "-"}
              </strong>
            </div>

            <div>
              <span>Heart Rate</span>
              <strong>
                {form.vitals.heartRate ? `${form.vitals.heartRate} bpm` : "-"}
              </strong>
            </div>

            <div>
              <span>SpO₂</span>
              <strong>
                {form.vitals.spo2 ? `${form.vitals.spo2} %` : "-"}
              </strong>
            </div>

            <div>
              <span>Temperature</span>
              <strong>
                {form.vitals.temperature
                  ? `${form.vitals.temperature} °C`
                  : "-"}
              </strong>
            </div>

            <div>
              <span>Respiratory Rate</span>
              <strong>
                {form.vitals.respiratoryRate
                  ? `${form.vitals.respiratoryRate} breaths/min`
                  : "-"}
              </strong>
            </div>

            <div>
              <span>Weight</span>
              <strong>
                {form.vitals.weight ? `${form.vitals.weight} kg` : "-"}
              </strong>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="print-section">
          <h2>Diagnosis</h2>
          <p>{form.diagnosis || "-"}</p>
        </div>

        {/* Medicines */}
        {prescriptions.length > 0 && (
          <div className="print-section">
            <h2>Prescription</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>When to Take</th>
                  <th>Duration</th>
                </tr>
              </thead>

              <tbody>
                {prescriptions.map((medicine, index) => (
                  <tr key={index}>
                    <td>{medicine.medicineName || "-"}</td>
                    <td>{medicine.dosage || "-"}</td>
                    <td>{medicine.frequency || "-"}</td>
                    <td>{medicine.instructions || "-"}</td>
                    <td>
                      {medicine.duration ? `${medicine.duration} days` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Investigations */}
        {labOrders.length > 0 && (
          <div className="print-section">
            <h2>Investigations Advised</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Investigation</th>
                  <th>Instructions</th>
                </tr>
              </thead>

              <tbody>
                {labOrders.map((order, index) => (
                  <tr key={order._id || order.id || index}>
                    <td>{order.testName || "-"}</td>
                    <td>{order.instructions || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Procedures */}
        {procedures.length > 0 && (
          <div className="print-section">
            <h2>Procedures Advised / Performed</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Procedure</th>
                  <th>Status</th>
                  <th>Indication</th>
                  <th>Notes</th>
                  <th>Outcome</th>
                </tr>
              </thead>

              <tbody>
                {procedures.map((procedure, index) => (
                  <tr key={procedure._id || procedure.id || index}>
                    <td>{procedure.procedureName || "-"}</td>
                    <td>{procedure.status || "-"}</td>
                    <td>{procedure.indication || "-"}</td>
                    <td>{procedure.notes || "-"}</td>
                    <td>{procedure.outcome || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Follow-up */}
        <div className="print-section">
          <h2>Follow-up</h2>
          <p>
            {form.followUpDate
              ? new Date(form.followUpDate).toLocaleDateString("en-GB")
              : "As advised"}
          </p>
        </div>

        {/* Doctor */}
        <div className="print-footer">
          <div>
            <strong>{doctorName}</strong>
            <span>Doctor</span>
          </div>

          <div className="doctor-signature">Doctor's Signature</div>
        </div>
      </div>
    </>
  );
}
