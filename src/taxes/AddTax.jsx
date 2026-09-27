import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { createTax } from "../api/taxes";
import { useToast } from "../context/ToastContext";
import "./taxes.scss";

const initialState = {
  name: "",
  code: "",
  rate: "",
  isActive: true,
};

const emptyComponent = {
  name: "",
  code: "",
  rate: "",
  type: "percentage",
};

export default function AddTax() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(initialState);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addComponent = () => {
    setComponents((prev) => [
      ...prev,
      { ...emptyComponent },
    ]);
  };

  const updateComponent = (index, field, value) => {
    setComponents((prev) =>
      prev.map((component, i) =>
        i === index
          ? { ...component, [field]: value }
          : component
      )
    );
  };

  const removeComponent = (index) => {
    setComponents((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.code.trim() || form.rate === "") {
      showToast(
        "Please enter tax name, code and rate",
        "warning"
      );
      return;
    }

    const invalidComponent = components.some(
      (component) =>
        !component.name.trim() ||
        !component.code.trim() ||
        component.rate === ""
    );

    if (invalidComponent) {
      showToast(
        "Please complete all tax component fields",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        rate: Number(form.rate),
        isActive: form.isActive,
        components: components.map((component) => ({
          name: component.name.trim(),
          code: component.code.trim(),
          rate: Number(component.rate),
          type: component.type,
        })),
      };

      await createTax(payload);

      showToast("Tax created successfully", "success");
      navigate("/taxes");
    } catch (error) {
      console.error("Create tax error:", error);

      showToast(
        error?.message || "Failed to create tax",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

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
            <h1>Create New Tax</h1>
            <p>
              Add a tax rate and its optional components
            </p>
          </div>
        </div>

        {/* Basic Tax Information */}
        <div className="tax-form-section">
          <div className="tax-section-title">
            Tax Information
          </div>

          <div className="tax-form-row">
            <div className="tax-form-group">
              <label>
                Tax Name <span>*</span>
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setField("name", e.target.value)
                }
                placeholder="e.g. GST"
                required
              />
            </div>

            <div className="tax-form-group">
              <label>
                Tax Code <span>*</span>
              </label>

              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setField("code", e.target.value)
                }
                placeholder="e.g. GST18"
                required
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
                value={form.rate}
                onChange={(e) =>
                  setField("rate", e.target.value)
                }
                placeholder="18"
                required
              />
            </div>

            <div className="tax-form-group tax-status-group">
              <label>Status</label>

              <label className="tax-toggle">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setField(
                      "isActive",
                      e.target.checked
                    )
                  }
                />

                <span>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Components */}
        <div className="tax-form-section">
          <div className="tax-section-heading">
            <div>
              <div className="tax-section-title">
                Tax Components
              </div>

              <p>
                Optional components such as CGST and SGST.
              </p>
            </div>

            <button
              type="button"
              className="tax-add-component"
              onClick={addComponent}
            >
              + Add Component
            </button>
          </div>

          {components.length === 0 ? (
            <div className="tax-component-empty">
              No tax components added.
            </div>
          ) : (
            <div className="tax-components">
              {components.map((component, index) => (
                <div
                  className="tax-component-card"
                  key={index}
                >
                  <div className="tax-component-header">
                    <strong>
                      Component {index + 1}
                    </strong>

                    <button
                      type="button"
                      className="tax-remove-component"
                      onClick={() =>
                        removeComponent(index)
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="tax-form-row">
                    <div className="tax-form-group">
                      <label>Component Name *</label>

                      <input
                        type="text"
                        value={component.name}
                        onChange={(e) =>
                          updateComponent(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="e.g. CGST"
                      />
                    </div>

                    <div className="tax-form-group">
                      <label>Component Code *</label>

                      <input
                        type="text"
                        value={component.code}
                        onChange={(e) =>
                          updateComponent(
                            index,
                            "code",
                            e.target.value
                          )
                        }
                        placeholder="e.g. CGST9"
                      />
                    </div>
                  </div>

                  <div className="tax-form-row">
                    <div className="tax-form-group">
                      <label>Component Rate (%) *</label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={component.rate}
                        onChange={(e) =>
                          updateComponent(
                            index,
                            "rate",
                            e.target.value
                          )
                        }
                        placeholder="9"
                      />
                    </div>

                    <div className="tax-form-group">
                      <label>Type</label>

                      <select
                        value={component.type}
                        onChange={(e) =>
                          updateComponent(
                            index,
                            "type",
                            e.target.value
                          )
                        }
                      >
                        <option value="percentage">
                          Percentage
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
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
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Tax"}
          </button>
        </div>
      </form>
    </div>
  );
}