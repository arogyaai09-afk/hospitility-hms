import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Visibility, Download, Description } from "@mui/icons-material";
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
      const response = await getInvoices();
      if (response.status === "success") {
        setInvoices(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch invoices");
      console.error("Invoices fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "paid":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "partial":
        return "badge-info";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/invoices/${id}`);
  };

  const totalAmount = filteredInvoices.reduce(
    (sum, inv) => sum + (inv.totalAmount || 0),
    0
  );
  const paidAmount = filteredInvoices.reduce(
    (sum, inv) => sum + (inv.paidAmount || 0),
    0
  );
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>View and manage patient invoices</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/invoices/new")}>
          <Add /> Create Invoice
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="summary-cards">
        <div className="summary-card">
          <h4>Total Amount</h4>
          <p className="amount">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h4>Paid Amount</h4>
          <p className="amount paid">${paidAmount.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h4>Pending Amount</h4>
          <p className="amount pending">${pendingAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by invoice number or patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="empty-state">
          <p>No invoices found</p>
        </div>
      ) : (
        <div className="invoices-table">
          <table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Patient Name</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
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
                    <Description /> {invoice.invoiceNumber}
                  </td>
                  <td>{invoice.patientName}</td>
                  <td className="amount">${invoice.totalAmount?.toFixed(2)}</td>
                  <td className="amount paid">
                    ${invoice.paidAmount?.toFixed(2)}
                  </td>
                  <td className="amount balance">
                    ${invoice.balanceAmount?.toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
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
                      title="Download PDF"
                    >
                      <Download />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Invoices;
