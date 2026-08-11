import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon              from "@mui/icons-material/Add";
import SearchIcon           from "@mui/icons-material/Search";
import FilterListIcon       from "@mui/icons-material/FilterList";
import ViewListIcon         from "@mui/icons-material/ViewList";
import CalendarMonthIcon    from "@mui/icons-material/CalendarMonth";
import MoreVertIcon         from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarTodayIcon    from "@mui/icons-material/CalendarToday";
import PictureAsPdfIcon     from "@mui/icons-material/PictureAsPdf";
import TableChartIcon       from "@mui/icons-material/TableChart";
import ChevronLeftIcon      from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon     from "@mui/icons-material/ChevronRight";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const appointmentsData = [
  { id:1,  date:"30 Apr 2025 - 09:30 AM", patient:"Alberto Ripley",   pPhone:"+1 56556 54565", pColor:"#3b82f6",
    doctor:"Dr. Mick Thompson",   dRole:"Cardiologist",       dColor:"#3b82f6", dInitials:"MT",
    mode:"In-person", status:"Checked Out"  },
  { id:2,  date:"15 Apr 2025 - 11:20 AM", patient:"Susan Babin",      pPhone:"+1 65658 95654", pColor:"#ec4899",
    doctor:"Dr. Sarah Johnson",   dRole:"Orthopedic Surgeon", dColor:"#10b981", dInitials:"SJ",
    mode:"Online",    status:"Checked In"   },
  { id:3,  date:"02 Apr 2025 - 08:15 AM", patient:"Carol Lam",        pPhone:"+1 55654 56647", pColor:"#8b5cf6",
    doctor:"Dr. Emily Carter",    dRole:"Pediatrician",       dColor:"#8b5cf6", dInitials:"EC",
    mode:"In-Person", status:"Cancelled"    },
  { id:4,  date:"27 Mar 2025 - 02:00 PM", patient:"Marsha Noland",    pPhone:"+1 65668 54558", pColor:"#f59e0b",
    doctor:"Dr. David Lee",       dRole:"Gynecologist",       dColor:"#f59e0b", dInitials:"DL",
    mode:"In-person", status:"Schedule",  schedDate:"30 Apr 2025" },
  { id:5,  date:"12 Mar 2025 - 05:40 PM", patient:"Irma Armstrong",   pPhone:"+1 45214 66568", pColor:"#ef4444",
    doctor:"Dr. Anna Kim",        dRole:"Psychiatrist",       dColor:"#0d9488", dInitials:"AK",
    mode:"Online",    status:"Confirmed"    },
  { id:6,  date:"24 Feb 2025 - 09:20 AM", patient:"Ezra Belcher",     pPhone:"+1 65895 41247", pColor:"#6366f1",
    doctor:"Dr. John Smith",      dRole:"Neurosurgeon",       dColor:"#ef4444", dInitials:"JS",
    mode:"In-Person", status:"Cancelled"    },
  { id:7,  date:"16 Feb 2025 - 11:40 AM", patient:"Glen Lentz",       pPhone:"+1 62458 45845", pColor:"#0d9488",
    doctor:"Dr. Lisa White",      dRole:"Oncologist",         dColor:"#ec4899", dInitials:"LW",
    mode:"Online",    status:"Confirmed"    },
  { id:8,  date:"01 Feb 2025 - 04:00 PM", patient:"Bernard Griffith", pPhone:"+1 61422 45214", pColor:"#f59e0b",
    doctor:"Dr. Patricia Brown",  dRole:"Pulmonologist",      dColor:"#6366f1", dInitials:"PB",
    mode:"Online",    status:"Checked Out"  },
  { id:9,  date:"25 Jan 2025 - 03:10 PM", patient:"John Elsass",      pPhone:"+1 47851 26371", pColor:"#3b82f6",
    doctor:"Dr. Rachel Green",    dRole:"Urologist",          dColor:"#14b8a6", dInitials:"RG",
    mode:"Online",    status:"Schedule",  schedDate:"30 Apr 2025" },
  { id:10, date:"12 Jan 2025 - 03:10 PM", patient:"John Albert",      pPhone:"+1 47851 35267", pColor:"#10b981",
    doctor:"Dr. Michael Smith",   dRole:"Cardiologist",       dColor:"#f59e0b", dInitials:"MS",
    mode:"In-Person", status:"Cancelled"    },
];

