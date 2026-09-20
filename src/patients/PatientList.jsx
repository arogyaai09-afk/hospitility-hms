//patientlist.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients, deletePatient } from "../api/patients";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const patientsData = [
  {
    id: 1,
    name: "Alberto Ripley",
    age: 26,
    gender: "Male",
    phone: "+1 41245 54132",
    doctor: "Dr. Mick Thompson",
    docRole: "Cardiologist",
    docColor: "#3b82f6",
    docInitials: "MT",
    address: "Miami, Florida",
    lastVisit: "30 Apr 2025",
    location: "Green Square, New York, USA",
    status: "Available",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Susan Babin",
    age: 21,
    gender: "Female",
    phone: "+1 54554 54789",
    doctor: "Dr. Sarah Johnson",
    docRole: "Orthopedic Surgeon",
    docColor: "#10b981",
    docInitials: "SJ",
    address: "Austin, Texas",
    lastVisit: "15 Apr 2025",
    location: "Elm Road, Chicago, USA",
    status: "Available",
    color: "#ec4899",
  },
  {
    id: 3,
    name: "Carol Lam",
    age: 28,
    gender: "Female",
    phone: "+1 43554 54985",
    doctor: "Dr. Emily Carter",
    docRole: "Pediatrician",
    docColor: "#8b5cf6",
    docInitials: "EC",
    address: "Seattle, Washington",
    lastVisit: "02 Apr 2025",
    location: "Ocean Avenue, Miami, USA",
    status: "Available",
    color: "#8b5cf6",
  },
  {
    id: 4,
    name: "Marsha Noland",
    age: 25,
    gender: "Female",
    phone: "+1 47554 54257",
    doctor: "Dr. David Lee",
    docRole: "Gynecologist",
    docColor: "#f59e0b",
    docInitials: "DL",
    address: "Chicago, Illinois",
    lastVisit: "27 Mar 2025",
    location: "Elm Road, Austin, USA",
    status: "Unavailable",
    color: "#f59e0b",
  },
  {
    id: 5,
    name: "Irma Armstrong",
    age: 32,
    gender: "Female",
    phone: "+1 54114 57526",
    doctor: "Dr. Anna Kim",
    docRole: "Psychiatrist",
    docColor: "#0d9488",
    docInitials: "AK",
    address: "Phoenix, Arizona",
    lastVisit: "12 Mar 2025",
    location: "Elm Road, Austin, USA",
    status: "Available",
    color: "#ef4444",
  },
  {
    id: 6,
    name: "Jesus Adams",
    age: 27,
    gender: "Male",
    phone: "+1 51247 56574",
    doctor: "Dr. John Smith",
    docRole: "Neurosurgeon",
    docColor: "#ef4444",
    docInitials: "JS",
    address: "Atlanta, Georgia",
    lastVisit: "05 Mar 2025",
    location: "Maple Street, San Francisco, USA",
    status: "Unavailable",
    color: "#10b981",
  },
  {
    id: 7,
    name: "Ezra Belcher",
    age: 28,
    gender: "Male",
    phone: "+1 41452 25741",
    doctor: "Dr. Lisa White",
    docRole: "Oncologist",
    docColor: "#ec4899",
    docInitials: "LW",
    address: "San Diego, California",
    lastVisit: "24 Feb 2025",
    location: "Pine Valley, Seattle, USA",
    status: "Available",
    color: "#6366f1",
  },
  {
    id: 8,
    name: "Glen Lentz",
    age: 22,
    gender: "Male",
    phone: "+1 62458 45845",
    doctor: "Dr. Patricia Brown",
    docRole: "Pulmonologist",
    docColor: "#6366f1",
    docInitials: "PB",
    address: "San Diego, California",
    lastVisit: "16 Feb 2025",
    location: "Pine Valley, Seattle, USA",
    status: "Available",
    color: "#0d9488",
  },
  {
    id: 9,
    name: "Bernard Griffith",
    age: 34,
    gender: "Male",
    phone: "+1 61422 45214",
    doctor: "Dr. Rachel Green",
    docRole: "Urologist",
    docColor: "#14b8a6",
    docInitials: "RG",
    address: "Houston, Texas",
    lastVisit: "01 Feb 2025",
    location: "River Walk, Houston, USA",
    status: "Available",
    color: "#f59e0b",
  },
  {
    id: 10,
    name: "John Elsass",
    age: 23,
    gender: "Male",
    phone: "+1 47851 26371",
    doctor: "Dr. Michael Smith",
    docRole: "Cardiologist",
    docColor: "#f59e0b",
    docInitials: "MS",
    address: "Denver, Colorado",
    lastVisit: "25 Jan 2025",
    location: "Forest Hill, Denver, USA",
    status: "Available",
    color: "#3b82f6",
  },
  {
    id: 11,
    name: "Martin Lisa",
    age: 26,
    gender: "Female",
    phone: "+1 54785 36241",
    doctor: "Dr. Mick Thompson",
    docRole: "Cardiologist",
    docColor: "#3b82f6",
    docInitials: "MT",
    address: "Orlando, Florida",
    lastVisit: "22 Jan 2025",
    location: "Garden Circle, Orlando, USA",
    status: "Unavailable",
    color: "#ec4899",
  },
  {
    id: 12,
    name: "Ava Mitchell",
    age: 25,
    gender: "Female",
    phone: "+1 58741 25481",
    doctor: "Dr. Sarah Johnson",
    docRole: "Orthopedic Surgeon",
    docColor: "#10b981",
    docInitials: "SJ",
    address: "Atlanta, Georgia",
    lastVisit: "18 Jan 2025",
    location: "Crystal Court, Atlanta, USA",
    status: "Available",
    color: "#8b5cf6",
  },
  {
    id: 13,
    name: "Noah Davis",
    age: 32,
    gender: "Male",
    phone: "+1 47852 36548",
    doctor: "Dr. Emily Carter",
    docRole: "Pediatrician",
    docColor: "#8b5cf6",
    docInitials: "EC",
    address: "Phoenix, Arizona",
    lastVisit: "15 Jan 2025",
    location: "Oakwood Street, Phoenix, USA",
    status: "Available",
    color: "#10b981",
  },
  {
    id: 14,
    name: "Emily Ross",
    age: 29,
    gender: "Female",
    phone: "+1 63254 87412",
    doctor: "Dr. David Lee",
    docRole: "Gynecologist",
    docColor: "#f59e0b",
    docInitials: "DL",
    address: "Dallas, Texas",
    lastVisit: "10 Jan 2025",
    location: "Hilltop Lane, Dallas, USA",
    status: "Available",
    color: "#f59e0b",
  },
  {
    id: 15,
    name: "Ryan Anderson",
    age: 30,
    gender: "Male",
    phone: "+1 45871 26354",
    doctor: "Dr. Anna Kim",
    docRole: "Psychiatrist",
    docColor: "#0d9488",
    docInitials: "AK",
    address: "Dallas, Texas",
    lastVisit: "04 Jan 2025",
    location: "Hilltop Lane, Dallas, USA",
    status: "Unavailable",
    color: "#6366f1",
  },
];

