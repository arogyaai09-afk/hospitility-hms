import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";

import { createInvoice } from "../api/invoices";
import { getTaxes } from "../api/taxes";
import { getPatients } from "../api/patients";
import { getAppointments } from "../api/appointments";
import { useToast } from "../context/ToastContext";

import "./invoices.scss";

export default function AddInvoice() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    appointmentId: "",
    description: "",
    quantity: 1,
    unitPrice: "",
    discountAmount: 0,
    taxId: "",
    paymentMode: "cash",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientRes, appointmentRes, taxRes] = await Promise.all([
          getPatients(),
          getAppointments(),
          getTaxes(),
        ]);

        setPatients(Array.isArray(patientRes?.data) ? patientRes.data : []);

        setAppointments(
          Array.isArray(appointmentRes?.data) ? appointmentRes.data : [],
        );

        setTaxes(Array.isArray(taxRes?.data) ? taxRes.data : []);
      } catch (error) {
        console.error("Invoice form data error:", error);
        showToast("Failed to load invoice form data", "error");
      }
    };

    loadData();
  }, [showToast]);

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient._id === form.patientId),
    [patients, form.patientId],
  );

  const selectedTax = useMemo(
    () => taxes.find((tax) => tax._id === form.taxId),
    [taxes, form.taxId],
  );

  const taxRate = Number(selectedTax?.rate || 0);

  const subtotal = Math.max(
    0,
    Number(form.quantity || 0) * Number(form.unitPrice || 0),
  );

  const discount = Math.max(0, Number(form.discountAmount || 0));

  const taxableAmount = Math.max(0, subtotal - discount);

  const taxAmount = (taxableAmount * taxRate) / 100;

  const totalAmount = Math.max(0, taxableAmount + taxAmount);

  const filteredAppointments = useMemo(() => {
    if (!form.patientId) return [];

    return appointments.filter((appointment) => {
      const appointmentPatientId =
        typeof appointment.patientId === "object"
          ? appointment.patientId?._id
          : appointment.patientId;

      return !appointmentPatientId || appointmentPatientId === form.patientId;
    });
  }, [appointments, form.patientId]);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handlePatientChange = (value) => {
    setForm((prev) => ({
      ...prev,
      patientId: value,
      appointmentId: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.patientId) {
      showToast("Please select patient", "warning");
      return;
    }

    if (!form.description.trim()) {
      showToast("Please enter invoice item description", "warning");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      showToast("Please enter valid quantity", "warning");
      return;
    }

    if (!form.unitPrice || Number(form.unitPrice) <= 0) {
      showToast("Please enter valid unit price", "warning");
      return;
    }

    if (discount > subtotal) {
      showToast("Discount cannot be greater than subtotal", "warning");
      return;
    }

    if (Number(form.taxRate || 0) < 0) {
      showToast("Tax rate cannot be negative", "warning");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        patientId: form.patientId,
        patientName: selectedPatient?.name || "",
        appointmentId: form.appointmentId || undefined,

        lineItems: [
          {
            description: form.description.trim(),
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice),
            amount: subtotal,
          },
        ],

        subtotalAmount: subtotal,
        discountAmount: discount,
        taxId: form.taxId || undefined,

        taxSnapshot: selectedTax
          ? {
              name: selectedTax.name,
              code: selectedTax.code,
              rate: Number(selectedTax.rate || 0),
              components: Array.isArray(selectedTax.components)
                ? selectedTax.components
                : [],
            }
          : undefined,

        taxRate,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        amount: totalAmount,

        // Split allows payment to be collected later
        // or in multiple transactions.
        paymentType: "split",
        paymentMode: form.paymentMode,
      };

      await createInvoice(payload);

      showToast("Invoice created successfully", "success");
      navigate("/invoices");
    } catch (error) {
      showToast(error?.message || "Failed to create invoice", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-invoice-page">
      {/* Header */}
      <div className="invoice-page-header">
        <div>
          <button
            type="button"
            className="invoice-back-button"
            onClick={() => navigate("/invoices")}
          >
            <ArrowBackIosNewIcon />
            Back to Invoices
          </button>

          <div className="invoice-title-row">
            <div className="invoice-title-icon">
              <ReceiptLongOutlinedIcon />
            </div>

            <div>
              <h1>Create New Invoice</h1>
              <p>
                Create a new invoice for a patient and review the amount before
                saving.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form className="add-invoice-layout" onSubmit={handleSubmit}>
        {/* Main Form */}
        <div className="invoice-form-card">
          <div className="invoice-section">
            <div className="invoice-section-heading">
              <div className="section-icon">
                <PersonOutlineOutlinedIcon />
              </div>

              <div>
                <h3>Patient & Appointment</h3>
                <p>Select the patient and related appointment.</p>
              </div>
            </div>

            <div className="invoice-form-grid">
              <div className="invoice-form-group">
                <label>
                  Patient <span className="req">*</span>
                </label>

                <select
                  value={form.patientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  required
                >
                  <option value="">Select patient</option>

                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="invoice-form-group">
                <label>
                  <EventOutlinedIcon />
                  Appointment
                </label>

                <select
                  value={form.appointmentId}
                  onChange={(e) => setField("appointmentId", e.target.value)}
                  disabled={!form.patientId}
                >
                  <option value="">
                    {form.patientId
                      ? "Select appointment"
                      : "Select patient first"}
                  </option>

                  {filteredAppointments.map((appointment) => {
                    const appointmentDate =
                      appointment.scheduledAt ||
                      appointment.appointmentDate ||
                      appointment.date ||
                      appointment.startTime;

                    const doctorName =
                      appointment.doctorId?.name || "Doctor not assigned";

                    const specialization =
                      appointment.doctorId?.specialization || "";

                    const formattedDate = appointmentDate
                      ? new Date(appointmentDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date not available";

                    const formattedTime = appointmentDate
                      ? new Date(appointmentDate).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";

                    return (
                      <option key={appointment._id} value={appointment._id}>
                        {formattedDate}
                        {formattedTime ? ` · ${formattedTime}` : ""}
                        {" · Dr. "}
                        {doctorName}
                        {specialization ? ` (${specialization})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {selectedPatient && (
              <div className="selected-patient-info">
                <div className="selected-patient-avatar">
                  {selectedPatient.name?.charAt(0)?.toUpperCase() || "P"}
                </div>

                <div>
                  <strong>{selectedPatient.name}</strong>
                  <span>Selected patient</span>
                </div>
              </div>
            )}
          </div>

          <div className="invoice-divider" />

          {/* Invoice Item */}
          <div className="invoice-section">
            <div className="invoice-section-heading">
              <div className="section-icon">
                <AddCircleOutlineOutlinedIcon />
              </div>

              <div>
                <h3>Invoice Item</h3>
                <p>Add the service or item being billed.</p>
              </div>
            </div>

            <div className="invoice-form-group">
              <label>
                Description <span className="req">*</span>
              </label>

              <input
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="e.g. Consultation Fee"
                required
              />
            </div>

            <div className="invoice-form-grid">
              <div className="invoice-form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                />
              </div>

              <div className="invoice-form-group">
                <label>
                  Unit Price <span className="req">*</span>
                </label>

                <div className="input-with-prefix">
                  <span>₹</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(e) => setField("unitPrice", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="invoice-divider" />

          {/* Discount & Tax */}
          <div className="invoice-section">
            <div className="invoice-section-heading">
              <div className="section-icon">
                <ReceiptLongOutlinedIcon />
              </div>

              <div>
                <h3>Discount & Tax</h3>
                <p>Apply discount and tax if applicable.</p>
              </div>
            </div>

            <div className="invoice-form-grid">
              <div className="invoice-form-group">
                <label>Discount</label>

                <div className="input-with-prefix">
                  <span>₹</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountAmount}
                    onChange={(e) => setField("discountAmount", e.target.value)}
                  />
                </div>
              </div>
              <div className="invoice-form-group">
                <label>Tax</label>

                <select
                  value={form.taxId}
                  onChange={(e) => setField("taxId", e.target.value)}
                >
                  <option value="">No Tax</option>

                  {taxes
                    .filter((tax) => tax.isActive)
                    .map((tax) => (
                      <option key={tax._id} value={tax._id}>
                        {tax.name} ({tax.code}) - {tax.rate}%
                      </option>
                    ))}
                </select>

                <small className="field-help">
                  Select a tax from the Taxes module.
                </small>
              </div>
            </div>
          </div>

          <div className="invoice-divider" />

          {/* Payment */}
          <div className="invoice-section">
            <div className="invoice-section-heading">
              <div className="section-icon">
                <PaymentsOutlinedIcon />
              </div>

              <div>
                <h3>Payment Settings</h3>
                <p>Choose the payment mode associated with this invoice.</p>
              </div>
            </div>

            <div className="invoice-form-group">
              <label>Payment Mode</label>

              <select
                value={form.paymentMode}
                onChange={(e) => setField("paymentMode", e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="upi">UPI</option>
              </select>

              <small className="field-help">
                Payment can be collected later from the invoice details page.
              </small>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-form-footer">
            <button
              className="btn-cancel-form"
              type="button"
              onClick={() => navigate("/invoices")}
              disabled={loading}
            >
              Cancel
            </button>

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="invoice-summary-card">
          <div className="summary-header">
            <div>
              <span>Invoice Summary</span>
              <h2>Amount Due</h2>
            </div>

            <div className="summary-receipt-icon">
              <ReceiptLongOutlinedIcon />
            </div>
          </div>

          <div className="summary-total">{formatCurrency(totalAmount)}</div>

          <div className="summary-status">
            <span className="status-dot" />
            Payment pending
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          <div className="summary-row discount-row">
            <span>Discount</span>
            <strong>- {formatCurrency(discount)}</strong>
          </div>

          <div className="summary-row">
            Tax ({taxRate.toFixed(2)}%)
            <strong>{formatCurrency(taxAmount)}</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-row summary-final">
            <span>Total</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>

          <div className="summary-note">
            <ReceiptLongOutlinedIcon />
            <span>
              The invoice will be created with <strong>split payment</strong>{" "}
              enabled, so payments can be collected in multiple transactions.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
