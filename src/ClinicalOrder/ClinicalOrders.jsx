import { useEffect, useState } from "react";
import ScienceIcon from "@mui/icons-material/Science";
import BiotechIcon from "@mui/icons-material/Biotech";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

import { createLabOrder, getPatientLabOrders } from "../api/labOrders";
import { getVisitReports } from "../api/labReports";
import { createProcedure, getVisitProcedures } from "../api/procedures";

import "./clinicalOrders.scss";

const getId = (value) =>
  typeof value === "object" && value !== null
    ? value._id || value.id
    : value;

export default function ClinicalOrders({
  patientId,
  visitId,
  readOnly = false,
  showToast,
}) {
  const [labOrders, setLabOrders] = useState([]);
  const [reports, setReports] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [labForm, setLabForm] = useState({ testName: "", instructions: "" });
  const [procedureForm, setProcedureForm] = useState({
    procedureName: "",
    indication: "",
    notes: "",
    outcome: "",
    performedAt: "",
    status: "planned",
  });
  const [saving, setSaving] = useState(false);

  const loadClinicalOrders = async () => {
    if (!visitId || !patientId) return;

    try {
      const [ordersResponse, reportsResponse, proceduresResponse] = await Promise.all([
        getPatientLabOrders(patientId),
        getVisitReports(visitId),
        getVisitProcedures(visitId),
      ]);

      if (ordersResponse?.status === "success") {
        const allOrders = Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : [];

        setLabOrders(
          allOrders.filter(
            (item) => String(getId(item.visitId)) === String(visitId)
          )
        );
      }

      if (reportsResponse?.status === "success") {
        setReports(Array.isArray(reportsResponse.data) ? reportsResponse.data : []);
      }

      if (proceduresResponse?.status === "success") {
        setProcedures(
          Array.isArray(proceduresResponse.data) ? proceduresResponse.data : []
        );
      }
    } catch (error) {
      console.error("Clinical orders loading error:", error);
    }
  };

  useEffect(() => {
    loadClinicalOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, visitId]);

  const handleCreateLabOrder = async () => {
    if (!labForm.testName.trim()) {
      showToast?.("Lab test name is required.", "error");
      return;
    }

    try {
      setSaving(true);
      await createLabOrder(visitId, {
        testName: labForm.testName.trim(),
        instructions: labForm.instructions.trim(),
      });
      setLabForm({ testName: "", instructions: "" });
      await loadClinicalOrders();
      showToast?.("Lab order created successfully.", "success");
    } catch (error) {
      console.error("Create lab order error:", error);
      showToast?.(
        error?.response?.data?.message || "Failed to create lab order.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProcedure = async () => {
    if (!procedureForm.procedureName.trim()) {
      showToast?.("Procedure name is required.", "error");
      return;
    }

    try {
      setSaving(true);
      await createProcedure(visitId, {
        procedureName: procedureForm.procedureName.trim(),
        indication: procedureForm.indication.trim(),
        notes: procedureForm.notes.trim(),
        outcome: procedureForm.outcome.trim(),
        performedAt: procedureForm.performedAt
          ? new Date(procedureForm.performedAt).toISOString()
          : undefined,
        status: procedureForm.status,
      });
      setProcedureForm({
        procedureName: "",
        indication: "",
        notes: "",
        outcome: "",
        performedAt: "",
        status: "planned",
      });
      await loadClinicalOrders();
      showToast?.("Procedure saved successfully.", "success");
    } catch (error) {
      console.error("Create procedure error:", error);
      showToast?.(
        error?.response?.data?.message || "Failed to save procedure.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const reportForOrder = (orderId) =>
    reports.find((report) => String(getId(report.labOrderId)) === String(orderId));

  return (
    <section className="clinical-orders-section full-width">
      <div className="clinical-orders-header">
        <div>
          <h2>Clinical Orders</h2>
          <p>Order laboratory tests and manage procedures for this visit.</p>
        </div>
      </div>

      <div className="clinical-orders-grid">
        <div className="clinical-order-card">
          <div className="clinical-order-card-header">
            <div className="clinical-order-icon"><ScienceIcon /></div>
            <div>
              <h3>Lab Orders</h3>
              <p>Order a laboratory investigation.</p>
            </div>
          </div>

          <div className="clinical-order-form">
            <div className="form-group">
              <label>Test Name</label>
              <input
                value={labForm.testName}
                onChange={(e) => setLabForm((prev) => ({ ...prev, testName: e.target.value }))}
                placeholder="e.g. CBC, LFT, HbA1c"
                disabled={readOnly || saving}
              />
            </div>

            <div className="form-group">
              <label>Instructions</label>
              <textarea
                value={labForm.instructions}
                onChange={(e) => setLabForm((prev) => ({ ...prev, instructions: e.target.value }))}
                placeholder="Fasting, sample instructions, etc."
                rows={3}
                disabled={readOnly || saving}
              />
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={handleCreateLabOrder}
              disabled={readOnly || saving}
            >
              <ScienceIcon fontSize="small" />
              Order Lab Test
            </button>
          </div>

          <div className="clinical-order-list">
            {labOrders.length === 0 ? (
              <div className="clinical-empty">No lab orders for this visit.</div>
            ) : (
              labOrders.map((order) => {
                const report = reportForOrder(order._id || order.id);
                return (
                  <div className="clinical-list-row" key={order._id || order.id}>
                    <div>
                      <strong>{order.testName}</strong>
                      {order.instructions && <span>{order.instructions}</span>}
                      {report && (
                        <span className="clinical-result-preview">
                          Result: {report.resultText}
                        </span>
                      )}
                    </div>
                    <span className={`clinical-status ${report ? "completed" : order.status}`}>
                      {report ? "completed" : order.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="clinical-order-card">
          <div className="clinical-order-card-header">
            <div className="clinical-order-icon"><BiotechIcon /></div>
            <div>
              <h3>Lab Results</h3>
              <p>Results are entered from the Lab Reports module.</p>
            </div>
          </div>

          <div className="clinical-results-readonly">
            {reports.length === 0 ? (
              <div className="clinical-empty">No lab reports available for this visit.</div>
            ) : (
              reports.map((report) => {
                const order = labOrders.find(
                  (item) => String(item._id || item.id) === String(getId(report.labOrderId))
                );

                return (
                  <div className="clinical-report-row" key={report._id || report.id}>
                    <div>
                      <strong>{order?.testName || "Laboratory Test"}</strong>
                      <span>{report.resultText}</span>
                      {report.reportedAt && (
                        <small>Reported: {new Date(report.reportedAt).toLocaleString("en-IN")}</small>
                      )}
                    </div>
                    <span className="clinical-status completed">Completed</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="clinical-order-card clinical-order-card-wide">
          <div className="clinical-order-card-header">
            <div className="clinical-order-icon"><MedicalServicesIcon /></div>
            <div>
              <h3>Procedures</h3>
              <p>Record a procedure or treatment performed/planned for this visit.</p>
            </div>
          </div>

          <div className="clinical-order-form procedure-form-grid">
            <div className="form-group">
              <label>Procedure Name</label>
              <input
                value={procedureForm.procedureName}
                onChange={(e) => setProcedureForm((prev) => ({ ...prev, procedureName: e.target.value }))}
                placeholder="e.g. Nebulization"
                disabled={readOnly || saving}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={procedureForm.status}
                onChange={(e) => setProcedureForm((prev) => ({ ...prev, status: e.target.value }))}
                disabled={readOnly || saving}
              >
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label>Performed At <span>(optional)</span></label>
              <input
                type="datetime-local"
                value={procedureForm.performedAt}
                onChange={(e) => setProcedureForm((prev) => ({ ...prev, performedAt: e.target.value }))}
                disabled={readOnly || saving}
              />
            </div>

            <div className="form-group">
              <label>Indication</label>
              <input
                value={procedureForm.indication}
                onChange={(e) => setProcedureForm((prev) => ({ ...prev, indication: e.target.value }))}
                placeholder="Why is this procedure needed?"
                disabled={readOnly || saving}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={procedureForm.notes}
                onChange={(e) => setProcedureForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Procedure notes..."
                rows={3}
                disabled={readOnly || saving}
              />
            </div>

            <div className="form-group">
              <label>Outcome</label>
              <textarea
                value={procedureForm.outcome}
                onChange={(e) => setProcedureForm((prev) => ({ ...prev, outcome: e.target.value }))}
                placeholder="Procedure outcome..."
                rows={3}
                disabled={readOnly || saving}
              />
            </div>

            <div className="clinical-order-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={handleCreateProcedure}
                disabled={readOnly || saving}
              >
                <MedicalServicesIcon fontSize="small" />
                Save Procedure
              </button>
            </div>
          </div>

          <div className="clinical-order-list">
            {procedures.length === 0 ? (
              <div className="clinical-empty">No procedures for this visit.</div>
            ) : (
              procedures.map((procedure) => (
                <div className="clinical-list-row" key={procedure._id || procedure.id}>
                  <div>
                    <strong>{procedure.procedureName}</strong>
                    <span>{procedure.indication || "No indication provided"}</span>
                    {procedure.notes && <span>{procedure.notes}</span>}
                  </div>
                  <span className={`clinical-status ${procedure.status}`}>
                    {procedure.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
