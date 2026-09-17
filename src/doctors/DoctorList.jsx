import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import { getDoctors } from "../api/doctors";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const doctorsData = [
  {
    id: 1,
    name: "Dr. Mick Thompson",
    role: "Cardiologist",
    dept: "Cardiology",
    phone: "+1 54554 54584",
    email: "mick@example.com",
    fee: 458,
    status: "Available",
    avail: "Mon, 20 Jan 2025",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Dr. Sarah Johnson",
    role: "Orthopedic Surgeon",
    dept: "Orthopedics",
    phone: "+1 43554 54584",
    email: "sarah@example.com",
    fee: 512,
    status: "Available",
    avail: "Wed, 22 Jan 2025",
    color: "#10b981",
  },
  {
    id: 3,
    name: "Dr. Emily Carter",
    role: "Pediatrician",
    dept: "Pediatrics",
    phone: "+1 47554 54585",
    email: "emily@example.com",
    fee: 635,
    status: "Available",
    avail: "Fri, 24 Jan 2025",
    color: "#8b5cf6",
  },
  {
    id: 4,
    name: "Dr. David Lee",
    role: "Gynecologist",
    dept: "Gynecology",
    phone: "+1 54114 54586",
    email: "david@example.com",
    fee: 478,
    status: "Available",
    avail: "Tue, 21 Jan 2025",
    color: "#f59e0b",
  },
  {
    id: 5,
    name: "Dr. Anna Kim",
    role: "Psychiatrist",
    dept: "Psychiatry",
    phone: "+1 51247 54587",
    email: "anna@example.com",
    fee: 550,
    status: "Available",
    avail: "Mon, 27 Jan 2025",
    color: "#0d9488",
  },
  {
    id: 6,
    name: "Dr. John Smith",
    role: "Neurosurgeon",
    dept: "Neurology",
    phone: "+1 41452 54588",
    email: "john@example.com",
    fee: 703,
    status: "Unavailable",
    avail: "Thu, 30 Jan 2025",
    color: "#ef4444",
  },
  {
    id: 7,
    name: "Dr. Lisa White",
    role: "Oncologist",
    dept: "Oncology",
    phone: "+1 51425 54589",
    email: "lisa@example.com",
    fee: 420,
    status: "Available",
    avail: "Sat, 25 Jan 2025",
    color: "#ec4899",
  },
  {
    id: 8,
    name: "Dr. Patricia Brown",
    role: "Pulmonologist",
    dept: "Pulmonology",
    phone: "+1 62458 45845",
    email: "patricia@example.com",
    fee: 390,
    status: "Available",
    avail: "Sun, 01 Feb 2025",
    color: "#6366f1",
  },
  {
    id: 9,
    name: "Dr. Rachel Green",
    role: "Urologist",
    dept: "Urology",
    phone: "+1 61422 45214",
    email: "rachel@example.com",
    fee: 470,
    status: "Available",
    avail: "Tue, 28 Jan 2025",
    color: "#14b8a6",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: "Recently Added", value: "recent" },
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
];

const AMOUNT_OPTIONS = [
  { label: "Under $500", value: "under500" },
  { label: "$501 - $1000", value: "501-1000" },
  { label: "Above $1000", value: "above1000" },
];

