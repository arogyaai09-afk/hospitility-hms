import React from "react";
import "./Toast.scss";

const toastConfig = {
  success: {
    title: "Success",
    icon: "✓",
  },
  error: {
    title: "Error",
    icon: "!",
  },
  warning: {
    title: "Warning",
    icon: "!",
  },
  info: {
    title: "Information",
    icon: "i",
  },
};

const Toast = ({ message, type = "info", onClose }) => {
  const config = toastConfig[type] || toastConfig.info;

  return (
    <div className={`toast-container toast-${type}`}>
      <div className="toast-icon">
        {config.icon}
      </div>

      <div className="toast-content">
        <div className="toast-title">
          {config.title}
        </div>

        <div className="toast-message">
          {message}
        </div>
      </div>

      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>

      <div className="toast-progress" />
    </div>
  );
};

export default Toast;