import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Edit } from "@mui/icons-material";
import { getTaxes } from "../api/taxes";
import "./taxes.scss";

const TaxList = () => {
  const navigate = useNavigate();

  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTaxes();

      const taxList = Array.isArray(response?.data) ? response.data : [];

      setTaxes(taxList);
    } catch (err) {
      console.error("Taxes fetch error:", err);
      setError(err?.message || "Failed to fetch taxes");
      setTaxes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTaxes = taxes.filter((tax) => {
  const search = searchTerm.trim().toLowerCase();

  const taxName = String(tax?.name || "").toLowerCase();
  const taxCode = String(tax?.code || "").toLowerCase();

  const matchesSearch =
    !search ||
    taxName.includes(search) ||
    taxCode.includes(search);

  const matchesStatus =
    filterStatus === "all" ||
    (filterStatus === "active" && tax.isActive === true) ||
    (filterStatus === "inactive" && tax.isActive === false);

  return matchesSearch && matchesStatus;
});

const handleEdit = (id) => {
  navigate(`/taxes/${id}/edit`);
};

return (
    <div className="taxes-page">
      <div className="page-header">
        <div>
          <h1>Taxes</h1>
          <p>Manage tax rates and tax components</p>
        </div>

        <button
  type="button"
  className="tax-new-button"
  onClick={() => navigate("/taxes/new")}
>
  <Add />
  <span>New Tax</span>
</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-section">
        <div className="tax-search-box">
  <span className="tax-search-icon">⌕</span>

  <input
    type="text"
    placeholder="Search by tax name or code..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
  />

  {searchTerm && (
    <button
      type="button"
      className="tax-search-clear"
      onClick={() => setSearchTerm("")}
      aria-label="Clear search"
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading taxes...</div>
      ) : filteredTaxes.length === 0 ? (
        <div className="empty-state">
          <p>No taxes found</p>
        </div>
      ) : (
        <div className="taxes-table">
          <table>
            <thead>
              <tr>
                <th>Tax Name</th>
                <th>Code</th>
                <th>Rate</th>
                <th>Components</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTaxes.map((tax) => (
                <tr key={tax._id}>
                  <td className="tax-name">{tax.name || "-"}</td>

                  <td>{tax.code || "-"}</td>

                  <td>
                    {tax.rate !== undefined && tax.rate !== null
                      ? `${tax.rate}%`
                      : "-"}
                  </td>

                  <td>
                    {Array.isArray(tax.components) &&
                    tax.components.length > 0 ? (
                      <div className="component-list">
                        {tax.components.map((component, index) => (
                          <span
                            className="component-badge"
                            key={component?._id || component?.code || index}
                          >
                            {component?.name || "-"}{" "}
                            {component?.rate !== undefined
                              ? `(${component.rate}%)`
                              : ""}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        tax.isActive ? "active" : "inactive"
                      }`}
                    >
                      {tax.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    {tax.createdAt
                      ? new Date(tax.createdAt).toLocaleDateString("en-GB")
                      : "-"}
                  </td>

                  <td className="actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(tax._id)}
                      title="Edit"
                    >
                      <Edit />
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

export default TaxList;
