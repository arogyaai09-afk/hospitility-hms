// invoices/InvoiceDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { getInvoices, getInvoicePayments, payInvoice } from "../api/invoices";

import { useToast } from "../context/ToastContext";
import "./InvoiceDetail.scss";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPayment, setShowPayment] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMode: "cash",
    paymentReference: "",
    paymentTerminalId: "",
  });

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const [invoiceResponse, paymentResponse] = await Promise.all([
        getInvoices(),
        getInvoicePayments(id),
      ]);

      const invoicesData =
        invoiceResponse?.data?.data || invoiceResponse?.data || [];

      const paymentData =
        paymentResponse?.data?.data || paymentResponse?.data || [];

      const invoiceList = Array.isArray(invoicesData) ? invoicesData : [];

      const foundInvoice = invoiceList.find(
        (invoice) => String(invoice?._id) === String(id),
      );

      if (!foundInvoice) {
        throw new Error("Invoice not found");
      }

      setInvoice(foundInvoice);

      setPayments(Array.isArray(paymentData) ? paymentData : []);
    } catch (err) {
      console.error("Invoice detail error:", err);

      setError(err?.message || err?.error || "Failed to fetch invoice");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = () => {
    if (!invoice) return;

    setPaymentForm({
      amount: invoice.balanceAmount || "",
      paymentMode: "cash",
      paymentReference: "",
      paymentTerminalId: "",
    });

    setShowPayment(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const amount = Number(paymentForm.amount);

    if (!amount || amount <= 0) {
      showToast("Enter a valid payment amount.", "warning");
      return;
    }

    if (amount > Number(invoice.balanceAmount || 0)) {
      showToast("Payment amount cannot exceed invoice balance.", "warning");
      return;
    }

    try {
      setPaymentLoading(true);

      await payInvoice(
        id,
        amount,
        paymentForm.paymentMode,
        paymentForm.paymentReference,
        paymentForm.paymentTerminalId,
      );

      showToast("Payment recorded successfully.", "success");

      setShowPayment(false);

      await loadInvoice();
    } catch (err) {
      console.error("Payment error:", err);

      showToast(
        err?.message || err?.error || "Failed to record payment.",
        "error",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "status-paid";

      case "partially_paid":
        return "status-partial";

      case "pending":
        return "status-pending";

      case "failed":
        return "status-failed";

      case "cancelled":
        return "status-cancelled";

      default:
        return "status-default";
    }
  };

  if (loading) {
    return (
      <div className="invoice-detail-page">
        <div className="invoice-loading">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-page">
        <div className="invoice-error">
          <p>{error || "Invoice not found."}</p>

          <button
            className="invoice-back-btn"
            onClick={() => navigate("/invoices")}
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-detail-page">
      {/* Header */}
      <div className="invoice-detail-header">
        <div>
          <button
            className="invoice-back-link"
            onClick={() => navigate("/invoices")}
          >
            <ArrowBackIosNewIcon />
            Invoices
          </button>

          <div className="invoice-title-row">
            <div className="invoice-title-icon">
              <ReceiptLongIcon />
            </div>

            <div>
              <h1>Invoice Details</h1>
              <p>{invoice.invoiceNumber || "Invoice"}</p>
            </div>
          </div>
        </div>

        <div className="invoice-header-actions">
          {invoice.balanceAmount > 0 && invoice.status !== "cancelled" && (
            <button className="pay-invoice-btn" onClick={openPaymentModal}>
              <PaymentsIcon />
              Pay Invoice
            </button>
          )}
        </div>
      </div>

      {/* Invoice top information */}
      <div className="invoice-detail-grid">
        {/* Invoice Information */}
        <section className="invoice-card">
          <div className="invoice-card-header">
            <h2>Invoice Information</h2>

            <span
              className={`invoice-status ${getStatusClass(invoice.status)}`}
            >
              {invoice.status?.replace("_", " ") || "N/A"}
            </span>
          </div>

          <div className="invoice-info-grid">
            <div className="invoice-info-item">
              <span>Invoice Number</span>
              <strong>{invoice.invoiceNumber || "N/A"}</strong>
            </div>

            <div className="invoice-info-item">
              <span>Order Number</span>
              <strong>{invoice.orderNumber || "N/A"}</strong>
            </div>

            <div className="invoice-info-item">
              <span>Created Date</span>
              <strong>
                {invoice.createdAt
                  ? new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </strong>
            </div>

            <div className="invoice-info-item">
              <span>Order Status</span>
              <strong>{invoice.orderStatus?.replace("_", " ") || "N/A"}</strong>
            </div>
          </div>
        </section>

        {/* Patient Information */}
        <section className="invoice-card">
          <div className="invoice-card-header">
            <h2>Patient Information</h2>
          </div>

          <div className="invoice-info-grid">
            <div className="invoice-info-item">
              <span>Patient Name</span>
              <strong>{invoice.patientName || "N/A"}</strong>
            </div>

            <div className="invoice-info-item">
              <span>Patient ID</span>
              <strong>
                {invoice.patientId?._id || invoice.patientId || "N/A"}
              </strong>
            </div>

            <div className="invoice-info-item">
              <span>Appointment ID</span>
              <strong>
                {invoice.appointmentId?._id || invoice.appointmentId || "N/A"}
              </strong>
            </div>

            <div className="invoice-info-item">
              <span>Visit ID</span>
              <strong>
                {invoice.visitId?._id || invoice.visitId || "N/A"}
              </strong>
            </div>
          </div>
        </section>
      </div>

      {/* Line Items */}
      <section className="invoice-card invoice-items-card">
        <div className="invoice-card-header">
          <h2>Invoice Items</h2>
        </div>

        {invoice.lineItems?.length > 0 ? (
          <div className="invoice-items-table-wrapper">
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description || "N/A"}</td>

                    <td>{item.quantity || 0}</td>

                    <td>₹{Number(item.unitPrice || 0).toFixed(2)}</td>

                    <td className="item-amount">
                      ₹{Number(item.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-items">No invoice items found.</div>
        )}

        {/* Totals */}
        <div className="invoice-totals">
          <div>
            <span>Subtotal</span>
            <strong>₹{Number(invoice.subtotalAmount || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>- ₹{Number(invoice.discountAmount || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>
              Tax
              {invoice.taxRate ? ` (${invoice.taxRate}%)` : ""}
            </span>

            <strong>₹{Number(invoice.taxAmount || 0).toFixed(2)}</strong>
          </div>

          <div className="total-row">
            <span>Total Amount</span>
            <strong>₹{Number(invoice.totalAmount || 0).toFixed(2)}</strong>
          </div>

          <div className="paid-row">
            <span>Paid Amount</span>
            <strong>₹{Number(invoice.paidAmount || 0).toFixed(2)}</strong>
          </div>

          <div className="balance-row">
            <span>Balance Amount</span>
            <strong>₹{Number(invoice.balanceAmount || 0).toFixed(2)}</strong>
          </div>
        </div>
      </section>

      {/* Payment History */}
      <section className="invoice-card">
        <div className="invoice-card-header">
          <h2>Payment History</h2>
        </div>

        {payments.length === 0 ? (
          <div className="no-payments">
            No payments recorded for this invoice.
          </div>
        ) : (
          <div className="payment-table-wrapper">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {[...payments]
                  .sort(
                    (a, b) =>
                      new Date(b.paidAt || b.createdAt || 0).getTime() -
                      new Date(a.paidAt || a.createdAt || 0).getTime(),
                  )
                  .map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </td>

                      <td className="payment-amount">
                        ₹{Number(payment.amount || 0).toFixed(2)}
                      </td>

                      <td>{payment.paymentMode?.toUpperCase() || "N/A"}</td>

                      <td>{payment.paymentReference || "—"}</td>

                      <td>
                        <span
                          className={`payment-status ${
                            payment.status === "success"
                              ? "payment-success"
                              : "payment-failed"
                          }`}
                        >
                          {payment.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Payment Modal */}
      {showPayment && (
        <div
          className="invoice-modal-overlay"
          onClick={() => {
            if (!paymentLoading) {
              setShowPayment(false);
            }
          }}
        >
          <div
            className="invoice-payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payment-modal-header">
              <div>
                <h2>Pay Invoice</h2>
                <p>Balance: ₹{Number(invoice.balanceAmount || 0).toFixed(2)}</p>
              </div>

              <button
                type="button"
                className="payment-modal-close"
                disabled={paymentLoading}
                onClick={() => setShowPayment(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePayment}>
              <div className="payment-form-group">
                <label>
                  Amount <span>*</span>
                </label>

                <input
                  type="number"
                  min="0.01"
                  max={invoice.balanceAmount}
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="payment-form-group">
                <label>
                  Payment Mode <span>*</span>
                </label>

                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      paymentMode: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div className="payment-form-group">
                <label>Payment Reference</label>

                <input
                  type="text"
                  value={paymentForm.paymentReference}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      paymentReference: e.target.value,
                    }))
                  }
                  placeholder="Transaction / reference number"
                />
              </div>

              <div className="payment-form-group">
                <label>Payment Terminal ID</label>

                <input
                  type="text"
                  value={paymentForm.paymentTerminalId}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      paymentTerminalId: e.target.value,
                    }))
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="payment-modal-footer">
                <button
                  type="button"
                  className="payment-cancel-btn"
                  disabled={paymentLoading}
                  onClick={() => setShowPayment(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="payment-submit-btn"
                  disabled={paymentLoading}
                >
                  {paymentLoading ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
