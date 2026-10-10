import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { getDoctorById } from "../api/doctors";
import { createInvoice, payInvoice } from "../api/invoices";
import "./QuickBillingModal.scss";

export default function QuickBillingModal({
  open,
  appointment,
  visitId,
  onClose,
  onSuccess,
}) {
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (!open || !appointment?.doctorId) return;

    const loadDoctor = async () => {
      try {
        setLoadingDoctor(true);
        setError("");

        const response = await getDoctorById(appointment.doctorId);

        const data =
          response?.data?.data ||
          response?.data ||
          response;

        setDoctor(data);
      } catch (err) {
        console.error("Doctor fetch error:", err);
        setError(
          err?.message || "Unable to fetch doctor consultation fee."
        );
      } finally {
        setLoadingDoctor(false);
      }
    };

    loadDoctor();
  }, [open, appointment?.doctorId]);

  useEffect(() => {
    if (!open) {
      setReceipt(null);
      setError("");
      setPaymentMode("cash");
      setDoctor(null);
      setProcessing(false);
    }
  }, [open]);

  if (!open) return null;

  const doctorFee = Number(doctor?.fees || 0);

  const handlePayment = async () => {
    if (!appointment?.patientId) {
      setError("Patient information is missing.");
      return;
    }

    if (!appointment?.doctorId) {
      setError("Doctor information is missing.");
      return;
    }

    if (!visitId) {
      setError("Visit ID is missing.");
      return;
    }

    if (doctorFee <= 0) {
      setError("Doctor consultation fee is not available.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      // 1. Create invoice
      const invoiceResponse = await createInvoice({
        patientId: appointment.patientId,
        patientName: appointment.patient || "Patient",
        appointmentId: appointment.id,
        visitId,

        lineItems: [
          {
            description: "Doctor Consultation Fee",
            quantity: 1,
            unitPrice: doctorFee,
            amount: doctorFee,
          },
        ],

        subtotalAmount: doctorFee,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: doctorFee,
        paidAmount: 0,
        balanceAmount: doctorFee,
        amount: doctorFee,

        paymentType: "split",
        paymentMode,
      });

      const invoice =
        invoiceResponse?.data?.data ||
        invoiceResponse?.data ||
        invoiceResponse;

      const invoiceId = invoice?._id || invoice?.id;

      if (!invoiceId) {
        throw new Error("Invoice ID was not returned.");
      }

      // 2. Collect payment
      const paymentResponse = await payInvoice(
        invoiceId,
        doctorFee,
        paymentMode
      );

      const paymentData =
        paymentResponse?.data?.data ||
        paymentResponse?.data ||
        paymentResponse;

      setReceipt({
        invoiceId,
        invoiceNumber:
          invoice?.invoiceNumber ||
          paymentData?.invoiceNumber ||
          "-",
        patientName: appointment.patient || "Patient",
        doctorName:
          doctor?.name ||
          appointment.doctor ||
          "Doctor",
        specialization:
          doctor?.specialization ||
          appointment.dRole ||
          "-",
        amount: doctorFee,
        paymentMode,
        paidAt: new Date(),
      });

      onSuccess?.();

    } catch (err) {
      console.error("Quick billing error:", err);

      setError(
        err?.message ||
          err?.error ||
          err?.response?.data?.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="quick-billing-overlay">
      <div className="quick-billing-modal">

        {!receipt ? (
          <>
            {/* HEADER */}
            <div className="quick-billing-header">
              <div>
                <div className="quick-billing-title">
                  <PaymentsIcon />
                  OPD Payment
                </div>

                <p>
                  Collect consultation payment before completing reception.
                </p>
              </div>

              <button
                type="button"
                className="quick-billing-close"
                onClick={onClose}
                disabled={processing}
              >
                <CloseIcon />
              </button>
            </div>

            {/* PATIENT / DOCTOR */}
            <div className="quick-billing-info">

              <div className="quick-info-card">
                <div className="quick-info-icon patient">
                  <PersonIcon />
                </div>

                <div>
                  <span>Patient</span>
                  <strong>
                    {appointment?.patient || "Unknown Patient"}
                  </strong>
                </div>
              </div>

              <div className="quick-info-card">
                <div className="quick-info-icon doctor">
                  <LocalHospitalIcon />
                </div>

                <div>
                  <span>Doctor</span>
                  <strong>
                    {doctor?.name ||
                      appointment?.doctor ||
                      "Loading..."}
                  </strong>

                  <small>
                    {doctor?.specialization ||
                      appointment?.dRole ||
                      "-"}
                  </small>
                </div>
              </div>
            </div>

            {/* APPOINTMENT DETAILS */}
            <div className="quick-billing-details">

              <div>
                <span>Appointment</span>
                <strong>
                  {appointment?.date || "-"}
                </strong>
              </div>

              <div>
                <span>Visit ID</span>
                <strong>
                  {visitId || "-"}
                </strong>
              </div>

            </div>

            {/* FEE */}
            <div className="quick-fee-card">

              <div>
                <span>Consultation Fee</span>

                <strong>
                  {loadingDoctor
                    ? "Loading..."
                    : `₹${doctorFee.toFixed(2)}`}
                </strong>
              </div>

              <div className="quick-fee-total">
                <span>Total Payable</span>

                <strong>
                  {loadingDoctor
                    ? "₹0.00"
                    : `₹${doctorFee.toFixed(2)}`}
                </strong>
              </div>

            </div>

            {/* PAYMENT MODE */}
            <div className="quick-payment-section">

              <label>Payment Mode</label>

              <div className="quick-payment-modes">

                {["cash", "upi", "online"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={
                      paymentMode === mode
                        ? "payment-mode active"
                        : "payment-mode"
                    }
                    onClick={() => setPaymentMode(mode)}
                    disabled={processing}
                  >
                    {mode === "upi"
                      ? "UPI"
                      : mode.charAt(0).toUpperCase() +
                        mode.slice(1)}
                  </button>
                ))}

              </div>

            </div>

            {error && (
              <div className="quick-billing-error">
                {error}
              </div>
            )}

            {/* FOOTER */}
            <div className="quick-billing-footer">

              <button
                type="button"
                className="quick-btn-cancel"
                onClick={onClose}
                disabled={processing}
              >
                Cancel
              </button>

              <button
                type="button"
                className="quick-btn-pay"
                onClick={handlePayment}
                disabled={
                  processing ||
                  loadingDoctor ||
                  doctorFee <= 0
                }
              >
                {processing
                  ? "Processing..."
                  : `Collect ₹${doctorFee.toFixed(2)}`}
              </button>

            </div>
          </>
        ) : (
          /* RECEIPT */
          <div className="quick-receipt">

            <div className="quick-receipt-success">
              ✓
            </div>

            <h2>Payment Successful</h2>

            <p className="quick-receipt-subtitle">
              Consultation payment has been recorded.
            </p>

            <div className="quick-receipt-card">

              <div className="quick-receipt-row">
                <span>Invoice</span>
                <strong>
                  {receipt.invoiceNumber}
                </strong>
              </div>

              <div className="quick-receipt-row">
                <span>Patient</span>
                <strong>
                  {receipt.patientName}
                </strong>
              </div>

              <div className="quick-receipt-row">
                <span>Doctor</span>
                <strong>
                  {receipt.doctorName}
                </strong>
              </div>

              <div className="quick-receipt-row">
                <span>Specialization</span>
                <strong>
                  {receipt.specialization}
                </strong>
              </div>

              <div className="quick-receipt-row">
                <span>Payment Mode</span>
                <strong>
                  {receipt.paymentMode.toUpperCase()}
                </strong>
              </div>

              <div className="quick-receipt-total">
                <span>Amount Paid</span>
                <strong>
                  ₹{receipt.amount.toFixed(2)}
                </strong>
              </div>

            </div>

            <div className="quick-receipt-actions">

              <button
                type="button"
                className="quick-btn-print"
                onClick={handlePrint}
              >
                <ReceiptLongIcon />
                Print Receipt
              </button>

              <button
                type="button"
                className="quick-btn-done"
                onClick={onClose}
              >
                Done
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}