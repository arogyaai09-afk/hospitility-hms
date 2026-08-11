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
import CloseIcon from "@mui/icons-material/Close";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const doctorsData = [
  { id: 1, name: "Dr. Mick Thompson",  role: "Cardiologist",       dept: "Cardiology",   phone: "+1 54554 54584", email: "mick@example.com",     fee: 458,  status: "Available",   avail: "Mon, 20 Jan 2025", color: "#3b82f6" },
  { id: 2, name: "Dr. Sarah Johnson",  role: "Orthopedic Surgeon", dept: "Orthopedics",  phone: "+1 43554 54584", email: "sarah@example.com",    fee: 512,  status: "Available",   avail: "Wed, 22 Jan 2025", color: "#10b981" },
  { id: 3, name: "Dr. Emily Carter",   role: "Pediatrician",       dept: "Pediatrics",   phone: "+1 47554 54585", email: "emily@example.com",    fee: 635,  status: "Available",   avail: "Fri, 24 Jan 2025", color: "#8b5cf6" },
  { id: 4, name: "Dr. David Lee",      role: "Gynecologist",       dept: "Gynecology",   phone: "+1 54114 54586", email: "david@example.com",    fee: 478,  status: "Available",   avail: "Tue, 21 Jan 2025", color: "#f59e0b" },
  { id: 5, name: "Dr. Anna Kim",       role: "Psychiatrist",       dept: "Psychiatry",   phone: "+1 51247 54587", email: "anna@example.com",     fee: 550,  status: "Available",   avail: "Mon, 27 Jan 2025", color: "#0d9488" },
  { id: 6, name: "Dr. John Smith",     role: "Neurosurgeon",       dept: "Neurology",    phone: "+1 41452 54588", email: "john@example.com",     fee: 703,  status: "Unavailable", avail: "Thu, 30 Jan 2025", color: "#ef4444" },
  { id: 7, name: "Dr. Lisa White",     role: "Oncologist",         dept: "Oncology",     phone: "+1 51425 54589", email: "lisa@example.com",     fee: 420,  status: "Available",   avail: "Sat, 25 Jan 2025", color: "#ec4899" },
  { id: 8, name: "Dr. Patricia Brown", role: "Pulmonologist",      dept: "Pulmonology",  phone: "+1 62458 45845", email: "patricia@example.com", fee: 390,  status: "Available",   avail: "Sun, 01 Feb 2025", color: "#6366f1" },
  { id: 9, name: "Dr. Rachel Green",   role: "Urologist",          dept: "Urology",      phone: "+1 61422 45214", email: "rachel@example.com",   fee: 470,  status: "Available",   avail: "Tue, 28 Jan 2025", color: "#14b8a6" },
];

const SORT_OPTIONS = [
  { label: "Recently Added", value: "recent" },
  { label: "Ascending",      value: "asc"    },
  { label: "Descending",     value: "desc"   },
  { label: "Last Month",     value: "month"  },
  { label: "Last 7 Days",    value: "week"   },
];

