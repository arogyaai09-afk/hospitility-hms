import { useState, useRef, useEffect } from "react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../api/services";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ─── DOWNLOAD ─────────────────────────────────────────────────────────────────────
const downloadExcel = (data) => {
  const excelData = data.map((service) => ({
    "Service Name": service.name,
    Department: service.dept,
    Price: service.price,
    Status: service.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Services");

  XLSX.writeFile(workbook, "services.xlsx");
};

const downloadPDF = (data) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Service List", 14, 15);

  autoTable(doc, {
    startY: 25,
    head: [["Service Name", "Department", "Price", "Status"]],
    body: data.map((service) => [
      service.name,
      service.dept,
      `$${service.price}`,
      service.status,
    ]),
  });

  doc.save("services.pdf");
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const initialServices = [
  {
    id: 1,
    name: "General Consultation",
    dept: "General Medicine",
    price: 200,
    status: "Active",
  },
  {
    id: 2,
    name: "Dental Cleaning",
    dept: "Dentistry",
    price: 180,
    status: "Inactive",
  },
  {
    id: 3,
    name: "Eye Checkup",
    dept: "Ophthalmology",
    price: 150,
    status: "Active",
  },
  { id: 4, name: "X-Ray", dept: "Radiology", price: 80, status: "Active" },
  {
    id: 5,
    name: "Physiotherapy Session",
    dept: "Physiotherapy",
    price: 130,
    status: "Active",
  },
  {
    id: 6,
    name: "Cardiac Screening",
    dept: "Cardiology",
    price: 300,
    status: "Active",
  },
  {
    id: 7,
    name: "Skin Allergy Test",
    dept: "Dermatology",
    price: 220,
    status: "Inactive",
  },
  {
    id: 8,
    name: "Blood Test",
    dept: "Pathology",
    price: 150,
    status: "Active",
  },
  {
    id: 9,
    name: "ENT Consultation",
    dept: "ENT",
    price: 230,
    status: "Active",
  },
  {
    id: 10,
    name: "Nutrition Counseling",
    dept: "Nutrition",
    price: 250,
    status: "Active",
  },
  {
    id: 11,
    name: "Physiotherapy",
    dept: "Physiotherapy",
    price: 160,
    status: "Active",
  },
  {
    id: 12,
    name: "Cardiac Checkup",
    dept: "Cardiology",
    price: 350,
    status: "Active",
  },
];

const DEPARTMENTS = [
  "General Medicine",
  "Dentistry",
  "Ophthalmology",
  "Radiology",
  "Physiotherapy",
  "Cardiology",
  "Dermatology",
  "Pathology",
  "ENT",
  "Nutrition",
  "Orthopedics",
  "Neurology",
];
const SORT_OPTIONS = [
  "Recently Added",
  "Ascending",
  "Descending",
  "Last Month",
  "Last 7 Days",
];

function useOutsideClick(ref, cb) {
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

// ─── NEW SERVICE MODAL ────────────────────────────────────────────────────────
function NewServiceModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [deptOpen, setDeptOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Active");
  const [errors, setErrors] = useState({});

  const submit = () => {
    const e = {};
    if (!name.trim()) e.name = "Service name is required";
    if (!dept) e.dept = "Department is required";
    if (!price || isNaN(price)) e.price = "Valid price is required";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      onAdd({ name: name.trim(), dept, price: Number(price), status });
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          width: 500,
          maxWidth: "95vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          animation: "fadeInScale 0.18s ease",
          overflow: "visible",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
            New Service
          </span>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "20px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Service Name */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                display: "block",
                marginBottom: 6,
              }}
            >
              Service Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
              }}
              style={{
                width: "100%",
                border: `1px solid ${errors.name ? "#ef4444" : "#e2e8f0"}`,
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              placeholder="Enter service name"
            />
            {errors.name && (
              <span
                style={{
                  fontSize: 11,
                  color: "#ef4444",
                  marginTop: 3,
                  display: "block",
                }}
              >
                {errors.name}
              </span>
            )}
          </div>

          {/* Department */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                display: "block",
                marginBottom: 6,
              }}
            >
              Department <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setDeptOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: `1px solid ${errors.dept ? "#ef4444" : "#e2e8f0"}`,
                  borderRadius: 8,
                  padding: "9px 12px",
                  cursor: "pointer",
                  background: "white",
                  userSelect: "none",
                }}
              >
                <span
                  style={{ fontSize: 13, color: dept ? "#1e293b" : "#94a3b8" }}
                >
                  {dept || "Select"}
                </span>
                <KeyboardArrowDownIcon
                  style={{
                    fontSize: 16,
                    color: "#94a3b8",
                    transform: deptOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </div>
              {deptOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 400,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      padding: "9px 14px",
                      fontSize: 13,
                      color: "#94a3b8",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setDept("");
                      setDeptOpen(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    Select
                  </div>
                  {DEPARTMENTS.map((d) => (
                    <div
                      key={d}
                      onClick={() => {
                        setDept(d);
                        setDeptOpen(false);
                        if (errors.dept) setErrors((p) => ({ ...p, dept: "" }));
                      }}
                      style={{
                        padding: "9px 14px",
                        fontSize: 13,
                        cursor: "pointer",
                        color: "#475569",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.dept && (
              <span
                style={{
                  fontSize: 11,
                  color: "#ef4444",
                  marginTop: 3,
                  display: "block",
                }}
              >
                {errors.dept}
              </span>
            )}
          </div>

          {/* Price */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                display: "block",
                marginBottom: 6,
              }}
            >
              Price <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                $
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((p) => ({ ...p, price: "" }));
                }}
                style={{
                  width: "100%",
                  border: `1px solid ${errors.price ? "#ef4444" : "#e2e8f0"}`,
                  borderRadius: 8,
                  padding: "9px 12px 9px 26px",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                placeholder="0"
                min="0"
              />
            </div>
            {errors.price && (
              <span
                style={{
                  fontSize: 11,
                  color: "#ef4444",
                  marginTop: 3,
                  display: "block",
                }}
              >
                {errors.price}
              </span>
            )}
          </div>

          {/* Status toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
              Status
            </label>
            {["Active", "Inactive"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: "5px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background:
                    status === s
                      ? s === "Active"
                        ? "#dcfce7"
                        : "#fee2e2"
                      : "#f1f5f9",
                  color:
                    status === s
                      ? s === "Active"
                        ? "#16a34a"
                        : "#dc2626"
                      : "#94a3b8",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 24px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 24px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              color: "#475569",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            style={{
              padding: "9px 24px",
              borderRadius: 8,
              border: "none",
              background: "#3b82f6",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
          >
            Add Service
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SERVICES FILTER PANEL ────────────────────────────────────────────────────

// Same searchable tag-input pattern used in DoctorList
function FilterField({ label, values, onRemove, onAdd, options, placeholder }) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOptions = options.filter((option) => {
    const value = typeof option === "string" ? option : option.label;

    return (
      value.toLowerCase().includes(input.toLowerCase()) &&
      !values.includes(value)
    );
  });

  const addValue = (value) => {
    if (!value || values.includes(value)) return;

    onAdd(value);
    setInput("");
    setOpen(false);
  };

  const reset = () => {
    values.forEach((value) => onRemove(value));
    setInput("");
    setOpen(false);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Label + Reset */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#334155",
          }}
        >
          {label}
        </span>

        <span
          onClick={reset}
          style={{
            fontSize: 11,
            color: "#3b82f6",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Reset
        </span>
      </div>

      {/* Search / Selected Tags Box */}
      <div
        style={{
          position: "relative",
          minHeight: 40,
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 5,
          padding: "5px 10px",
          cursor: "text",
        }}
        onClick={() => setOpen(true)}
      >
        {/* Selected Tags */}
        {values.map((value) => (
          <span
            key={value}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "#eff6ff",
              color: "#3b82f6",
              borderRadius: 20,
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {value}

            <span
              onClick={(event) => {
                event.stopPropagation();
                onRemove(value);
              }}
              style={{
                cursor: "pointer",
                fontSize: 12,
                lineHeight: 1,
              }}
            >
              ×
            </span>
          </span>
        ))}

        {/* Search Input */}
        <input
          type="text"
          value={input}
          placeholder={values.length === 0 ? placeholder : ""}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setInput(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              if (filteredOptions.length > 0) {
                const first =
                  typeof filteredOptions[0] === "string"
                    ? filteredOptions[0]
                    : filteredOptions[0].label;

                addValue(first);
              }
            }

            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          style={{
            flex: "1 1 80px",
            minWidth: 80,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 13,
            color: "#334155",
            padding: "4px 0",
            fontFamily: "inherit",
          }}
        />

        {/* Dropdown */}
        {open && filteredOptions.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "calc(100% + 4px)",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
              zIndex: 500,
              maxHeight: 180,
              overflowY: "auto",
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {filteredOptions.map((option) => {
              const value = typeof option === "string" ? option : option.label;

              return (
                <div
                  key={value}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    addValue(value);
                  }}
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: "#475569",
                    cursor: "pointer",
                    background: "#fff",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "#fff";
                  }}
                >
                  {value}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceFilterPanel({ appliedFilters, onClose, onApply }) {
  const [filters, setFilters] = useState(appliedFilters);

  const addValue = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: [...current[key], value],
    }));
  };

  const removeValue = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: current[key].filter((item) => item !== value),
    }));
  };

  const resetGroup = (key) => {
    setFilters((current) => ({
      ...current,
      [key]: Array.isArray(current[key]) ? [] : "",
    }));
  };

  const clearAll = () => {
    setFilters({
      serviceName: [],
      department: [],
      minAmount: 0,
      maxAmount: 1000,
      status: [],
    });
  };

  const serviceOptions = [
    ...new Set(initialServices.map((service) => service.name)),
  ];

  const departmentOptions = [
    ...new Set(initialServices.map((service) => service.dept)),
  ];

  const statusOptions = ["Active", "Inactive"];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.18)",
          zIndex: 200,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 320,
          height: "100vh",
          background: "white",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 40px rgba(0,0,0,0.12)",
          animation: "slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)",
          fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
            Filter
          </span>

          <span
            onClick={clearAll}
            style={{
              fontSize: 13,
              color: "#ef4444",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear All
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <FilterField
            label="Service Name"
            values={filters.serviceName}
            onAdd={(value) => addValue("serviceName", value)}
            onRemove={(value) => removeValue("serviceName", value)}
            options={serviceOptions}
            placeholder="Search service..."
          />

          <FilterField
            label="Department"
            values={filters.department}
            onAdd={(value) => addValue("department", value)}
            onRemove={(value) => removeValue("department", value)}
            options={departmentOptions}
            placeholder="Search department..."
          />

          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                Amount
              </span>

              <span
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    minAmount: 0,
                    maxAmount: 1000,
                  }))
                }
                style={{
                  fontSize: 11,
                  color: "#3b82f6",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Reset
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 11, color: "#94a3b8" }}>$0</span>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 6,
                  }}
                >
                  ${filters.minAmount}
                </span>

                <span
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 6,
                  }}
                >
                  ${filters.maxAmount}
                </span>
              </div>

              <span style={{ fontSize: 11, color: "#94a3b8" }}>$1,000</span>
            </div>

            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={filters.minAmount}
              onChange={(event) => {
                const value = Number(event.target.value);

                setFilters((current) => ({
                  ...current,
                  minAmount: Math.min(value, current.maxAmount - 10),
                }));
              }}
              style={{
                width: "100%",
                accentColor: "#3b82f6",
                marginBottom: 6,
                cursor: "pointer",
              }}
            />

            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={filters.maxAmount}
              onChange={(event) => {
                const value = Number(event.target.value);

                setFilters((current) => ({
                  ...current,
                  maxAmount: Math.max(value, current.minAmount + 10),
                }));
              }}
              style={{
                width: "100%",
                accentColor: "#3b82f6",
                cursor: "pointer",
              }}
            />

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: 600,
                color: "#475569",
              }}
            >
              Range : ${filters.minAmount} - ${filters.maxAmount}
            </div>
          </div>

          <FilterField
            label="Status"
            values={filters.status}
            onAdd={(value) => addValue("status", value)}
            onRemove={(value) => removeValue("status", value)}
            options={statusOptions}
            placeholder="Search status..."
          />
        </div>

        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "white",
              color: "#1e293b",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Close
          </button>

          <button
            onClick={() => {
              onApply(filters);
              onClose();
            }}
            style={{
              flex: 1,
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Filter
          </button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Services() {
  const [services, setServices] = useState(initialServices);
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortVal, setSortVal] = useState("Recently Added");
  const [openMenu, setOpenMenu] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    serviceName: [],
    department: [],
    minAmount: 0,
    maxAmount: 1000,
    status: [],
  });

  const exportRef = useRef(null);
  const sortRef = useRef(null);

  // Fetch services from backend API on component mount

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);

      const response = await getServices();

      const backendData = response?.data?.data || [];

      if (Array.isArray(backendData) && backendData.length > 0) {
        setServices(backendData);
        setUsingMockData(false);
      } else {
        setServices(initialServices);
        setUsingMockData(true);
      }
    } catch (error) {
      console.log("Service API not available yet:", error);

      setServices(initialServices);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  // close dropdowns on outside click
  useEffect(() => {
    const h = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      setOpenMenu(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = services
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.dept.toLowerCase().includes(search.toLowerCase());

      const matchesServiceName =
        appliedFilters.serviceName.length === 0 ||
        appliedFilters.serviceName.includes(s.name);

      const matchesDepartment =
        appliedFilters.department.length === 0 ||
        appliedFilters.department.includes(s.dept);

      const matchesAmount =
        s.price >= appliedFilters.minAmount &&
        s.price <= appliedFilters.maxAmount;

      const matchesStatus =
        appliedFilters.status.length === 0 ||
        appliedFilters.status.includes(s.status);

      return (
        matchesSearch &&
        matchesServiceName &&
        matchesDepartment &&
        matchesAmount &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      if (sortVal === "Ascending") {
        return a.name.localeCompare(b.name);
      }

      if (sortVal === "Descending") {
        return b.name.localeCompare(a.name);
      }

      return 0;
    });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const pageData = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleAdd = (svc) => {
    setServices((p) => [...p, { id: p.length + 1, ...svc }]);
  };

  const handleDelete = (id) => {
    setServices((p) => p.filter((s) => s.id !== id));
    setOpenMenu(null);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif" }}>
      {/* ── Page Top ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Services
          </h1>
          {usingMockData && (
            <span
              style={{
                background: "#fef3c7",
                color: "#92400e",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: 20,
                border: "1px solid #fde68a",
              }}
            >
              MOCK DATA
            </span>
          )}
          <span
            style={{
              background: "#eff6ff",
              color: "#3b82f6",
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              border: "1px solid #bfdbfe",
            }}
          >
            Total Services : {filtered.length}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Export */}
          <div ref={exportRef} style={{ position: "relative" }}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 500,
                color: "#1e293b",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Export{" "}
              <KeyboardArrowDownIcon
                style={{ fontSize: 15, color: "#94a3b8" }}
              />
            </button>
            {exportOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  minWidth: 180,
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    icon: (
                      <PictureAsPdfIcon
                        style={{ fontSize: 16, color: "#ef4444" }}
                      />
                    ),
                    label: "Download as PDF",
                  },
                  {
                    icon: (
                      <TableChartIcon
                        style={{ fontSize: 16, color: "#10b981" }}
                      />
                    ),
                    label: "Download as Excel",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (item.label === "Download as PDF") {
                        downloadPDF(filtered);
                      }

                      if (item.label === "Download as Excel") {
                        downloadExcel(filtered);
                      }

                      setExportOpen(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    {item.icon} {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Service */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
          >
            <AddIcon style={{ fontSize: 16 }} /> New Services
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "8px 14px",
            width: 240,
          }}
        >
          <SearchIcon style={{ fontSize: 15, color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "#1e293b",
              fontFamily: "inherit",
              width: "100%",
              background: "transparent",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Filters */}
          <button
            onClick={() => setShowFilter(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: "#1e293b",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <FilterListIcon style={{ fontSize: 15, color: "#64748b" }} />{" "}
            Filters
          </button>

          {/* Sort */}
          <div ref={sortRef} style={{ position: "relative" }}>
            <button
              onClick={() => setSortOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 500,
                color: "#1e293b",
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Sort By : {sortVal}{" "}
              <KeyboardArrowDownIcon
                style={{ fontSize: 15, color: "#94a3b8" }}
              />
            </button>
            {sortOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  minWidth: 180,
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setSortVal(opt);
                      setSortOpen(false);
                    }}
                    style={{
                      padding: "10px 16px",
                      fontSize: 13,
                      cursor: "pointer",
                      color: sortVal === opt ? "#3b82f6" : "#475569",
                      fontWeight: sortVal === opt ? 600 : 400,
                      background: sortVal === opt ? "#eff6ff" : "white",
                    }}
                    onMouseEnter={(e) => {
                      if (sortVal !== opt)
                        e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (sortVal !== opt)
                        e.currentTarget.style.background = "white";
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {["Service Name", "Department", "Price", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "11px 16px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.map((svc) => (
              <tr
                key={svc.id}
                style={{ borderBottom: "1px solid #e2e8f0" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fafafa")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td
                  style={{
                    padding: "13px 16px",
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 500,
                  }}
                >
                  {svc.name}
                </td>
                <td
                  style={{
                    padding: "13px 16px",
                    fontSize: 13,
                    color: "#475569",
                  }}
                >
                  {svc.dept}
                </td>
                <td
                  style={{
                    padding: "13px 16px",
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  ${svc.price}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background:
                        svc.status === "Active" ? "#dcfce7" : "#fee2e2",
                      color: svc.status === "Active" ? "#16a34a" : "#dc2626",
                      border: `1px solid ${svc.status === "Active" ? "#bbf7d0" : "#fecaca"}`,
                    }}
                  >
                    {svc.status}
                  </span>
                </td>
                <td
                  style={{ padding: "13px 16px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === svc.id ? null : svc.id)
                      }
                      style={{
                        width: 28,
                        height: 28,
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        background: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#64748b",
                      }}
                    >
                      <MoreVertIcon style={{ fontSize: 14 }} />
                    </button>
                    {openMenu === svc.id && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "calc(100% + 4px)",
                          background: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                          minWidth: 130,
                          zIndex: 50,
                          overflow: "hidden",
                        }}
                      >
                        {[
                          { label: "Edit", action: () => setOpenMenu(null) },
                          {
                            label: "Delete",
                            action: () => handleDelete(svc.id),
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            onClick={item.action}
                            style={{
                              padding: "9px 16px",
                              fontSize: 13,
                              color:
                                item.label === "Delete" ? "#ef4444" : "#475569",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                item.label === "Delete" ? "#fff1f2" : "#f8fafc")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "")
                            }
                          >
                            {item.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Row Per Page
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                background: "white",
                cursor: "pointer",
              }}
            >
              {[5, 10, 15, 20].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            Entries
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 30,
                height: 30,
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                background: "white",
                cursor: page === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              <ChevronLeftIcon style={{ fontSize: 14 }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 30,
                  height: 30,
                  border: `1px solid ${page === p ? "#3b82f6" : "#e2e8f0"}`,
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  background: page === p ? "#3b82f6" : "white",
                  color: page === p ? "white" : "#64748b",
                  fontWeight: page === p ? 700 : 400,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: 30,
                height: 30,
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                background: "white",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              <ChevronRightIcon style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <NewServiceModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}

      {/* Filter Panel */}
      {showFilter && (
        <ServiceFilterPanel
          appliedFilters={appliedFilters}
          onClose={() => setShowFilter(false)}
          onApply={(filters) => {
            setAppliedFilters(filters);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
