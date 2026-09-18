import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { createInvoice } from "../api/invoices";
import { getPatients } from "../api/patients";
import { getAppointments } from "../api/appointments";

export default function AddInvoice() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    appointmentId: "",
    description: "",
    quantity: 1,
    unitPrice: "",
    discountAmount: 0,
    taxRate: 0,
    paymentMode: "cash",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientRes, appointmentRes] = await Promise.all([
          getPatients(),
          getAppointments(),
        ]);

        setPatients(
          Array.isArray(patientRes?.data) ? patientRes.data : []
        );

        setAppointments(
          Array.isArray(appointmentRes?.data) ? appointmentRes.data : []
        );
      } catch (error) {
        console.error("Invoice form data error:", error);
      }
    };

    loadData();
  }, []);

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedPatient = patients.find(
    (patient) => patient._id === form.patientId
  );

  const subtotal =
    Number(form.quantity || 0) * Number(form.unitPrice || 0);

  const taxAmount =
    ((subtotal - Number(form.discountAmount || 0)) *
      Number(form.taxRate || 0)) /
    100;

  const totalAmount =
    subtotal - Number(form.discountAmount || 0) + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.patientId) {
      alert("Please select patient");
      return;
    }

    if (!form.description.trim()) {
      alert("Please enter invoice item description");
      return;
    }

    if (!form.unitPrice || Number(form.unitPrice) <= 0) {
      alert("Please enter valid amount");
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
        discountAmount: Number(form.discountAmount || 0),
        taxRate: Number(form.taxRate || 0),
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        amount: totalAmount,
        paymentType: "full",
        paymentMode: form.paymentMode,
      };

      await createInvoice(payload);

      alert("Invoice created successfully");
      navigate("/invoices");
    } catch (error) {
      alert(error?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-doctor-page">
      <div className="breadcrumb">
        <span
          className="bc-back"
          onClick={() => navigate("/invoices")}
        >
          <ArrowBackIosNewIcon />
          Invoices
        </span>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-title">Create New Invoice</div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Patient <span className="req">*</span>
              </label>

              <select
                value={form.patientId}
                onChange={(e) =>
                  setField("patientId", e.target.value)
                }
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

            <div className="form-group">
              <label>Appointment</label>

              <select
                value={form.appointmentId}
                onChange={(e) =>
                  setField("appointmentId", e.target.value)
                }
              >
                <option value="">Select appointment</option>

                {appointments.map((appointment) => (
                  <option
                    key={appointment._id}
                    value={appointment._id}
                  >
                    {appointment.patientName || "Appointment"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              Description <span className="req">*</span>
            </label>

            <input
              value={form.description}
              onChange={(e) =>
                setField("description", e.target.value)
              }
              placeholder="e.g. Consultation Fee"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>

              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) =>
                  setField("quantity", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>
                Unit Price <span className="req">*</span>
              </label>

              <input
                type="number"
                min="0"
                value={form.unitPrice}
                onChange={(e) =>
                  setField("unitPrice", e.target.value)
                }
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Discount</label>

              <input
                type="number"
                min="0"
                value={form.discountAmount}
                onChange={(e) =>
                  setField("discountAmount", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Tax Rate (%)</label>

              <input
                type="number"
                min="0"
                value={form.taxRate}
                onChange={(e) =>
                  setField("taxRate", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Mode</label>

            <select
              value={form.paymentMode}
              onChange={(e) =>
                setField("paymentMode", e.target.value)
              }
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="invoice-total">
            <strong>Total Amount</strong>
            <strong>₹{totalAmount.toFixed(2)}</strong>
          </div>

          <div className="form-footer">
            <button
              className="btn-cancel-form"
              type="button"
              onClick={() => navigate("/invoices")}
            >
              Cancel
            </button>

            <button
              className="btn-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}