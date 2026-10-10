// invoices/InvoiceList.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Add,
  Visibility,
  Print,
  Description,
  Refresh,
} from "@mui/icons-material";
import { getInvoices } from "../api/invoices";
import "./invoices.scss";

const Invoices = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInvoices();

      const data = response?.data?.data || response?.data || [];

      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to fetch invoices");
      console.error("Invoices fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Latest invoice first
  const sortedInvoices = [...invoices].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );

  const filteredInvoices = sortedInvoices.filter((invoice) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      invoice.invoiceNumber?.toLowerCase().includes(search) ||
      invoice.patientName?.toLowerCase().includes(search);

    const matchesStatus =
      filterStatus === "all" || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "paid":
        return "badge-success";

      case "pending":
        return "badge-warning";

      case "partially_paid":
        return "badge-info";

      case "cancelled":
        return "badge-danger";

      case "failed":
        return "badge-danger";

      default:
        return "badge-secondary";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewDetails = (id) => {
    navigate(`/invoices/${id}`);
  };

  const handlePrint = (invoice) => {
    try {
      const printWindow = window.open("", "_blank", "width=900,height=700");

      if (!printWindow) {
        alert("Please allow pop-ups to print the invoice.");
        return;
      }

      const formatPrintCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      const formatPrintDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      const formatPrintStatus = (status) => {
        if (!status) return "N/A";

        return status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
      };

      const patientId =
        typeof invoice.patientId === "object"
          ? invoice.patientId?._id
          : invoice.patientId;

      const appointmentId =
        typeof invoice.appointmentId === "object"
          ? invoice.appointmentId?._id
          : invoice.appointmentId;

      const visitId =
        typeof invoice.visitId === "object"
          ? invoice.visitId?._id
          : invoice.visitId;

      const lineItems = invoice.lineItems || [];

      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber || ""}</title>

          <style>
            @page {
              size: A4;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              background: #ffffff;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              font-size: 12px;
              line-height: 1.5;
            }

            .invoice {
              width: 100%;
              max-width: 186mm;
              margin: 0 auto;
            }

            h1 {
              margin: 0 0 24px;
              font-size: 26px;
              line-height: 1.2;
            }

            h2 {
              margin: 26px 0 12px;
              font-size: 16px;
              line-height: 1.3;
            }

            .meta p,
            .patient-info p {
              margin: 6px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            th,
            td {
              padding: 9px 8px;
              border-bottom: 1px solid #d1d5db;
              text-align: left;
            }

            th {
              background: #f3f4f6;
              font-weight: 700;
            }

            .totals {
              width: 320px;
              max-width: 100%;
              margin: 22px 0 0 auto;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              gap: 25px;
              padding: 6px 0;
            }

            .grand-total {
              margin-top: 5px;
              padding-top: 10px;
              border-top: 2px solid #111827;
              font-size: 15px;
              font-weight: 700;
            }

            .status {
              margin-top: 22px;
              font-weight: 600;
            }
          </style>
        </head>

        <body>
          <div class="invoice">

            <h1>INVOICE</h1>

            <div class="meta">
              <p>
                <strong>Invoice Number:</strong>
                ${invoice.invoiceNumber || "N/A"}
              </p>

              <p>
                <strong>Date:</strong>
                ${formatPrintDate(invoice.createdAt)}
              </p>
            </div>

            <h2>Patient Information</h2>

            <div class="patient-info">
              <p>
                <strong>Patient Name:</strong>
                ${invoice.patientName || "N/A"}
              </p>

              <p>
                <strong>Patient ID:</strong>
                ${patientId || "N/A"}
              </p>

              <p>
                <strong>Appointment ID:</strong>
                ${appointmentId || "N/A"}
              </p>

              <p>
                <strong>Visit ID:</strong>
                ${visitId || "N/A"}
              </p>
            </div>

            <h2>Invoice Items</h2>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                ${
                  lineItems.length
                    ? lineItems
                        .map(
                          (item) => `
                            <tr>
                              <td>
                                ${item.description || "N/A"}
                              </td>

                              <td>
                                ${item.quantity || 0}
                              </td>

                              <td>
                                ${formatPrintCurrency(item.unitPrice)}
                              </td>

                              <td>
                                ${formatPrintCurrency(item.amount)}
                              </td>
                            </tr>
                          `,
                        )
                        .join("")
                    : `
                      <tr>
                        <td colspan="4">
                          No invoice items
                        </td>
                      </tr>
                    `
                }
              </tbody>
            </table>

            <div class="totals">

              <div class="total-row">
                <span>Subtotal</span>
                <strong>
                  ${formatPrintCurrency(invoice.subtotalAmount)}
                </strong>
              </div>

              <div class="total-row">
                <span>Discount</span>
                <strong>
                  - ${formatPrintCurrency(invoice.discountAmount)}
                </strong>
              </div>

              <div class="total-row">
                <span>Tax</span>
                <strong>
                  ${formatPrintCurrency(invoice.taxAmount)}
                </strong>
              </div>

              <div class="total-row grand-total">
                <span>Total</span>
                <strong>
                  ${formatPrintCurrency(invoice.totalAmount)}
                </strong>
              </div>

              <div class="total-row">
                <span>Paid</span>
                <strong>
                  ${formatPrintCurrency(invoice.paidAmount)}
                </strong>
              </div>

              <div class="total-row">
                <span>Balance</span>
                <strong>
                  ${formatPrintCurrency(invoice.balanceAmount)}
                </strong>
              </div>

            </div>

            <div class="status">
              Status: ${formatPrintStatus(invoice.status)}
            </div>

          </div>
        </body>
      </html>
    `);

      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();

        setTimeout(() => {
          printWindow.print();

          setTimeout(() => {
            printWindow.close();
          }, 500);
        }, 300);
      };
    } catch (error) {
      console.error("Invoice print error:", error);
    }
  };

  // Summary based on ALL invoices, not current search/filter
  const totalAmount = invoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount || 0),
    0,
  );

  const paidAmount = invoices.reduce(
    (sum, inv) => sum + Number(inv.paidAmount || 0),
    0,
  );

  const outstandingAmount = invoices.reduce(
    (sum, inv) => sum + Number(inv.balanceAmount || 0),
    0,
  );

  return (
    <>

      <div className="invoices-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Invoices</h1>
            <p>View and manage patient invoices</p>
          </div>

          <div className="header-actions">
            <button
              className="btn-refresh"
              onClick={fetchInvoices}
              disabled={loading}
              title="Refresh invoices"
            >
              <Refresh className={loading ? "refresh-spin" : ""} />
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate("/invoices/new")}
            >
              <Add />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>

            <button onClick={fetchInvoices}>Retry</button>
          </div>
        )}

        {/* Summary */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card-top">
              <span>Total Invoices</span>
              <Description />
            </div>

            <p className="summary-count">{invoices.length}</p>

            <small>All invoices</small>
          </div>

          <div className="summary-card">
            <div className="summary-card-top">
              <span>Total Amount</span>
              <span className="summary-symbol">₹</span>
            </div>

            <p className="amount">{formatCurrency(totalAmount)}</p>

            <small>Invoice value</small>
          </div>

          <div className="summary-card summary-paid">
            <div className="summary-card-top">
              <span>Paid Amount</span>
              <span className="summary-symbol">✓</span>
            </div>

            <p className="amount paid">{formatCurrency(paidAmount)}</p>

            <small>Collected payments</small>
          </div>

          <div className="summary-card summary-outstanding">
            <div className="summary-card-top">
              <span>Outstanding</span>
              <span className="summary-symbol">₹</span>
            </div>

            <p className="amount pending">
              {formatCurrency(outstandingAmount)}
            </p>

            <small>Remaining balance</small>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search invoice number or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                type="button"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Result count */}
        {!loading && invoices.length > 0 && (
          <div className="results-info">
            <span>
              Showing <strong>{filteredInvoices.length}</strong> of{" "}
              <strong>{invoices.length}</strong> invoices
            </span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="loading">
            <div className="loading-spinner" />
            <span>Loading invoices...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Description />
            </div>

            <h3>
              {invoices.length === 0 ? "No invoices yet" : "No invoices found"}
            </h3>

            <p>
              {invoices.length === 0
                ? "Create your first invoice to get started."
                : "Try changing your search or status filter."}
            </p>

            {invoices.length === 0 && (
              <button
                className="btn-primary"
                onClick={() => navigate("/invoices/new")}
              >
                <Add />
                Create Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="invoices-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Patient</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="invoice-number">
                      <Description />

                      <span>{invoice.invoiceNumber || "N/A"}</span>
                    </td>

                    <td>
                      <div className="patient-cell">
                        <strong>
                          {invoice.patientName || "Unknown Patient"}
                        </strong>

                        {invoice.patientId && (
                          <small>
                            {invoice.patientId?._id || invoice.patientId}
                          </small>
                        )}
                      </div>
                    </td>

                    <td className="amount">
                      {formatCurrency(invoice.totalAmount)}
                    </td>

                    <td className="amount paid">
                      {formatCurrency(invoice.paidAmount)}
                    </td>

                    <td className="amount balance">
                      {formatCurrency(invoice.balanceAmount)}
                    </td>

                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          invoice.status,
                        )}`}
                      >
                        {formatStatus(invoice.status)}
                      </span>
                    </td>

                    <td className="date-cell">
                      {formatDate(invoice.createdAt)}
                    </td>

                    <td className="actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleViewDetails(invoice._id)}
                        title="View Details"
                      >
                        <Visibility />
                      </button>

                      <button
                        className="btn-icon btn-download"
                        onClick={() => handlePrint(invoice)}
                        title="Print Invoice"
                      >
                        <Print />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Invoices;