const SORT_OPTIONS = ["Recently Added","Ascending","Descending","Last Month","Last 7 Days"];

// Calendar events for display
const CAL_EVENTS = {
  "2026-03-08": [{ label:"Alberto R.", color:"blue" }],
  "2026-03-10": [{ label:"Susan B.",  color:"green" }],
  "2026-03-12": [{ label:"Carol L.",  color:"red" }, { label:"Marsha N.", color:"orange" }],
  "2026-03-15": [{ label:"Irma A.",   color:"purple" }],
  "2026-03-18": [{ label:"Ezra B.",   color:"blue" }],
  "2026-03-22": [{ label:"Glen L.",   color:"green" }],
  "2026-03-25": [{ label:"Bernard G.", color:"orange" }],
  "2026-03-28": [{ label:"John E.",   color:"blue" }, { label:"John A.", color:"red" }],
};

const WEEK_EVENTS = {
  1: { day: 0, hour: 9,  label: "Alberto R. - Dr. Mick", color: "blue"   },
  2: { day: 1, hour: 11, label: "Susan B. - Dr. Sarah",  color: "green"  },
  3: { day: 3, hour: 14, label: "Carol L. - Dr. Emily",  color: "purple" },
  4: { day: 5, hour: 10, label: "Marsha N. - Dr. David", color: "orange" },
};

const STATUS_CLASS = (s) => {
  const m = { "checked out":"checked-out","checked in":"checked-in","cancelled":"cancelled","schedule":"schedule","confirmed":"confirmed" };
  return m[s.toLowerCase()] || "confirmed";
};