// ── AVATAR PLACEHOLDER ────────────────────────────────────────────────────────
function Avatar({ name, color, size = 38 }) {
  const initials = name.split(" ").slice(1, 3).map(w => w[0]).join("");
  return (
    <div
      className="doc-avatar"
      style={{
        width: size, height: size,
        background: color + "22",
        color: color,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: size * 0.34,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ── OUTSIDE CLICK HOOK ────────────────────────────────────────────────────────
function useOutsideClick(ref, cb) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

// ── FILTER PANEL ──────────────────────────────────────────────────────────────
function FilterPanel({ onClose }) {
  const [filters, setFilters] = useState({
    doctor: ["Dr. Mick Thompson"],
    designation: ["Cardiologist"],
    department: ["Cardiology"],
    date: "",
    amount: ["$501 - $1000"],
    status: ["Available"],
  });

  const removeTag = (key, val) =>
    setFilters(f => ({ ...f, [key]: f[key].filter(t => t !== val) }));
  const resetGroup = (key) =>
    setFilters(f => ({ ...f, [key]: Array.isArray(f[key]) ? [] : "" }));
  const clearAll = () =>
    setFilters({ doctor: [], designation: [], department: [], date: "", amount: [], status: [] });

  const TagInput = ({ groupKey }) => (
    <div className="fp-tag-input">
      {(filters[groupKey] || []).map(tag => (
        <span className="fp-tag" key={tag}>
          {tag}
          <span className="fp-tag-remove" onClick={() => removeTag(groupKey, tag)}>×</span>
        </span>
      ))}
    </div>
  );

  return (
    <>
      <div className="filter-overlay" onClick={onClose} />
      <div className="filter-panel">
        {/* Header */}
        <div className="fp-header">
          <span className="fp-title">Filter</span>
          <span className="fp-clear" onClick={clearAll}>Clear All</span>
        </div>

        {/* Body */}
        <div className="fp-body">
          {[
            { key: "doctor",      label: "Doctor"      },
            { key: "designation", label: "Designation" },
            { key: "department",  label: "Department"  },
            { key: "amount",      label: "Amount"      },
            { key: "status",      label: "Status"      },
          ].map(({ key, label }) => (
            <div className="fp-group" key={key}>
              <div className="fp-label">
                {label}
                <span className="fp-reset" onClick={() => resetGroup(key)}>Reset</span>
              </div>
              <TagInput groupKey={key} />
            </div>
          ))}

          {/* Date */}
          <div className="fp-group">
            <div className="fp-label">
              Date *
              <span className="fp-reset" onClick={() => resetGroup("date")}>Reset</span>
            </div>
            <input
              type="date"
              className="fp-date-input"
              value={filters.date}
              onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="fp-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-apply" onClick={onClose}>Apply Filter</button>
        </div>
      </div>
    </>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Doctors() {
  const navigate = useNavigate();
  const [view, setView]             = useState("list");      // "list" | "grid"
  const [search, setSearch]         = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [sortOpen, setSortOpen]     = useState(false);
  const [sortVal, setSortVal]       = useState("recent");
  const [exportOpen, setExportOpen] = useState(false);
  const [openMenu, setOpenMenu]     = useState(null);        // row id for 3-dot menu

  const sortRef   = useRef();
  const exportRef = useRef();
  const menuRef   = useRef();

  useOutsideClick(sortRef,   () => setSortOpen(false));
  useOutsideClick(exportRef, () => setExportOpen(false));

  // close row menu on outside click
  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter + sort logic
  const filtered = doctorsData
    .filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.role.toLowerCase().includes(search.toLowerCase()) ||
      d.dept.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortVal === "asc")  return a.name.localeCompare(b.name);
      if (sortVal === "desc") return b.name.localeCompare(a.name);
      return 0;
    });

  const sortLabel = SORT_OPTIONS.find(o => o.value === sortVal)?.label || "Recent";

  return (
    <div className="doctors-page">

      {/* ── Page Top ── */}
      <div className="page-top">
        <div className="page-title-wrap">
          <h1>{view === "grid" ? "Doctor Grid" : "Doctor List"}</h1>
          <span className="total-badge">Total Doctors : {filtered.length}</span>
        </div>

        <div className="page-actions">
          {/* Export — shown on grid view */}
          {view === "grid" && (
            <div className="export-dropdown-wrap" ref={exportRef}>
              <button className="btn-filter" onClick={() => setExportOpen(o => !o)}>
                <FilterListIcon /> Filters
              </button>
            </div>
          )}

          {/* Export — shown on list view */}
          {view === "list" && (
            <div className="export-dropdown-wrap" ref={exportRef}>
              <button className="btn-export" onClick={() => setExportOpen(o => !o)}>
                Export <KeyboardArrowDownIcon />
              </button>
              {exportOpen && (
                <div className="dropdown-menu">
                  <div className="dd-item"><PictureAsPdfIcon style={{ color: "#ef4444" }} /> Download as PDF</div>
                  <div className="dd-item"><TableChartIcon style={{ color: "#10b981" }} /> Download as Excel</div>
                </div>
              )}
            </div>
          )}

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

          <button className="btn-new" onClick={() => {}}>
            <AddIcon /> New Doctor
          </button>
        </div>
      </div>

      {/* ── Toolbar (list only) ── */}
      {view === "list" && (
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-input-wrap">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="toolbar-right">
            <button className="btn-filter-sm" onClick={() => setShowFilter(true)}>
              <FilterListIcon /> Filters
            </button>

            {/* Sort By */}
            <div className="sort-dropdown-wrap" ref={sortRef}>
              <button className="btn-sort" onClick={() => setSortOpen(o => !o)}>
                Sort By : {sortLabel} <KeyboardArrowDownIcon />
              </button>
              {sortOpen && (
                <div className="dropdown-menu">
                  {SORT_OPTIONS.map(opt => (
                    <div
                      key={opt.value}
                      className={`dd-item ${sortVal === opt.value ? "active" : ""}`}
                      onClick={() => { setSortVal(opt.value); setSortOpen(false); }}
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

      {/* ── LIST VIEW ── */}
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
              {filtered.map(doc => (
                <tr
                  key={doc.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/doctors/${doc.id}`)}
                >
                  <td>
                    <div className="doc-name-cell">
                      <Avatar name={doc.name} color={doc.color} size={38} />
                      <div>
                        <div className="doc-name">{doc.name}</div>
                        <div className="doc-role">{doc.role}</div>
                      </div>
                    </div>
                  </td>
                  <td>{doc.dept}</td>
                  <td>{doc.phone}</td>
                  <td>{doc.email}</td>
                  <td><span className="fee-val">${doc.fee}</span></td>
                  <td>
                    <span className={`status-badge ${doc.status.toLowerCase()}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row-actions">
                      {/* Calendar icon */}
                      <button className="icon-btn" title="Schedule">
                        <CalendarTodayIcon />
                      </button>
                      {/* 3-dot menu */}
                      <div
                        className="context-menu-wrap"
                        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === doc.id ? null : doc.id); }}
                      >
                        <button className="icon-btn">
                          <MoreVertIcon />
                        </button>
                        {openMenu === doc.id && (
                          <div className="context-menu">
                            <div className="cm-item">Edit</div>
                            <div className="cm-item danger">Delete</div>
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

      {/* ── GRID VIEW ── */}
      {view === "grid" && (
        <div className="doctors-grid-wrap">
          {filtered.map(doc => (
            <GridCard
              key={doc.id}
              doc={doc}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              onCardClick={() => navigate(`/doctors/${doc.id}`)}
            />
          ))}
        </div>
      )}

      {/* ── FILTER PANEL ── */}
      {showFilter && <FilterPanel onClose={() => setShowFilter(false)} />}
    </div>
  );
}

// ── GRID CARD ─────────────────────────────────────────────────────────────────
function GridCard({ doc, openMenu, setOpenMenu, onCardClick }) {
  return (
    <div className="doctor-grid-card" onClick={onCardClick} style={{ cursor: "pointer" }}>
      {/* Left image area */}
      <div className="card-img" style={{ background: doc.color + "18" }}>
        <div className="img-placeholder" style={{ color: doc.color }}>
          {doc.name.split(" ").slice(1, 3).map(w => w[0]).join("")}
        </div>
      </div>

      {/* Info */}
      <div className="card-body">
        <div className="card-name">{doc.name}</div>
        <div className="card-spec">{doc.role}</div>
        <div className="card-avail">
          Available : <span>{doc.avail}</span>
        </div>
        <div className="card-fee">
          Starts From : <span>${doc.fee}</span>
        </div>

        {/* Calendar btn */}
        <button className="card-cal-btn">
          <CalendarTodayIcon />
        </button>
      </div>

      {/* 3-dot menu */}
      <div
        style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === doc.id ? null : doc.id); }}
      >
        <button className="card-menu-btn">
          <MoreVertIcon />
        </button>
        {openMenu === doc.id && (
          <div className="card-context-menu">
            <div className="cm-item">Edit</div>
            <div className="cm-item danger">Delete</div>
          </div>
        )}
      </div>
    </div>
  );
}