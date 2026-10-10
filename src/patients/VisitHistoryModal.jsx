// VisitHistoryModal.jsx

const formatLabel = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (
    key?.toLowerCase().includes("date") ||
    key?.toLowerCase().includes("at")
  ) {
    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      return date.toLocaleString("en-GB");
    }
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return value;
};

const hiddenFields = ["_id", "__v", "tenantId"];

const renderValue = (key, value) => {
  if (value === null || value === undefined || value === "") {
    return <span className="vh-value">N/A</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="vh-value">No records</span>;
    }

    return (
      <div className="vh-nested-list">
        {value.map((item, index) => (
          <div
            key={item?._id || item?.id || index}
            className="vh-nested-item"
          >
            {typeof item === "object" ? (
              renderObject(item)
            ) : (
              <span className="vh-value">{String(item)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="vh-nested-object">
        {renderObject(value)}
      </div>
    );
  }

  return (
    <span className="vh-value">
      {formatValue(key, value)}
    </span>
  );
};

const renderObject = (obj) => {
  if (!obj || typeof obj !== "object") {
    return null;
  }

  return (
    <div className="vh-record-grid">
      {Object.entries(obj)
        .filter(([key]) => !hiddenFields.includes(key))
        .filter(
          ([key]) =>
            ![
              "patientId",
              "visitId",
              "tenantId",
              "createdBy",
              "updatedBy",
              "doctorId",
            ].includes(key)
        )
        .map(([key, value]) => (
          <div className="vh-field" key={key}>
            <span className="vh-field-label">
              {formatLabel(key)}
            </span>

            <div className="vh-field-value">
              {renderValue(key, value)}
            </div>
          </div>
        ))}
    </div>
  );
};

const renderSectionContent = (data, emptyMessage = "No records") => {
  if (!data) {
    return <div className="vh-empty">{emptyMessage}</div>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <div className="vh-empty">{emptyMessage}</div>;
    }

    return (
      <div className="vh-record-list">
        {data.map((item, index) => (
          <div
            key={item?._id || item?.id || index}
            className="vh-record-card"
          >
            {typeof item === "object"
              ? renderObject(item)
              : (
                <span className="vh-value">
                  {String(item)}
                </span>
              )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === "object") {
    return (
      <div className="vh-record-card">
        {renderObject(data)}
      </div>
    );
  }

  return (
    <div className="vh-record-card">
      <span className="vh-value">{String(data)}</span>
    </div>
  );
};

export default function VisitHistoryModal({
  history,
  loading,
  onClose,
}) {
  if (!history && !loading) {
    return null;
  }

  const visit = history?.visit;

  const doctor = visit?.doctorId;

  return (
    <div
      className="vh-overlay"
      onClick={onClose}
    >
      <div
        className="vh-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vh-header">
          <div>
            <h2>Visit History</h2>

            <div className="vh-subtitle">
              {visit?.visitCode || "Visit"}
            </div>
          </div>

          <button
            type="button"
            className="vh-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="vh-content">
          {loading ? (
            <div className="vh-loading">
              Loading visit history...
            </div>
          ) : (
            <>
              {/* Visit Information */}
              <section className="vh-section">
                <h3>Visit Information</h3>

                <div className="vh-info-grid">
                  <div>
                    <span>Visit Code</span>
                    <strong>
                      {visit?.visitCode || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Visit Type</span>
                    <strong>
                      {visit?.visitType || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>
                      {visit?.status || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Visit Reason</span>
                    <strong>
                      {visit?.visitReason || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Doctor</span>
                    <strong>
                      {typeof doctor === "object"
                        ? doctor?.name || "N/A"
                        : doctor || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Created At</span>
                    <strong>
                      {visit?.createdAt
                        ? new Date(
                            visit.createdAt
                          ).toLocaleString("en-GB")
                        : "N/A"}
                    </strong>
                  </div>

                  {visit?.checkedInAt && (
                    <div>
                      <span>Checked In At</span>
                      <strong>
                        {new Date(
                          visit.checkedInAt
                        ).toLocaleString("en-GB")}
                      </strong>
                    </div>
                  )}
                </div>
              </section>

              {/* Consultation */}
              <section className="vh-section">
  <div className="vh-section-header">
    <div>
      <h3>Consultation</h3>
      <p>Clinical information recorded during this visit.</p>
    </div>
  </div>

  {history?.consultation ? (
    <div className="vh-consultation-grid">
      {[
        ["Chief Complaint", history.consultation.chiefComplaint],
        ["Symptoms", history.consultation.symptoms],
        ["Assessment", history.consultation.assessment],
        ["Diagnosis", history.consultation.diagnosis],
        ["Examination", history.consultation.examination],
        ["Treatment Plan", history.consultation.treatmentPlan],
        ["Clinical Notes", history.consultation.clinicalNotes],
        ["Follow-up Date", history.consultation.followUpDate],
      ].map(([label, value]) => (
        <div className="vh-consultation-item" key={label}>
          <span>{label}</span>
          <strong>
            {value === null ||
            value === undefined ||
            value === ""
              ? "N/A"
              : label === "Follow-up Date"
  ? new Date(value).toLocaleDateString("en-GB")
  : formatValue(label, value)}
          </strong>
        </div>
      ))}
    </div>
  ) : (
    <div className="vh-empty">
      No consultation recorded
    </div>
  )}
</section>

              {/* Prescriptions */}
              {/* Prescriptions */}
<section className="vh-section">
  <div className="vh-section-header">
    <div>
      <h3>Prescriptions</h3>
      <p>Medicines prescribed during this visit.</p>
    </div>
  </div>

  {history?.prescriptions?.some(
    (prescription) =>
      Array.isArray(prescription?.items) &&
      prescription.items.length > 0
  ) ? (
    <div className="vh-data-table">
      <div className="vh-table-header">
        <span>Medicine</span>
        <span>Dosage</span>
        <span>Frequency</span>
        <span>Duration</span>
      </div>

      {history.prescriptions.flatMap((prescription, prescriptionIndex) =>
        Array.isArray(prescription?.items)
          ? prescription.items.map((item, itemIndex) => (
              <div
                className="vh-table-row"
                key={
                  item?._id ||
                  item?.id ||
                  `${prescriptionIndex}-${itemIndex}`
                }
              >
                <strong>
                  {item?.medicineName || "N/A"}
                </strong>

                <span>
                  {item?.dosage || "N/A"}
                </span>

                <span>
                  {item?.frequency || "N/A"}
                </span>

                <span>
                  {item?.duration || "N/A"}
                </span>
              </div>
            ))
          : []
      )}
    </div>
  ) : (
    <div className="vh-empty">
      No prescriptions recorded.
    </div>
  )}
</section>

              {/* Lab Orders */}
              <section className="vh-section">
  <div className="vh-section-header">
    <div>
      <h3>Lab Orders</h3>
      <p>Laboratory investigations ordered during this visit.</p>
    </div>
  </div>

  {history?.labOrders?.length > 0 ? (
    <div className="vh-data-table">
      <div className="vh-table-header">
        <span>Test</span>
        <span>Instructions</span>
        <span>Status</span>
        <span>Ordered At</span>
      </div>

      {history.labOrders.map((item, index) => (
        <div className="vh-table-row" key={item?._id || item?.id || index}>
          <strong>{item?.testName || "N/A"}</strong>
          <span>{item?.instructions || "N/A"}</span>
          <span>
            <span className={`vh-status ${item?.status || ""}`}>
              {item?.status || "N/A"}
            </span>
          </span>
          <span>
            {item?.orderedAt
              ? new Date(item.orderedAt).toLocaleString("en-GB")
              : "N/A"}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div className="vh-empty">No lab orders recorded.</div>
  )}
</section>

              {/* Reports */}
              {/* Lab Reports */}
<section className="vh-section">
  <div className="vh-section-header">
    <div>
      <h3>Lab Reports</h3>
      <p>Laboratory results reported for this visit.</p>
    </div>
  </div>

  {history?.reports?.length > 0 ? (
    <div className="vh-data-table">
      <div className="vh-table-header">
        <span>Test</span>
        <span>Result</span>
        <span>Reported At</span>
        <span>Attachment</span>
      </div>

      {history.reports.map((item, index) => {
        const reportLabOrderId =
          typeof item?.labOrderId === "object"
            ? item.labOrderId?._id || item.labOrderId?.id
            : item?.labOrderId;

        const matchedLabOrder = history?.labOrders?.find(
          (order) =>
            String(order?._id || order?.id) ===
            String(reportLabOrderId)
        );

        return (
          <div
            className="vh-table-row"
            key={item?._id || item?.id || index}
          >
            <strong>
              {matchedLabOrder?.testName || "Lab Test"}
            </strong>

            <span>
              {item?.resultText || "N/A"}
            </span>

            <span>
              {item?.reportedAt
                ? new Date(item.reportedAt).toLocaleString("en-GB")
                : "N/A"}
            </span>

            <span>
              {item?.attachmentUrl ? (
                <a
                  href={item.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="vh-attachment"
                >
                  View Attachment
                </a>
              ) : (
                "N/A"
              )}
            </span>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="vh-empty">
      No lab reports recorded.
    </div>
  )}
</section>

              {/* Procedures */}
              <section className="vh-section">
  <div className="vh-section-header">
    <div>
      <h3>Procedures</h3>
      <p>Procedures planned or performed during this visit.</p>
    </div>
  </div>

  {history?.procedures?.length > 0 ? (
    <div className="vh-data-table">
      <div className="vh-table-header">
        <span>Procedure</span>
        <span>Status</span>
        <span>Performed At</span>
        <span>Outcome</span>
      </div>

      {history.procedures.map((item, index) => (
        <div className="vh-table-row" key={item?._id || item?.id || index}>
          <strong>{item?.procedureName || "N/A"}</strong>

          <span>
            <span className={`vh-status ${item?.status || ""}`}>
              {item?.status || "N/A"}
            </span>
          </span>

          <span>
            {item?.performedAt
              ? new Date(item.performedAt).toLocaleString("en-GB")
              : "N/A"}
          </span>

          <span>{item?.outcome || "N/A"}</span>
        </div>
      ))}
    </div>
  ) : (
    <div className="vh-empty">No procedures recorded.</div>
  )}
</section>

              {/* Notes */}
              <section className="vh-section">
                <h3>Clinical Notes</h3>

                {renderSectionContent(
                  history?.notes
                )}
              </section>

              {/* Financial */}
              <div className="vh-two-column">
                <section className="vh-section">
                  <h3>Invoices</h3>

                  {renderSectionContent(
                    history?.invoices
                  )}
                </section>

                <section className="vh-section">
                  <h3>Payments</h3>

                  {renderSectionContent(
                    history?.payments
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}