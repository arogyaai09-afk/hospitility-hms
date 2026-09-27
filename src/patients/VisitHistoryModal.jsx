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
        .map(([key, value]) => (
          <div className="vh-field" key={key}>
            <span className="vh-field-label">
              {formatLabel(key)}
            </span>

            {renderValue(key, value)}
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
                <h3>Consultation</h3>

                {history?.consultation ? (
                  renderSectionContent(history.consultation)
                ) : (
                  <div className="vh-empty">
                    No consultation recorded
                  </div>
                )}
              </section>

              {/* Prescriptions */}
              <section className="vh-section">
                <h3>Prescriptions</h3>

                {renderSectionContent(
                  history?.prescriptions
                )}
              </section>

              {/* Lab Orders */}
              <section className="vh-section">
                <h3>Lab Orders</h3>

                {renderSectionContent(
                  history?.labOrders
                )}
              </section>

              {/* Reports */}
              <section className="vh-section">
                <h3>Reports</h3>

                {renderSectionContent(
                  history?.reports
                )}
              </section>

              {/* Procedures */}
              <section className="vh-section">
                <h3>Procedures</h3>

                {renderSectionContent(
                  history?.procedures
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