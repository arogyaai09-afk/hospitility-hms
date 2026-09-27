//admissions/DischargeSummary.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { getDischargeSummary, createDischargeSummary } from "../api/discharge";
import { useToast } from "../context/ToastContext";
import "./DischargeSummary.scss";

export default function DischargeSummary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

const [summary, setSummary] = useState("");
const [followUpInstructions, setFollowUpInstructions] = useState("");
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [existingSummary, setExistingSummary] = useState(null);


  useEffect(() => {
  const fetchSummary = async () => {
    try {
      const response = await getDischargeSummary(id);

      console.log("DISCHARGE GET RESPONSE:", response);

      if (response?.status === "success" && response?.data) {
        setExistingSummary(response.data);
        setSummary(response.data.summary || "");
        setFollowUpInstructions(
          response.data.followUpInstructions || ""
        );
      }
    } catch (error) {
      console.error("DISCHARGE GET ERROR:", error);
      setExistingSummary(null);
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    fetchSummary();
  }
}, [id]);

if (loading) {
  return (
    <div className="discharge-summary-loading">
      Loading discharge summary...
    </div>
  );
}

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!summary.trim()) {
      showToast("Please enter discharge summary", "warning");
      return;
    }

    try {
      setSaving(true);

      const response = await createDischargeSummary(
        id,
        summary.trim(),
        followUpInstructions.trim(),
      );

      if (response?.status === "success") {
        setExistingSummary(response.data);
        showToast("Discharge summary saved successfully", "success");
      } else {
        showToast(
          response?.message || "Failed to save discharge summary",
          "error",
        );
      }
    } catch (error) {
      showToast(error?.message || "Failed to save discharge summary", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="discharge-summary-page">
      <div className="discharge-summary-breadcrumb">
        <button onClick={() => navigate(`/admissions/${id}`)}>
          <ArrowBackIosNewIcon fontSize="small" />
          Admission Details
        </button>
      </div>

      <div className="discharge-summary-header">
        <div>
          <div className="discharge-summary-title-row">
            <div className="discharge-summary-title-icon">
              <DescriptionOutlinedIcon />
            </div>

            <div>
              <h1>Discharge Summary</h1>
              <p>
                Prepare the patient's discharge documentation and follow-up
                instructions.
              </p>
            </div>
          </div>
        </div>

        {existingSummary && (
          <div className="summary-saved-badge">
            <CheckCircleOutlineIcon fontSize="small" />
            Saved
          </div>
        )}
      </div>

      <form className="discharge-summary-card" onSubmit={handleSubmit}>
        <div className="summary-card-header">
          <div>
            <h2>Discharge Information</h2>
            <p>
              Enter the details that should be included in the patient's
              discharge record.
            </p>
          </div>
        </div>

        <div className="summary-form-grid">
          <div className="summary-field summary-field-full">
            <div className="summary-field-heading">
              <div className="summary-field-icon">
                <DescriptionOutlinedIcon fontSize="small" />
              </div>

              <div>
                <label htmlFor="discharge-summary" className="required-mark">
                  Discharge Summary *
                </label>

                <span>
                  Summarize the patient's treatment, condition and discharge
                  details.
                </span>
              </div>
            </div>

            <textarea
              id="discharge-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter discharge summary..."
              rows="8"
              required
            />

            <div className="field-footer">
              <span>{summary.length} characters</span>
            </div>
          </div>

          <div className="summary-field summary-field-full">
            <div className="summary-field-heading">
              <div className="summary-field-icon">
                <EventNoteOutlinedIcon fontSize="small" />
              </div>

              <div>
                <label htmlFor="follow-up">Follow-up Instructions</label>

                <span>
                  Add medication, follow-up visit or other patient instructions.
                </span>
              </div>
            </div>

            <textarea
              id="follow-up"
              value={followUpInstructions}
              onChange={(e) => setFollowUpInstructions(e.target.value)}
              placeholder="Enter follow-up instructions..."
              rows="6"
            />

            <div className="field-footer">
              <span>{followUpInstructions.length} characters</span>
            </div>
          </div>
        </div>

        <div className="summary-form-footer">
          <button
            type="button"
            className="summary-cancel-button"
            onClick={() => navigate(`/admissions/${id}`)}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="summary-save-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Discharge Summary"}
          </button>
        </div>
      </form>
    </div>
  );
}