const SORT_OPTIONS = [
  { label: "Recently Added", value: "recent" },
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
  { label: "Last Month", value: "month" },
  { label: "Last 7 Days", value: "week" },
];

const PAGE_SIZE = 9;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Avatar({ name, color, size = 38 }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color + "22",
        color,
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

function useOutsideClick(ref, cb) {
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

// ─── FILTER FIELD ─────────────────────────────────────────────────────────────

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
            setOpen(false);
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
        {/* Selected tags */}
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

        {/* Search input */}
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

        {/* Dropdown options */}
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

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────

function FilterPanel({
  onClose,
  onApply,
  currentFilters,
  patientOptions,
  doctorOptions,
  statusOptions,
  addressOptions,
}) {
  const [filters, setFilters] = useState(currentFilters);

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
      patient: [],
      doctor: [],
      status: [],
      address: [],
      date: "",
    });
  };

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
          {/* PATIENT */}
          <FilterField
            label="Patient"
            values={filters.patient}
            onAdd={(value) => addValue("patient", value)}
            onRemove={(value) => removeValue("patient", value)}
            options={patientOptions}
            placeholder="Search patient..."
          />

          {/* DOCTOR */}
          <FilterField
            label="Doctor"
            values={filters.doctor}
            onAdd={(value) => addValue("doctor", value)}
            onRemove={(value) => removeValue("doctor", value)}
            options={doctorOptions}
            placeholder="Search doctor..."
          />

          {/* STATUS */}
          <FilterField
            label="Status"
            values={filters.status}
            onAdd={(value) => addValue("status", value)}
            onRemove={(value) => removeValue("status", value)}
            options={statusOptions}
            placeholder="Search status..."
          />

          {/* ADDRESS */}
          <FilterField
            label="Address"
            values={filters.address}
            onAdd={(value) => addValue("address", value)}
            onRemove={(value) => removeValue("address", value)}
            options={addressOptions}
            placeholder="Search address..."
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Patients() {
  const navigate = useNavigate();

  const { showToast } = useToast();

  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    patient: [],
    doctor: [],
    status: [],
    date: "",
    address: [],
  });
  const [sortOpen, setSortOpen] = useState(false);
  const [sortVal, setSortVal] = useState("recent");
  const [exportOpen, setExportOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;

    try {
      await deletePatient(patientToDelete);

      setPatients((currentPatients) =>
        currentPatients.filter((patient) => patient.id !== patientToDelete),
      );

      setOpenMenu(null);

      showToast("Patient deleted successfully", "success");
    } catch (error) {
      console.error("Delete patient error:", error);

      showToast(error?.message || "Failed to delete patient", "error");
    } finally {
      setPatientToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const sortRef = useRef();
  const exportRef = useRef();

  useOutsideClick(sortRef, () => setSortOpen(false));
  useOutsideClick(exportRef, () => setExportOpen(false));

  useEffect(() => {
    const h = (e) => {
      if (
        !e.target.closest(".context-menu") &&
        !e.target.closest(".pgc-context-menu") &&
        !e.target.closest(".context-menu-wrap")
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", h);

    return () => {
      document.removeEventListener("mousedown", h);
    };
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);

        const response = await getPatients();

        const backendPatients = Array.isArray(response?.data)
          ? response.data
          : [];

        const normalizedPatients = backendPatients.map((patient) => {
          const age = patient.dateOfBirth
            ? new Date().getFullYear() -
              new Date(patient.dateOfBirth).getFullYear()
            : "";

          const gender = patient.gender
            ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
            : "";

          return {
            id: patient._id,
            name: patient.name || "",
            age,
            gender,
            phone: patient.phone || "",
            address: patient.address || "",
            patientCode: patient.patientCode || "",
            email: patient.email || "",
            doctor: "",
            docRole: "",
            docColor: "#3b82f6",
            docInitials: "",
            lastVisit: "",
            status: "",
            location: patient.address || "",
            color: "#3b82f6",
            dateOfBirth: patient.dateOfBirth,
            createdAt: patient.createdAt,
          };
        });

        setPatients(normalizedPatients);
        setUsingMockData(false);
      } catch (error) {
        console.error("Patients API Error:", error);
        setPatients([]);
        setUsingMockData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filtered = patients
    .filter((p) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        p.name?.toLowerCase().includes(searchValue) ||
        p.doctor?.toLowerCase().includes(searchValue) ||
        p.address?.toLowerCase().includes(searchValue) ||
        p.phone?.toLowerCase().includes(searchValue) ||
        p.patientCode?.toLowerCase().includes(searchValue);

      const matchesPatient =
        appliedFilters.patient.length === 0 ||
        appliedFilters.patient.includes(p.name);

      const matchesDoctor =
        appliedFilters.doctor.length === 0 ||
        appliedFilters.doctor.includes(p.doctor);

      const matchesStatus =
        appliedFilters.status.length === 0 ||
        appliedFilters.status.includes(p.status);

      const matchesAddress =
        appliedFilters.address.length === 0 ||
        appliedFilters.address.includes(p.address);

      const matchesDate =
        !appliedFilters.date ||
        p.createdAt?.slice(0, 10) === appliedFilters.date;

      return (
        matchesSearch &&
        matchesPatient &&
        matchesDoctor &&
        matchesStatus &&
        matchesAddress &&
        matchesDate
      );
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

  const patientOptions = [
    ...new Set(patients.map((p) => p.name).filter(Boolean)),
  ];

  const doctorOptions = [
    ...new Set(patients.map((p) => p.doctor).filter(Boolean)),
  ];

  const statusOptions = [
    ...new Set(patients.map((p) => p.status).filter(Boolean)),
  ];

  const addressOptions = [
    ...new Set(patients.map((p) => p.address).filter(Boolean)),
  ];

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortVal)?.label || "Recent";

  return (
    <div className="patients-page">
      {/* ── Page Top ── */}
      <div className="page-top">
        <div className="page-title-wrap">
          <h1>{view === "grid" ? "Patient Grid" : "Patients List"}</h1>

          <div
            className="total-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
            }}
          >
            {usingMockData && (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "#fef3c7",
                  color: "#92400e",
                  fontSize: "11px",
                  fontWeight: 700,
                  lineHeight: "1",
                }}
              >
                MOCK DATA
              </span>
            )}

            <span>Total Patients : {filtered.length}</span>
          </div>
        </div>

        <div className="page-actions">
          {/* Export */}
          <div className="export-dropdown-wrap" ref={exportRef}>
            {view === "list" ? (
              <>
                <button
                  className="btn-export"
                  onClick={() => setExportOpen((o) => !o)}
                >
                  Export <KeyboardArrowDownIcon />
                </button>
                {exportOpen && (
                  <div className="dropdown-menu">
                    <div className="dd-item">
                      <PictureAsPdfIcon style={{ color: "#ef4444" }} /> Download
                      as PDF
                    </div>
                    <div className="dd-item">
                      <TableChartIcon style={{ color: "#10b981" }} /> Download
                      as Excel
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                className="btn-filter"
                onClick={() => setShowFilter(true)}
              >
                <FilterListIcon /> Filters
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`vt-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
              title="List view"
            >
              <ViewListIcon />
            </button>
            <button
              className={`vt-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
              title="Grid view"
            >
              <GridViewIcon />
            </button>
          </div>

          <button
            className="btn-new"
            onClick={() => navigate("/patients/create")}
          >
            <AddIcon /> New Patient
          </button>
        </div>
      </div>

      {/* ── Toolbar (list only) ── */}
      {view === "list" && (
        <div className="toolbar">
          <div className="search-input-wrap">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
            <button
              className="btn-filter-sm"
              onClick={() => setShowFilter(true)}
            >
              <FilterListIcon /> Filters
            </button>
            <div className="sort-dropdown-wrap" ref={sortRef}>
              <button
                className="btn-sort"
                onClick={() => setSortOpen((o) => !o)}
              >
                Sort By : {sortLabel} <KeyboardArrowDownIcon />
              </button>
              {sortOpen && (
                <div className="dropdown-menu">
                  {SORT_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      className={`dd-item ${sortVal === opt.value ? "active" : ""}`}
                      onClick={() => {
                        setSortVal(opt.value);
                        setSortOpen(false);
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ LIST VIEW ══ */}
      {view === "list" && (
        <div className="patients-table-card">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Doctor</th>
                <th>Address</th>
                <th>Last Visit</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pat) => (
                <tr
                  key={pat.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/patients/${pat.id}`)}
                >
                  <td>
                    <div className="patient-cell">
                      <Avatar name={pat.name} color={pat.color} size={38} />
                      <div>
                        <div className="cell-name">{pat.name}</div>
                        <div className="cell-sub">
                          {pat.age}, {pat.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{pat.phone}</td>
                  {/* Doctor cell → navigate to doctor detail */}
                  <td
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/doctors/${pat.id}`);
                    }}
                  >
                    <div className="doctor-cell">
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: pat.docColor + "22",
                          color: pat.docColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {pat.docInitials}
                      </div>
                      <div>
                        <div className="cell-name">{pat.doctor}</div>
                        <div className="cell-sub">{pat.docRole}</div>
                      </div>
                    </div>
                  </td>
                  <td>{pat.address}</td>
                  <td>{pat.lastVisit}</td>
                  <td>
                    <span
                      className={`status-badge ${pat.status.toLowerCase()}`}
                    >
                      {pat.status}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      {/* Calendar → Appointment */}
                      <button
                        className="icon-btn"
                        title="Appointments"
                        onClick={() => navigate("/appointments")}
                      >
                        <CalendarTodayIcon />
                      </button>
                      {/* 3-dot */}
                      <div
                        className="context-menu-wrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === pat.id ? null : pat.id);
                        }}
                      >
                        <button className="icon-btn">
                          <MoreVertIcon />
                        </button>
                        {openMenu === pat.id && (
                          <div className="context-menu">
                            <div
                              className="cm-item"
                              onClick={() =>
                                navigate(`/patients/${pat.id}/edit`, {
                                  state: { patient: pat },
                                })
                              }
                            >
                              Edit
                            </div>
                            <div
                              className="cm-item"
                              onClick={() => navigate(`/patients/${pat.id}`)}
                            >
                              View
                            </div>
                            <div
                              className="cm-item danger"
                              onClick={(e) => {
                                e.stopPropagation();

                                setPatientToDelete(pat.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══ GRID VIEW ══ */}
      {view === "grid" && (
        <>
          <div className="patients-grid-wrap">
            {visible.map((pat) => (
              <PatientGridCard
                key={pat.id}
                pat={pat}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onCardClick={() => navigate(`/patients/${pat.id}`)}
                onDoctorClick={() => navigate(`/doctors/${pat.id}`)}
                onApptClick={() => navigate("/appointments")}
                onDelete={() => {
                  setPatientToDelete(pat.id);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="load-more-wrap">
              <button
                className="btn-load-more"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                <RefreshIcon /> Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* Filter Panel */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Patient"
        message="Are you sure you want to delete this patient?"
        confirmText="Delete Patient"
        cancelText="Cancel"
        onCancel={() => {
          setShowDeleteModal(false);
          setPatientToDelete(null);
        }}
        onConfirm={handleDeletePatient}
      />
    </div>
  );
}

// ─── PATIENT GRID CARD ────────────────────────────────────────────────────────
function PatientGridCard({
  pat,
  openMenu,
  setOpenMenu,
  onCardClick,
  onDoctorClick,
  onApptClick,
  onDelete,
}) {
  const navigate = useNavigate();
  return (
    <div className="patient-grid-card" onClick={onCardClick}>
      <div className="pgc-top">
        <div className="pgc-info">
          <div
            className="pgc-avatar"
            style={{ background: pat.color + "22", color: pat.color }}
          >
            {pat.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </div>
          <div>
            <div className="pgc-name">{pat.name}</div>
            <div className="pgc-meta">
              {pat.age}, {pat.gender}
            </div>
          </div>
        </div>

        {/* 3-dot menu */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(openMenu === pat.id ? null : pat.id);
          }}
          style={{ position: "relative" }}
        >
          <button className="pgc-menu-btn">
            <MoreVertIcon />
          </button>
          {openMenu === pat.id && (
            <div className="pgc-context-menu">
              <div
                className="cm-item"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/patients/${pat.id}/edit`, {
                    state: { patient: pat },
                  });
                }}
              >
                Edit
              </div>
              <div
                className="cm-item danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Delete
              </div>
              <div
                className="cm-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onApptClick();
                }}
              >
                Appointment
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pgc-divider" />

      {/* Last appointment */}
      <div className="pgc-detail">
        <CalendarTodayIcon />
        <span>Last Appointment :</span> {pat.lastVisit}
      </div>

      {/* Location */}
      <div className="pgc-detail">
        <LocationOnIcon />
        {pat.location}
      </div>
    </div>
  );
}
