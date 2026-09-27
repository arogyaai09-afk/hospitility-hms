import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { getTaxById, updateTax } from "../api/taxes";
import { useToast } from "../context/ToastContext";
import "./taxes.scss";

export default function EditTax() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [tax, setTax] = useState(null);
  const [rate, setRate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTax = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTaxById(id);

        if (response?.status === "success" && response?.data) {
          setTax(response.data);
          setRate(response.data.rate ?? "");
          setIsActive(response.data.isActive ?? true);
        } else {
          setError(response?.message || "Failed to fetch tax");
        }
      } catch (err) {
        console.error("Tax fetch error:", err);
        setError(err?.message || "Failed to fetch tax");
      } finally {
        setLoading(false);
      }
    };

    fetchTax();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rate === "") {
      showToast("Please enter tax rate", "warning");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        rate: Number(rate),
        isActive,
      };

      await updateTax(id, payload);

      showToast("Tax updated successfully", "success");
      navigate("/taxes");
    } catch (err) {
      console.error("Update tax error:", err);

      showToast(
        err?.message || "Failed to update tax",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="tax-form-page">
        <div className="tax-form-card">
          <div className="loading">Loading tax...</div>
        </div>
      </div>
    );
  }

  if (error || !tax) {
    return (
      <div className="tax-form-page">
        <div className="alert alert-error">
          {error || "Tax not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="tax-form-page">
      <div className="tax-form-breadcrumb">
        <button
          type="button"
          onClick={() => navigate("/taxes")}
        >
          <ArrowBackIosNewIcon fontSize="small" />
          Taxes
        </button>
      </div>

      <form
        className="tax-form-card"
        onSubmit={handleSubmit}
      >
        <div className="tax-form-header">
          <div>
            <h1>Edit Tax</h1>
            <p>Update tax rate and status</p>
          </div>
        </div>

        {/* Tax Information */}
        <div className="tax-form-section">
          <div className="tax-section-title">
            Tax Information
          </div>

          <div className="tax-form-row">
            <div className="tax-form-group">
              <label>Tax Name</label>
              <input
                type="text"
                value={tax.name || ""}
                disabled
              />
            </div>

            <div className="tax-form-group">
              <label>Tax Code</label>
              <input
                type="text"
                value={tax.code || ""}
                disabled
              />
            </div>
          </div>

          <div className="tax-form-row">
            <div className="tax-form-group">
              <label>
                Tax Rate (%) <span>*</span>
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
              />
            </div>

            <div className="tax-form-group tax-status-group">
              <label>Status</label>

              <label className="tax-toggle">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) =>
                    setIsActive(e.target.checked)
                  }
                />

                <span>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Components - Read Only */}
        <div className="tax-form-section">
          <div className="tax-section-title">
            Tax Components
          </div>

          {Array.isArray(tax.components) &&
          tax.components.length > 0 ? (
            <div className="tax-components">
              {tax.components.map((component, index) => (
                <div
                  className="tax-component-card"
                  key={component?._id || index}
                >
                  <div className="tax-component-header">
                    <strong>
                      Component {index + 1}
                    </strong>
                  </div>

                  <div className="tax-form-row">
                    <div className="tax-form-group">
                      <label>Component Name</label>
                      <input
                        type="text"
                        value={component.name || ""}
                        disabled
                      />
                    </div>

                    <div className="tax-form-group">
                      <label>Component Code</label>
                      <input
                        type="text"
                        value={component.code || ""}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="tax-form-row">
                    <div className="tax-form-group">
                      <label>Component Rate (%)</label>
                      <input
                        type="number"
                        value={component.rate ?? ""}
                        disabled
                      />
                    </div>

                    <div className="tax-form-group">
                      <label>Type</label>
                      <input
                        type="text"
                        value={component.type || ""}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tax-component-empty">
              No tax components.
            </div>
          )}
        </div>

        <div className="tax-form-footer">
          <button
            type="button"
            className="tax-cancel-button"
            onClick={() => navigate("/taxes")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="tax-submit-button"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Tax"}
          </button>
        </div>
      </form>
    </div>
  );
}