function useOutsideClick(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function FilterPanel({ onClose }) {
  const [f, setF] = useState({ patient:"", doctor:"", designation:"", mode:"", date:"", status:"" });
  const set = (k,v) => setF(p => ({ ...p, [k]: v }));

  return (
    <>
      <div className="filter-overlay" onClick={onClose} />
      <div className="filter-panel">
        <div className="fp-header">
          <span className="fp-title">Filter</span>
          <span className="fp-clear" onClick={() => setF({ patient:"", doctor:"", designation:"", mode:"", date:"", status:"" })}>Clear All</span>
        </div>
        <div className="fp-body">
          {[
            { key:"patient",     label:"Patient",     opts:["Alberto Ripley","Susan Babin","Carol Lam","Marsha Noland"] },
            { key:"doctor",      label:"Doctor",      opts:["Dr. Mick Thompson","Dr. Sarah Johnson","Dr. Emily Carter","Dr. David Lee"] },
            { key:"designation", label:"Designation", opts:["Cardiologist","Orthopedic Surgeon","Pediatrician","Gynecologist"] },
            { key:"mode",        label:"Mode",        opts:["In-person","Online","In-Person"] },
            { key:"status",      label:"Status",      opts:["Checked Out","Checked In","Cancelled","Schedule","Confirmed"] },
          ].map(({ key, label, opts }) => (
            <div className="fp-group" key={key}>
              <div className="fp-label">
                {label}
                <span className="fp-reset" onClick={() => set(key, "")}>Reset</span>
              </div>
              <div className="fp-select-wrap">
                <select value={f[key]} onChange={e => set(key, e.target.value)}>
                  <option value="">Select</option>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          ))}
          <div className="fp-group">
            <div className="fp-label">
              Date *
              <span className="fp-reset" onClick={() => set("date","")}>Reset</span>
            </div>
            <input
              type="text"
              className="fp-date-range"
              placeholder="03/02/2026 - 03/08/2026"
              value={f.date}
              onChange={e => set("date", e.target.value)}
            />
          </div>
        </div>
        <div className="fp-footer">
          <button className="btn-close" onClick={onClose}>Close</button>
          <button className="btn-apply" onClick={onClose}>Filter</button>
        </div>
      </div>
    </>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEK_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8AM–7PM

function CalendarView() {
  const today = new Date(2026, 2, 8); // March 8 2026
  const [calView, setCalView]   = useState("month");
  const [current, setCurrent]   = useState({ year: 2026, month: 2 }); // March (0-indexed)

  const goToday = () => setCurrent({ year: 2026, month: 2 });
  const goPrev  = () => setCurrent(({ year, month }) => month === 0  ? { year: year-1, month: 11 } : { year, month: month-1 });
  const goNext  = () => setCurrent(({ year, month }) => month === 11 ? { year: year+1, month: 0  } : { year, month: month+1 });

  // Build month grid
  const buildMonthDays = () => {
    const { year, month } = current;
    const first = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays    = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = first - 1; i >= 0; i--) cells.push({ day: prevDays - i, cur: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true });
    while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - first + 1, cur: false });

    return cells;
  };

  const cells = buildMonthDays();
  const { year, month } = current;

  const isToday = (day, cur) => cur && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const getDateKey = (day) => `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  // Current week start (for week view)
  const weekStart = new Date(2026, 2, 8); // Sunday of current week
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  return (
    <>
      {/* Calendar nav toolbar */}
      <div className="cal-toolbar">
        <div className="cal-nav">
          <button className="btn-today" onClick={goToday}>today</button>
          <button className="btn-arrow" onClick={goPrev}><ChevronLeftIcon /></button>
          <button className="btn-arrow" onClick={goNext}><ChevronRightIcon /></button>
          <span className="cal-month-label">
            {MONTHS[month]} {year}
          </span>
        </div>
        <div className="cal-view-tabs">
          {["month","week","day"].map(v => (
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
            {WEEK_DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map((cell, i) => {
              const key = cell.cur ? getDateKey(cell.day) : null;
              const events = key ? (CAL_EVENTS[key] || []) : [];
              return (
                <div key={i} className={`cal-cell ${!cell.cur ? "other-month" : ""} ${isToday(cell.day, cell.cur) ? "today" : ""}`}>
                  <div className="cal-date">{cell.day}</div>
                  {events.map((ev, j) => (
                    <div key={j} className={`cal-event ${ev.color}`}>{ev.label}</div>
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
              {HOURS.map(h => (
                <div key={h} className="wg-time-slot">
                  {h > 12 ? `${h-12} PM` : h === 12 ? "12 PM" : `${h} AM`}
                </div>
              ))}
            </div>
            {/* Day columns */}
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + i);
              const isT = d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
              return (
                <div key={i} className="wg-day-col">
                  <div className={`wg-day-header ${isT ? "today-col" : ""}`}>
                    {WEEK_DAYS[i]}
                    <div className={`wg-date ${isT ? "today-date" : ""}`}>{d.getDate()}</div>
                  </div>
                  {HOURS.map(h => {
                    const ev = Object.values(WEEK_EVENTS).find(e => e.day === i && e.hour === h);
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
              {HOURS.map(h => (
                <div key={h} className="dg-slot">
                  {h > 12 ? `${h-12} PM` : h === 12 ? "12 PM" : `${h} AM`}
                </div>
              ))}
            </div>
            <div className="dg-event-col">
              {HOURS.map(h => {
                const ev = h === 9 ? { label: "Alberto Ripley - Dr. Mick Thompson (In-person)" } : null;
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

  const [view,         setView]         = useState("list");
  const [search,       setSearch]       = useState("");
  const [showFilter,   setShowFilter]   = useState(false);
  const [exportOpen,   setExportOpen]   = useState(false);
  const [sortOpen,     setSortOpen]     = useState(false);
  const [sortVal,      setSortVal]      = useState("Recently Added");
  const [openMenu,     setOpenMenu]     = useState(null);
  const [rowsPerPage,  setRowsPerPage]  = useState(10);
  const [page,         setPage]         = useState(1);

  const exportRef = useRef();
  const sortRef   = useRef();

  useOutsideClick(exportRef, () => setExportOpen(false));
  useOutsideClick(sortRef,   () => setSortOpen(false));

  useEffect(() => {
    const h = () => setOpenMenu(null);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = appointmentsData
    .filter(a =>
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase()) ||
      a.mode.toLowerCase().includes(search.toLowerCase()) ||
      a.status.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortVal === "Ascending")  return a.patient.localeCompare(b.patient);
      if (sortVal === "Descending") return b.patient.localeCompare(a.patient);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const pageData   = filtered.slice((page-1)*rowsPerPage, page*rowsPerPage);

  return (
    <div className="appointments-page">

      {/* ── Page Top ── */}
      <div className="page-top">
        <h1>Appointment</h1>
        <div className="page-actions">
          {/* Export */}
          <div className="export-wrap" ref={exportRef}>
            <button className="btn-export" onClick={() => setExportOpen(o => !o)}>
              Export <KeyboardArrowDownIcon />
            </button>
            {exportOpen && (
              <div className="dropdown-menu">
                <div className="dd-item"><PictureAsPdfIcon style={{ color:"#ef4444" }} /> Download as PDF</div>
                <div className="dd-item"><TableChartIcon  style={{ color:"#10b981" }} /> Download as Excel</div>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="view-toggle">
            <button className={`vt-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")} title="List">
              <ViewListIcon />
            </button>
            <button className={`vt-btn ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")} title="Calendar">
              <CalendarMonthIcon />
            </button>
          </div>

          <button className="btn-new" onClick={() => navigate("/appointments/new")}>
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
              onChange={e => setSearch(e.target.value)}
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
            <button className="btn-sort" onClick={() => setSortOpen(o => !o)}>
              Sort By : {sortVal} <KeyboardArrowDownIcon />
            </button>
            {sortOpen && (
              <div className="dropdown-menu">
                {SORT_OPTIONS.map(opt => (
                  <div
                    key={opt}
                    className={`dd-item ${sortVal === opt ? "active" : ""}`}
                    onClick={() => { setSortVal(opt); setSortOpen(false); }}
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
              {pageData.map(appt => (
                <tr key={appt.id}>
                  <td style={{ fontWeight: 500, color: "#1e293b" }}>{appt.date}</td>

                  {/* Patient → patient details */}
                  <td onClick={() => navigate(`/patients/${appt.id}`)}>
                    <div className="person-cell">
                      <div className="p-avatar" style={{ background: appt.pColor+"22", color: appt.pColor }}>
                        {appt.patient.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <div className="p-name">{appt.patient}</div>
                        <div className="p-sub">{appt.pPhone}</div>
                      </div>
                    </div>
                  </td>

                  {/* Doctor → doctor details */}
                  <td onClick={() => navigate(`/doctors/${appt.id}`)}>
                    <div className="person-cell">
                      <div className="p-avatar" style={{ background: appt.dColor+"22", color: appt.dColor }}>
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
                    <span className={`appt-status ${STATUS_CLASS(appt.status)}`}>
                      {appt.status === "Schedule" && appt.schedDate
                        ? appt.schedDate
                        : appt.status}
                    </span>
                  </td>

                  {/* 3-dot */}
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row-ctx">
                      <button
                        className="icon-btn"
                        onClick={() => setOpenMenu(openMenu === appt.id ? null : appt.id)}
                      >
                        <MoreVertIcon />
                      </button>
                      {openMenu === appt.id && (
                        <div className="ctx-menu">
                          <div className="ctx-item">Edit</div>
                          <div className="ctx-item">View</div>
                          <div className="ctx-item danger">Delete</div>
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
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
                {[5,10,15,20].map(r => <option key={r}>{r}</option>)}
              </select>
              Entries
            </div>
            <div className="page-nav">
              <button className="pg-btn" onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}>
                <ChevronLeftIcon />
              </button>
              {Array.from({ length: totalPages }, (_,i) => i+1).map(p => (
                <button key={p} className={`pg-btn ${page===p?"active":""}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="pg-btn" onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CALENDAR VIEW ══ */}
      {view === "calendar" && <CalendarView />}

      {/* Filter Panel */}
      {showFilter && <FilterPanel onClose={() => setShowFilter(false)} />}
    </div>
  );
}