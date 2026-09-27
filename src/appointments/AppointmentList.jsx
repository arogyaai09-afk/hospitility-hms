//appointments/AppointmentList.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAppointments,
  checkInAppointment,
  updateAppointment,
  deleteAppointment
} from "../api/appointments";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useToast } from "../context/ToastContext";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  "Recently Added",
  "Ascending",
  "Descending",
  "Last Month",
  "Last 7 Days",
];

const STATUS_CLASS = (s) => {
  const m = {
    "checked out": "checked-out",
    "checked in": "checked-in",
    cancelled: "cancelled",
    schedule: "schedule",
    confirmed: "confirmed",
  };
  return m[s.toLowerCase()] || "confirmed";
};

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
    const value = String(option);

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
        onClick={() => setOpen(true)}
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
                addValue(filteredOptions[0]);
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
            {filteredOptions.map((option) => (
              <div
                key={option}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addValue(option)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────

function FilterPanel({ appliedFilters, onApply, onClose, appointments }) {
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
      patient: [],
      doctor: [],
      designation: [],
      mode: [],
      status: [],
      date: "",
    });
  };

  const uniquePatients = [
    ...new Set(appointments.map((appointment) => appointment.patient)),
  ];

  const uniqueDoctors = [
    ...new Set(appointments.map((appointment) => appointment.doctor)),
  ];

  const uniqueDesignations = [
    ...new Set(appointments.map((appointment) => appointment.dRole)),
  ].filter(Boolean);

  const uniqueModes = [
    ...new Set(appointments.map((appointment) => appointment.mode)),
  ];

  const uniqueStatuses = [
    ...new Set(appointments.map((appointment) => appointment.status)),
  ];

  return (
    <>
      <div className="filter-overlay" onClick={onClose} />

      <div className="filter-panel">
        <div className="fp-header">
          <span className="fp-title">Filter</span>

          <span className="fp-clear" onClick={clearAll}>
            Clear All
          </span>
        </div>

        <div className="fp-body">
          <FilterField
            label="Patient"
            values={filters.patient}
            onAdd={(value) => addValue("patient", value)}
            onRemove={(value) => removeValue("patient", value)}
            options={uniquePatients}
            placeholder="Search patient..."
          />

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
            options={uniqueDesignations}
            placeholder="Search designation..."
          />

          <FilterField
            label="Mode"
            values={filters.mode}
            onAdd={(value) => addValue("mode", value)}
            onRemove={(value) => removeValue("mode", value)}
            options={uniqueModes}
            placeholder="Search mode..."
          />

          <FilterField
            label="Status"
            values={filters.status}
            onAdd={(value) => addValue("status", value)}
            onRemove={(value) => removeValue("status", value)}
            options={uniqueStatuses}
            placeholder="Search status..."
          />

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

        <div className="fp-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>

          <button
            className="btn-apply"
            onClick={() => {
              onApply(filters);
              onClose();
            }}
          >
            Filter
          </button>
        </div>
      </div>
    </>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8AM–7PM

function CalendarView({ appointments }) {
  const today = new Date();

  const [calView, setCalView] = useState("month");
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
  });

  const goToday = () =>
    setCurrent({
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
    });
  const goPrev = () => {
    setCurrent((currentDate) => {
      const date = new Date(
        currentDate.year,
        currentDate.month,
        currentDate.day || 1,
      );

      if (calView === "month") {
        date.setMonth(date.getMonth() - 1);
      } else if (calView === "week") {
        date.setDate(date.getDate() - 7);
      } else if (calView === "day") {
        date.setDate(date.getDate() - 1);
      }

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      };
    });
  };

  const goNext = () => {
    setCurrent((currentDate) => {
      const date = new Date(
        currentDate.year,
        currentDate.month,
        currentDate.day || 1,
      );

      if (calView === "month") {
        date.setMonth(date.getMonth() + 1);
      } else if (calView === "week") {
        date.setDate(date.getDate() + 7);
      } else if (calView === "day") {
        date.setDate(date.getDate() + 1);
      }

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      };
    });
  };

  // Build month grid
  const buildMonthDays = () => {
    const { year, month } = current;
    const first = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = first - 1; i >= 0; i--)
      cells.push({ day: prevDays - i, cur: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true });
    while (cells.length % 7 !== 0)
      cells.push({ day: cells.length - daysInMonth - first + 1, cur: false });

    return cells;
  };

  const cells = buildMonthDays();
  const { year, month } = current;

  const isToday = (day, cur) =>
    cur &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const getDateKey = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Current week start (for week view)
  const weekStart = new Date(current.year, current.month, current.day || 1);

  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const calendarEvents = appointments.reduce((acc, appointment) => {
    const date = new Date(appointment.date);

    if (Number.isNaN(date.getTime())) {
      return acc;
    }

    const dateKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push({
      label: `${appointment.patient} - ${appointment.doctor}`,
      hour: date.getHours(),
      appointment,
    });

    return acc;
  }, {});

  return (
    <>
      {/* Calendar nav toolbar */}
      <div className="cal-toolbar">
        <div className="cal-nav">
          <button className="btn-today" onClick={goToday}>
            today
          </button>
          <button className="btn-arrow" onClick={goPrev}>
            <ChevronLeftIcon />
          </button>
          <button className="btn-arrow" onClick={goNext}>
            <ChevronRightIcon />
          </button>
          <span className="cal-month-label">
            {calView === "month" && `${MONTHS[month]} ${year}`}

            {calView === "week" &&
              `${weekStart.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })} - ${new Date(
                weekStart.getFullYear(),
                weekStart.getMonth(),
                weekStart.getDate() + 6,
              ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}`}

            {calView === "day" &&
              new Date(
                current.year,
                current.month,
                current.day,
              ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
          </span>
        </div>
        <div className="cal-view-tabs">
          {["month", "week", "day"].map((v) => (
            <button
              key={v}
              className={`cv-btn ${calView === v ? "active" : ""}`}
              onClick={() => setCalView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── MONTH VIEW ── */}
      {calView === "month" && (
        <div className="calendar-card">
          <div className="cal-header-row">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="cal-day-header">
                {d}
              </div>
            ))}
          </div>
          <div className="cal-grid">
            {cells.map((cell, i) => {
              const key = cell.cur ? getDateKey(cell.day) : null;
              const events = key ? calendarEvents[key] || [] : [];
              return (
                <div
                  key={i}
                  className={`cal-cell ${!cell.cur ? "other-month" : ""} ${isToday(cell.day, cell.cur) ? "today" : ""}`}
                >
                  <div className="cal-date">{cell.day}</div>
                  {events.map((ev, j) => (
                    <div key={j} className="cal-event">
                      {ev.label}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WEEK VIEW ── */}
      {calView === "week" && (
        <div className="calendar-card">
          <div className="week-grid">
            {/* Time column */}
            <div className="wg-time-col">
              <div style={{ height: 52, borderBottom: "1px solid #e2e8f0" }} />
              {HOURS.map((h) => (
                <div key={h} className="wg-time-slot">
                  {h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`}
                </div>
              ))}
            </div>
            {/* Day columns */}
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + i);
              const isT =
                d.getDate() === today.getDate() &&
                d.getMonth() === today.getMonth();
              return (
                <div key={i} className="wg-day-col">
                  <div className={`wg-day-header ${isT ? "today-col" : ""}`}>
                    {WEEK_DAYS[i]}
                    <div className={`wg-date ${isT ? "today-date" : ""}`}>
                      {d.getDate()}
                    </div>
                  </div>
                  {HOURS.map((h) => {
                    const ev = Object.values(calendarEvents)
                      .flat()
                      .find((event) => {
                        const date = new Date(event.appointment.date);

                        return (
                          date.getFullYear() === d.getFullYear() &&
                          date.getMonth() === d.getMonth() &&
                          date.getDate() === d.getDate() &&
                          date.getHours() === h
                        );
                      });
                    return (
                      <div key={h} className="wg-hour-slot">
                        {ev && <div className={`wg-event`}>{ev.label}</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── DAY VIEW ── */}
      {calView === "day" && (
        <div className="calendar-card">
          <div className="day-grid">
            <div className="dg-time-col">
              {HOURS.map((h) => (
                <div key={h} className="dg-slot">
                  {h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`}
                </div>
              ))}
            </div>
            <div className="dg-event-col">
              {HOURS.map((h) => {
                const currentDateKey = `${current.year}-${String(
                  current.month + 1,
                ).padStart(2, "0")}-${String(current.day).padStart(2, "0")}`;

                const ev = (calendarEvents[currentDateKey] || []).find(
                  (event) => event.hour === h,
                );
                return (
                  <div key={h} className="dg-slot">
                    {ev && <div className="dg-event">{ev.label}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Appointments() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortVal, setSortVal] = useState("Recently Added");
  const [openMenu, setOpenMenu] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    patient: [],
    doctor: [],
    designation: [],
    mode: [],
    status: [],
    date: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const exportRef = useRef();
  const sortRef = useRef();

  useOutsideClick(exportRef, () => setExportOpen(false));
  useOutsideClick(sortRef, () => setSortOpen(false));

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const response = await getAppointments();

      const backendData = response?.data?.data || response?.data || [];

      if (backendData.length > 0) {
        const formattedAppointments = backendData.map((item, index) => ({
          id: item._id || item.id || index + 1,

          patientId:
            typeof item.patientId === "object"
              ? item.patientId?._id
              : item.patientId,

          doctorId:
            typeof item.doctorId === "object"
              ? item.doctorId?._id
              : item.doctorId,

          visitId: item.visitId || null,

          date: item.scheduledAt
  ? new Date(item.scheduledAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  : item.date
    ? item.date
    : item.appointmentDate
      ? item.appointmentDate
      : "Date not available",

          patient:
            item.patientName || item.patientId?.name || "Unknown Patient",

          pPhone: item.patientId?.phone || item.patientPhone || "",

          pColor: "#3b82f6",

          doctor: item.doctorId?.name || item.doctorName || "Unknown Doctor",

          dRole: item.doctorId?.specialization || item.designation || "",

          dColor: "#8b5cf6",

          dInitials: (item.doctorId?.name || item.doctorName || "DR")
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),

          mode: item.mode || item.appointmentType || "In-person",

          status: item.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : "Scheduled",
        }));

        setAppointments(formattedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Fetch appointments error:", error);

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointment) => {
  if (!appointment.id) {
    showToast("Appointment ID is missing.", "error");
    return;
  }

  if (!appointment.patientId) {
    showToast("Patient ID is missing for this appointment.", "error");
    return;
  }

  try {
    setLoading(true);
    setOpenMenu(null);

    await checkInAppointment(appointment.id);

    showToast("Patient checked in successfully.", "success");

    await fetchAppointments();
  } catch (error) {
    console.error("Check-in error:", error);

    showToast(
      error?.message ||
        error?.error ||
        "Failed to check in patient.",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (appointment) => {
  if (!appointment?.id) {
    showToast("Appointment ID is missing.", "error");
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete the appointment for ${appointment.patient}?`
  );

  if (!confirmed) return;

  try {
    setLoading(true);
    setOpenMenu(null);

    await deleteAppointment(appointment.id);

    showToast(
      "Appointment deleted successfully.",
      "success"
    );

    await fetchAppointments();
  } catch (error) {
    console.error("Delete appointment error:", error);

    showToast(
      error?.message ||
        error?.error ||
        "Failed to delete appointment.",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const h = (event) => {
      if (!event.target.closest(".row-ctx")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", h);

    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = appointments
    .filter((a) => {
      const searchMatch =
        a.patient.toLowerCase().includes(search.toLowerCase()) ||
        a.doctor.toLowerCase().includes(search.toLowerCase()) ||
        a.mode.toLowerCase().includes(search.toLowerCase()) ||
        a.status.toLowerCase().includes(search.toLowerCase());

      const patientMatch =
        activeFilters.patient.length === 0 ||
        activeFilters.patient.includes(a.patient);

      const doctorMatch =
        activeFilters.doctor.length === 0 ||
        activeFilters.doctor.includes(a.doctor);

      const designationMatch =
        activeFilters.designation.length === 0 ||
        activeFilters.designation.includes(a.dRole);

      const modeMatch =
        activeFilters.mode.length === 0 || activeFilters.mode.includes(a.mode);

      const statusMatch =
        activeFilters.status.length === 0 ||
        activeFilters.status.includes(a.status);

      const dateMatch = (() => {
        if (!activeFilters.date) return true;

        const selectedDate = new Date(`${activeFilters.date}T00:00:00`);
        const appointmentDate = new Date(a.date);

        if (
          Number.isNaN(selectedDate.getTime()) ||
          Number.isNaN(appointmentDate.getTime())
        ) {
          return false;
        }

        return (
          selectedDate.getFullYear() === appointmentDate.getFullYear() &&
          selectedDate.getMonth() === appointmentDate.getMonth() &&
          selectedDate.getDate() === appointmentDate.getDate()
        );
      })();

      return (
        searchMatch &&
        patientMatch &&
        doctorMatch &&
        designationMatch &&
        modeMatch &&
        statusMatch &&
        dateMatch
      );
    })
    .sort((a, b) => {
      if (sortVal === "Ascending") {
        return a.patient.localeCompare(b.patient);
      }

      if (sortVal === "Descending") {
        return b.patient.localeCompare(a.patient);
      }

      return 0;
    });

  const downloadExcel = () => {
    const excelData = filtered.map((appointment) => ({
      "Date & Time": appointment.date,
      Patient: appointment.patient,
      Phone: appointment.pPhone || "-",
      Doctor: appointment.doctor,
      Designation: appointment.dRole || "-",
      Mode: appointment.mode,
      Status: appointment.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");

    XLSX.writeFile(workbook, "appointments.xlsx");

    setExportOpen(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Appointment List", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Date & Time",
          "Patient",
          "Phone",
          "Doctor",
          "Designation",
          "Mode",
          "Status",
        ],
      ],
      body: filtered.map((appointment) => [
        appointment.date,
        appointment.patient,
        appointment.pPhone || "-",
        appointment.doctor,
        appointment.dRole || "-",
        appointment.mode,
        appointment.status,
      ]),
    });

    doc.save("appointments.pdf");

    setExportOpen(false);
  };

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const pageData = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="appointments-page">
      {/* ── Page Top ── */}
      <div className="page-top">
        <h1>Appointment</h1>
        <div className="page-actions">
          {/* Export */}
          <div className="export-wrap" ref={exportRef}>
            <button
              className="btn-export"
              onClick={() => setExportOpen((o) => !o)}
            >
              Export <KeyboardArrowDownIcon />
            </button>
            {exportOpen && (
              <div className="dropdown-menu">
                <div className="dd-item" onClick={downloadPDF}>
                  <PictureAsPdfIcon style={{ color: "#ef4444" }} /> Download as
                  PDF
                </div>
                <div className="dd-item" onClick={downloadExcel}>
                  <TableChartIcon style={{ color: "#10b981" }} /> Download as
                  Excel
                </div>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`vt-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
              title="List"
            >
              <ViewListIcon />
            </button>
            <button
              className={`vt-btn ${view === "calendar" ? "active" : ""}`}
              onClick={() => setView("calendar")}
              title="Calendar"
            >
              <CalendarMonthIcon />
            </button>
          </div>

          <button
            className="btn-new"
            onClick={() => navigate("/appointments/new")}
          >
            <AddIcon /> New Appointment
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-wrap">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="date-btn">
            <CalendarTodayIcon /> 8 Mar 26 - 8 Mar 26
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-filter-sm" onClick={() => setShowFilter(true)}>
            <FilterListIcon /> Filters
          </button>
          <div className="sort-wrap" ref={sortRef}>
            <button className="btn-sort" onClick={() => setSortOpen((o) => !o)}>
              Sort By : {sortVal} <KeyboardArrowDownIcon />
            </button>
            {sortOpen && (
              <div className="dropdown-menu">
                {SORT_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    className={`dd-item ${sortVal === opt ? "active" : ""}`}
                    onClick={() => {
                      setSortVal(opt);
                      setSortOpen(false);
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

      {/* ══ LIST VIEW ══ */}
      {view === "list" && (
        <div className="appt-table-card">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Mode</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((appt) => (
                <tr key={appt.id}>
                  <td style={{ fontWeight: 500, color: "#1e293b" }}>
                    {appt.date}
                  </td>

                  {/* Patient → patient details */}
                  <td onClick={() => navigate(`/patients/${appt.patientId}`)}>
                    <div className="person-cell">
                      <div
                        className="p-avatar"
                        style={{
                          background: appt.pColor + "22",
                          color: appt.pColor,
                        }}
                      >
                        {appt.patient
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="p-name">{appt.patient}</div>
                        <div className="p-sub">{appt.pPhone}</div>
                      </div>
                    </div>
                  </td>

                  {/* Doctor → doctor details */}
                  <td onClick={() => navigate(`/doctors/${appt.doctorId}`)}>
                    <div className="person-cell">
                      <div
                        className="p-avatar"
                        style={{
                          background: appt.dColor + "22",
                          color: appt.dColor,
                        }}
                      >
                        {appt.dInitials}
                      </div>
                      <div>
                        <div className="p-name">{appt.doctor}</div>
                        <div className="p-sub">{appt.dRole}</div>
                      </div>
                    </div>
                  </td>

                  <td>{appt.mode}</td>

                  <td>
                    <span
                      className={`appt-status ${STATUS_CLASS(appt.status)}`}
                    >
                      {appt.status === "Schedule" && appt.schedDate
                        ? appt.schedDate
                        : appt.status}
                    </span>
                  </td>

                  {/* 3-dot */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-ctx">
                      <button
                        className="icon-btn"
                        onClick={() =>
                          setOpenMenu(openMenu === appt.id ? null : appt.id)
                        }
                      >
                        <MoreVertIcon />
                      </button>
                      {openMenu === appt.id && (
                        <div className="ctx-menu">
                          {appt.status.toLowerCase() !== "checked in" &&
                            appt.status.toLowerCase() !== "checked out" &&
                            appt.status.toLowerCase() !== "cancelled" && (
                              <div
                                className="ctx-item"
                                onClick={() => handleCheckIn(appt)}
                              >
                                Check In
                              </div>
                            )}

                          <div
                            className="ctx-item"
                            onClick={() => {
                              setOpenMenu(null);
                              navigate(`/appointments/${appt.id}/edit`);
                            }}
                          >
                            Edit
                          </div>

                          <div
                            className="ctx-item"
                            onClick={() => {
                              setOpenMenu(null);
                              navigate(`/appointments/${appt.id}`);
                            }}
                          >
                            View
                          </div>

                          <div
  className="ctx-item danger"
  onClick={() => handleDelete(appt)}
>
  Delete
</div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="table-pagination">
            <div className="page-info">
              Row Per Page
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 15, 20].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              Entries
            </div>
            <div className="page-nav">
              <button
                className="pg-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeftIcon />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pg-btn ${page === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="pg-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CALENDAR VIEW ══ */}
      {view === "calendar" && <CalendarView appointments={appointments} />}

      {/* Filter Panel */}
      {showFilter && (
        <FilterPanel
          appliedFilters={activeFilters}
          appointments={appointments}
          onApply={setActiveFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
}