const STATUS_OPTIONS = ["Available", "Unavailable"];

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY FILTERS
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FILTERS = {
  doctor: [],
  designation: [],
  department: [],
  amount: [],
  status: [],
  date: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ name, color, size = 38 }) {
  const initials = name
    .split(" ")
    .slice(1, 3)
    .map((word) => word[0])
    .join("");

  return (
    <div
      className="doc-avatar"
      style={{
        width: size,
        height: size,
        background: color + "22",
        color: color,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.34,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTSIDE CLICK
// ─────────────────────────────────────────────────────────────────────────────

function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [ref, callback]);
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER FIELD
// ─────────────────────────────────────────────────────────────────────────────

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

  return (
    <div className="fp-group">
      <div className="fp-label">
        {label}

        <span
          className="fp-reset"
          onClick={() => {
            values.forEach((value) => onRemove(value));
            setInput("");
          }}
        >
          Reset
        </span>
      </div>

      <div
        className="fp-tag-input"
        style={{
          position: "relative",
          minHeight: "42px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
        }}
      >
        {values.map((value) => (
          <span className="fp-tag" key={value}>
            {value}

            <span
              className="fp-tag-remove"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(value);
              }}
            >
              ×
            </span>
          </span>
        ))}

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
              } else if (input.trim()) {
                addValue(input.trim());
              }
            }

            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          style={{
            border: "none",
            outline: "none",
            flex: "1 1 100px",
            minWidth: "90px",
            background: "transparent",
            padding: "4px 0",
          }}
        />

        {open && filteredOptions.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "calc(100% + 5px)",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              zIndex: 100,
              maxHeight: "180px",
              overflowY: "auto",
            }}
          >
            {filteredOptions.map((option) => {
              const value = typeof option === "string" ? option : option.label;

              return (
                <div
                  key={value}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addValue(value)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontSize: "13px",
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

// ─────────────────────────────────────────────────────────────────────────────
// FILTER PANEL
// ─────────────────────────────────────────────────────────────────────────────

function FilterPanel({ appliedFilters, onApply, onClose, doctors }) {
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
    setFilters({ ...EMPTY_FILTERS });
  };

  // Options now come from currently loaded doctors
  const uniqueDoctors = [...new Set(doctors.map((doctor) => doctor.name))];

  const uniqueRoles = [...new Set(doctors.map((doctor) => doctor.role))];

  const uniqueDepartments = [...new Set(doctors.map((doctor) => doctor.dept))];

  return (
    <>
      <div className="filter-overlay" onClick={onClose} />

      <div className="filter-panel">
        {/* HEADER */}
        <div className="fp-header">
          <span className="fp-title">Filter</span>

          <span className="fp-clear" onClick={clearAll}>
            Clear All
          </span>
        </div>

        {/* BODY */}
        <div className="fp-body">
          <FilterField
            label="Doctor"
            values={filters.doctor}
            onAdd={(value) => addValue("doctor", value)}
            onRemove={(value) => removeValue("doctor", value)}
            options={uniqueDoctors}
            placeholder="Search doctor..."
          />

          <FilterField
            label="Designation"
            values={filters.designation}
            onAdd={(value) => addValue("designation", value)}
            onRemove={(value) => removeValue("designation", value)}
            options={uniqueRoles}
            placeholder="Search designation..."
          />

          <FilterField
            label="Department"
            values={filters.department}
            onAdd={(value) => addValue("department", value)}
            onRemove={(value) => removeValue("department", value)}
            options={uniqueDepartments}
            placeholder="Search department..."
          />

          <FilterField
            label="Amount"
            values={filters.amount}
            onAdd={(value) => addValue("amount", value)}
            onRemove={(value) => removeValue("amount", value)}
            options={AMOUNT_OPTIONS}
            placeholder="Select amount..."
          />

          <FilterField
            label="Status"
            values={filters.status}
            onAdd={(value) => addValue("status", value)}
            onRemove={(value) => removeValue("status", value)}
            options={STATUS_OPTIONS}
            placeholder="Select status..."
          />

          {/* DATE */}
          <div className="fp-group">
            <div className="fp-label">
              Date
              <span className="fp-reset" onClick={() => resetGroup("date")}>
                Reset
              </span>
            </div>

            <input
              type="date"
              className="fp-date-input"
              value={filters.date}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="fp-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn-apply"
            onClick={() => {
              onApply(filters);
              onClose();
            }}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DOCTORS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Doctors() {
  const navigate = useNavigate();

  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");

  const [showFilter, setShowFilter] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  const [sortOpen, setSortOpen] = useState(false);
  const [sortVal, setSortVal] = useState("recent");

  const [exportOpen, setExportOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  // ───────────────────────────────────────────────────────────────────────────
  // 3 DOT DELETE HANDLER
  // ───────────────────────────────────────────────────────────────────────────

  const handleDeleteDoctor = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this doctor?",
    );

    if (!confirmed) return;

    // Save deleted doctor IDs in browser
    const deletedDoctors = JSON.parse(
      localStorage.getItem("deletedDoctors") || "[]",
    );

    if (!deletedDoctors.includes(String(id))) {
      deletedDoctors.push(String(id));
    }

    localStorage.setItem("deletedDoctors", JSON.stringify(deletedDoctors));

    // Remove immediately from current screen
    setDoctors((currentDoctors) =>
      currentDoctors.filter((doctor) => String(doctor.id) !== String(id)),
    );

    setOpenMenu(null);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // BACKEND / MOCK DATA STATE
  // ───────────────────────────────────────────────────────────────────────────

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  const sortRef = useRef();
  const exportRef = useRef();

  useOutsideClick(sortRef, () => setSortOpen(false));
  useOutsideClick(exportRef, () => setExportOpen(false));

  // ───────────────────────────────────────────────────────────────────────────
  // APPLY STORED EDITS
  // ───────────────────────────────────────────────────────────────────────────

  const applyStoredEdits = (doctorList) => {
    const editedDoctors = JSON.parse(
      localStorage.getItem("editedDoctors") || "{}",
    );

    return doctorList.map((doctor) => {
      const edited = editedDoctors[doctor.id];

      if (!edited) {
        return doctor;
      }

      return {
        ...doctor,
        ...edited,
      };
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // APPLY DELETED DOCTORS
  // ───────────────────────────────────────────────────────────────────────────

  const applyDeletedDoctors = (doctorList) => {
    const deletedDoctors = JSON.parse(
      localStorage.getItem("deletedDoctors") || "[]",
    );

    return doctorList.filter(
      (doctor) => !deletedDoctors.includes(String(doctor.id)),
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // FETCH DOCTORS FROM BACKEND
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);

        const response = await getDoctors();

        /*
         * Backend response can be:
         *
         * response.data = [...]
         *
         * OR
         *
         * response.data = {
         *   data: [...]
         * }
         *
         * So we safely handle both.
         */
        const payload = response?.data;

        const backendDoctors = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        // Backend data available
        if (backendDoctors.length > 0) {
          const normalizedDoctors = backendDoctors.map((doctor, index) => {
            const mock = doctorsData[index % doctorsData.length];

            return {
              // Backend ID is important for Doctor Detail route
              id: doctor._id || doctor.id || mock.id,

              // Backend fields
              name: doctor.name || mock.name,

              // Backend specialization is used for both
              // Designation and Department
              role: doctor.specialization || mock.role,

              dept: doctor.specialization || mock.dept,

              phone: doctor.phone || mock.phone,

              email: doctor.email || doctor.userId?.email || mock.email,

              fee: doctor.fees ?? mock.fee,
              // These remain MOCK for now
              status: mock.status,
              avail: mock.avail,

              color: mock.color,
            };
          });

          setDoctors(applyDeletedDoctors(applyStoredEdits(normalizedDoctors)));
          setUsingMockData(false);
        } else {
          // Backend empty → MOCK DATA
          setDoctors(applyDeletedDoctors(applyStoredEdits(doctorsData)));
          setUsingMockData(true);
        }
      } catch (error) {
        console.error("Doctor API Error:", error);

        // API error → MOCK DATA
        setDoctors(applyDeletedDoctors(applyStoredEdits(doctorsData)));
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // FILTER DATA
  // ───────────────────────────────────────────────────────────────────────────

  const filtered = doctors
    .filter((doctor) => {
      // Main search bar
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        doctor.name.toLowerCase().includes(searchText) ||
        doctor.role.toLowerCase().includes(searchText) ||
        doctor.dept.toLowerCase().includes(searchText) ||
        doctor.email.toLowerCase().includes(searchText) ||
        doctor.phone.toLowerCase().includes(searchText);

      if (!matchesSearch) return false;

      // Doctor filter
      if (
        appliedFilters.doctor.length > 0 &&
        !appliedFilters.doctor.includes(doctor.name)
      ) {
        return false;
      }

      // Designation filter
      if (
        appliedFilters.designation.length > 0 &&
        !appliedFilters.designation.includes(doctor.role)
      ) {
        return false;
      }

      // Department filter
      if (
        appliedFilters.department.length > 0 &&
        !appliedFilters.department.includes(doctor.dept)
      ) {
        return false;
      }

      // Status filter
      if (
        appliedFilters.status.length > 0 &&
        !appliedFilters.status.includes(doctor.status)
      ) {
        return false;
      }

      // Amount filter
      if (appliedFilters.amount.length > 0) {
        const amountMatches = appliedFilters.amount.some((range) => {
          if (range === "Under $500") {
            return doctor.fee < 500;
          }

          if (range === "$501 - $1000") {
            return doctor.fee >= 501 && doctor.fee <= 1000;
          }

          if (range === "Above $1000") {
            return doctor.fee > 1000;
          }

          return true;
        });

        if (!amountMatches) return false;
      }

      // Date filter
      if (appliedFilters.date) {
        const selectedDate = new Date(`${appliedFilters.date}T00:00:00`);

        const doctorDate = new Date(doctor.avail);

        if (
          Number.isNaN(selectedDate.getTime()) ||
          Number.isNaN(doctorDate.getTime())
        ) {
          return false;
        }

        const sameDate =
          selectedDate.getFullYear() === doctorDate.getFullYear() &&
          selectedDate.getMonth() === doctorDate.getMonth() &&
          selectedDate.getDate() === doctorDate.getDate();

        if (!sameDate) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortVal === "asc") {
        return a.name.localeCompare(b.name);
      }

      if (sortVal === "desc") {
        return b.name.localeCompare(a.name);
      }

      return 0;
    });

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sortVal)?.label ||
    "Recently Added";

  // ───────────────────────────────────────────────────────────────────────────
  // EXPORT PDF
  // ───────────────────────────────────────────────────────────────────────────

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Doctor List", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Name",
          "Designation",
          "Department",
          "Phone",
          "Email",
          "Fees",
          "Status",
        ],
      ],
      body: filtered.map((doctor) => [
        doctor.name,
        doctor.role,
        doctor.dept,
        doctor.phone,
        doctor.email,
        `$${doctor.fee}`,
        doctor.status,
      ]),
    });

    doc.save("doctors.pdf");
    setExportOpen(false);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // EXPORT EXCEL
  // ───────────────────────────────────────────────────────────────────────────

  const downloadExcel = () => {
    const data = filtered.map((doctor) => ({
      Name: doctor.name,
      Designation: doctor.role,
      Department: doctor.dept,
      Phone: doctor.phone,
      Email: doctor.email,
      Fees: doctor.fee,
      Status: doctor.status,
      Availability: doctor.avail,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Doctors");

    XLSX.writeFile(workbook, "doctors.xlsx");

    setExportOpen(false);
  };

  return (
    <div className="doctors-page">
      {/* ───────────────────────────────────────────────────────────────────────
          PAGE TOP
      ─────────────────────────────────────────────────────────────────────── */}

      <div className="page-top">
        <div className="page-title-wrap">
          <h1>{view === "grid" ? "Doctor Grid" : "Doctor List"}</h1>

          <span className="total-badge">Total Doctors : {filtered.length}</span>

          {/* MOCK DATA LABEL */}
          {usingMockData && !loading && (
            <span
              style={{
                marginLeft: "10px",
                padding: "5px 10px",
                borderRadius: "6px",
                background: "#fff7ed",
                color: "#c2410c",
                border: "1px solid #fed7aa",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              MOCK DATA
            </span>
          )}
        </div>

        <div className="page-actions">
          {/* EXPORT */}
          {view === "list" && (
            <div className="export-dropdown-wrap" ref={exportRef}>
              <button
                className="btn-export"
                onClick={() => setExportOpen((open) => !open)}
              >
                Export
                <KeyboardArrowDownIcon />
              </button>

              {exportOpen && (
                <div className="dropdown-menu">
                  <div className="dd-item" onClick={downloadPDF}>
                    <PictureAsPdfIcon style={{ color: "#ef4444" }} />
                    Download as PDF
                  </div>

                  <div className="dd-item" onClick={downloadExcel}>
                    <TableChartIcon style={{ color: "#10b981" }} />
                    Download as Excel
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW TOGGLE */}
          <div className="view-toggle">
            <button
              className={`vt-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              <ViewListIcon />
            </button>

            <button
              className={`vt-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
            >
              <GridViewIcon />
            </button>
          </div>

          {/* NEW DOCTOR */}
          <button className="btn-new" onClick={() => navigate("/doctors/add")}>
            <AddIcon />
            New Doctor
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          TOOLBAR
      ─────────────────────────────────────────────────────────────────────── */}

      {view === "list" && (
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-input-wrap">
              <SearchIcon />

              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="toolbar-right">
            <button
              className="btn-filter-sm"
              onClick={() => setShowFilter(true)}
            >
              <FilterListIcon />
              Filters
            </button>

            <div className="sort-dropdown-wrap" ref={sortRef}>
              <button
                className="btn-sort"
                onClick={() => setSortOpen((open) => !open)}
              >
                Sort By : {sortLabel}
                <KeyboardArrowDownIcon />
              </button>

              {sortOpen && (
                <div className="dropdown-menu">
                  {SORT_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`dd-item ${
                        sortVal === option.value ? "active" : ""
                      }`}
                      onClick={() => {
                        setSortVal(option.value);
                        setSortOpen(false);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          LIST
      ─────────────────────────────────────────────────────────────────────── */}

      {view === "list" && (
        <div className="doctors-table-card">
          <table>
            <thead>
              <tr>
                <th>Name & Designation</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Fees</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    Loading doctors...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((doctor) => (
                  <tr
                    key={doctor.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/doctors/${doctor.id}`)}
                  >
                    <td>
                      <div className="doc-name-cell">
                        <Avatar
                          name={doctor.name}
                          color={doctor.color}
                          size={38}
                        />

                        <div>
                          <div className="doc-name">{doctor.name}</div>

                          <div className="doc-role">{doctor.role}</div>
                        </div>
                      </div>
                    </td>

                    <td>{doctor.dept}</td>
                    <td>{doctor.phone}</td>
                    <td>{doctor.email}</td>

                    <td>
                      <span className="fee-val">${doctor.fee}</span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${doctor.status.toLowerCase()}`}
                      >
                        {doctor.status}
                      </span>
                    </td>

                    <td onClick={(event) => event.stopPropagation()}>
                      <div className="row-actions">
                        <button className="icon-btn" title="Schedule">
                          <CalendarTodayIcon />
                        </button>

                        <div
                          className="context-menu-wrap"
                          onClick={(event) => {
                            event.stopPropagation();

                            setOpenMenu(
                              openMenu === doctor.id ? null : doctor.id,
                            );
                          }}
                        >
                          <button className="icon-btn">
                            <MoreVertIcon />
                          </button>

                          {openMenu === doctor.id && (
                            <div className="context-menu">
                              <div
                                className="cm-item"
                                onClick={() =>
                                  navigate(`/doctors/${doctor.id}/edit`, {
                                    state: { doctor },
                                  })
                                }
                              >
                                Edit
                              </div>

                              <div
                                className="cm-item danger"
                                onClick={() => handleDeleteDoctor(doctor.id)}
                              >
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    No doctors found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          GRID
      ─────────────────────────────────────────────────────────────────────── */}

      {view === "grid" && (
        <div className="doctors-grid-wrap">
          {loading ? (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                padding: "40px",
                color: "#64748b",
              }}
            >
              Loading doctors...
            </div>
          ) : (
            filtered.map((doctor) => (
              <GridCard
                key={doctor.id}
                doc={doctor}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onCardClick={() => navigate(`/doctors/${doctor.id}`)}
                onEdit={() =>
                  navigate(`/doctors/${doctor.id}/edit`, { state: { doctor } })
                }
                onDelete={() => handleDeleteDoctor(doctor.id)}
              />
            ))
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          FILTER PANEL
      ─────────────────────────────────────────────────────────────────────── */}

      {showFilter && (
        <FilterPanel
          appliedFilters={appliedFilters}
          onApply={setAppliedFilters}
          onClose={() => setShowFilter(false)}
          doctors={doctors}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GRID CARD
// ─────────────────────────────────────────────────────────────────────────────

function GridCard({
  doc,
  openMenu,
  setOpenMenu,
  onCardClick,
  onEdit,
  onDelete,
}) {
  return (
    <div
      className="doctor-grid-card"
      onClick={onCardClick}
      style={{ cursor: "pointer" }}
    >
      <div
        className="card-img"
        style={{
          background: doc.color + "18",
        }}
      >
        <div className="img-placeholder" style={{ color: doc.color }}>
          {doc.name
            .split(" ")
            .slice(1, 3)
            .map((word) => word[0])
            .join("")}
        </div>
      </div>

      <div className="card-body">
        <div className="card-name">{doc.name}</div>

        <div className="card-spec">{doc.role}</div>

        <div className="card-avail">
          Available : <span>{doc.avail}</span>
        </div>

        <div className="card-fee">
          Starts From : <span>${doc.fee}</span>
        </div>

        <button
          className="card-cal-btn"
          onClick={(event) => event.stopPropagation()}
        >
          <CalendarTodayIcon />
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
        }}
        onClick={(event) => {
          event.stopPropagation();

          setOpenMenu(openMenu === doc.id ? null : doc.id);
        }}
      >
        <button className="card-menu-btn">
          <MoreVertIcon />
        </button>

        {openMenu === doc.id && (
          <div className="card-context-menu">
            <div
              className="cm-item"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </div>

            <div
              className="cm-item danger"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
